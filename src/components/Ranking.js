import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { EDICION_ACTIVA } from "../ediciones.js";
import { IconoTrofeo } from "./Iconos";
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

const Ranking = ({ edicion = EDICION_ACTIVA }) => {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tapasCol = query(collection(db, "tapas"), where("edicion", "==", edicion));
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
  }, [edicion]);

  // Posiciones para el podio
  const medallas = ["1", "2", "3"];
  const clasesPodio = ["primero", "segundo", "tercero"];

  if (loading) {
    return (
      <div className="ranking-container" role="status" aria-label="Cargando ranking">
        <div className="sk-cabecera">
          <div className="sk sk-titulo"></div>
          <div className="sk sk-sub"></div>
        </div>
        <div className="ranking-podio">
          <div className="sk podio-item segundo" style={{ minHeight: 170 }}></div>
          <div className="sk podio-item primero" style={{ minHeight: 210 }}></div>
          <div className="sk podio-item tercero" style={{ minHeight: 150 }}></div>
        </div>
        <div className="sk-filas">
          <div className="sk sk-fila"></div>
          <div className="sk sk-fila"></div>
        </div>
      </div>
    );
  }

  if (ranking.length === 0) {
    return (
      <div className="ranking-container">
        <div className="ranking-vacio">
          <div className="ranking-vacio-icono"><IconoTrofeo size={30} /></div>
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
        <h2>Ranking de tapas</h2>
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