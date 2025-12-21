import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import "../styles/Ranking.css";

// Función para renderizar estrellas según la media
const renderStars = (media) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (media >= i) {
      stars.push(<span key={i} className="star filled">★</span>);
    } else if (media >= i - 0.5) {
      stars.push(<span key={i} className="star half">☆</span>);
    } else {
      stars.push(<span key={i} className="star empty">★</span>);
    }
  }
  return stars;
};

const Ranking = () => {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tapasCol = collection(db, "tapas");
    const unsubscribeTapas = onSnapshot(tapasCol, async (tapasSnapshot) => {
      const tapasData = [];

      for (const tapaDoc of tapasSnapshot.docs) {
        const tapaId = tapaDoc.id;

        const votosQuery = query(collection(db, "votos"), where("tapaId", "==", tapaId));
        const votosSnapshot = await new Promise((resolve) => {
          const unsub = onSnapshot(votosQuery, (snapshot) => {
            resolve(snapshot);
            unsub();
          });
        });

        const votosData = votosSnapshot.docs.map(doc => doc.data().puntuacion);
        const suma = votosData.reduce((acc, val) => acc + val, 0);
        const media = votosData.length ? (suma / votosData.length) : 0;

        tapasData.push({
          id: tapaId,
          nombre: tapaDoc.data().nombre,
          media,
          numVotos: votosData.length
        });
      }

      tapasData.sort((a, b) => b.media - a.media);
      setRanking(tapasData);
      setLoading(false);
    });

    return () => unsubscribeTapas();
  }, []);

  // Medallas para el podio
  const medallas = ["🥇", "🥈", "🥉"];
  const clasesPodio = ["primero", "segundo", "tercero"];

  if (loading) {
    return (
      <div className="ranking-container">
        <div className="ranking-header">
          <h2>Cargando ranking...</h2>
        </div>
      </div>
    );
  }

  if (ranking.length === 0) {
    return (
      <div className="ranking-container">
        <div className="ranking-vacio">
          <div className="ranking-vacio-icono">🏆</div>
          <h3>Aún no hay tapas en el ranking</h3>
          <p>¡Sé el primero en votar!</p>
        </div>
      </div>
    );
  }

  // Top 3 para el podio
  const top3 = ranking.slice(0, 3);
  // Resto de tapas
  const resto = ranking.slice(3);

  return (
    <div className="ranking-container">
      <div className="ranking-header">
        <h2>🏆 Ranking de Tapas</h2>
        <p>Las mejores tapas según nuestros usuarios</p>
      </div>

      {/* Podio Top 3 */}
      {top3.length > 0 && (
        <div className="ranking-podio">
          {top3.map((tapa, index) => (
            <div key={tapa.id} className={`podio-item ${clasesPodio[index]}`}>
              <div className="podio-medalla">{medallas[index]}</div>
              <h3>{tapa.nombre}</h3>
              <div className="podio-estrellas">
                {renderStars(tapa.media)}
              </div>
              <div className="podio-puntuacion">
                {tapa.media.toFixed(1)}
              </div>
              <div className="podio-votos">
                {tapa.numVotos} voto{tapa.numVotos !== 1 ? "s" : ""}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lista del resto */}
      {resto.length > 0 && (
        <div className="ranking-lista">
          {resto.map((tapa, index) => (
            <div key={tapa.id} className="ranking-item">
              <div className="ranking-izquierda">
                <div className="ranking-posicion">{index + 4}</div>
                <div className="ranking-nombre">{tapa.nombre}</div>
              </div>
              <div className="ranking-derecha">
                <div className="ranking-estrellas">
                  {renderStars(tapa.media)}
                </div>
                <div className="ranking-stats">
                  <div className="ranking-puntuacion">
                    {tapa.media.toFixed(1)}
                  </div>
                  <div className="ranking-votos">
                    {tapa.numVotos} voto{tapa.numVotos !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Ranking;