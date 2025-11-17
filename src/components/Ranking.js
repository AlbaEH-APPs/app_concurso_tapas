import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";

// Función para renderizar estrellas según la media
const renderStars = (media) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (media >= i) {
      stars.push(<span key={i} style={{ color: "#FFD700", fontSize: "18px" }}>★</span>);
    } else if (media >= i - 0.5) {
      stars.push(<span key={i} style={{ color: "#FFD700", fontSize: "18px" }}>☆</span>); // media estrella
    } else {
      stars.push(<span key={i} style={{ color: "#ccc", fontSize: "18px" }}>★</span>);
    }
  }
  return stars;
};

const Ranking = () => {
  const [ranking, setRanking] = useState([]);

  useEffect(() => {
    // Escuchar cambios en la colección "tapas"
    const tapasCol = collection(db, "tapas");
    const unsubscribeTapas = onSnapshot(tapasCol, async (tapasSnapshot) => {
      const tapasData = [];

      for (const tapaDoc of tapasSnapshot.docs) {
        const tapaId = tapaDoc.id;
        // Escuchar los votos de esta tapa en tiempo real
        const votosQuery = query(collection(db, "votos"), where("tapaId", "==", tapaId));
        
        // Para cada tapa, suscribimos un snapshot temporal para calcular la media
        const votosSnapshot = await new Promise((resolve) => {
          const unsub = onSnapshot(votosQuery, (snapshot) => {
            resolve(snapshot);
            unsub(); // desuscribimos inmediatamente, solo queremos la snapshot inicial
          });
        });

        const votosData = votosSnapshot.docs.map(doc => doc.data().puntuacion);
        const suma = votosData.reduce((acc, val) => acc + val, 0);
        const media = votosData.length ? (suma / votosData.length) : 0;

        tapasData.push({
          id: tapaId,
          nombre: tapaDoc.data().nombre,
          descripcion: tapaDoc.data().descripcion,
          fotoURL: tapaDoc.data().fotoURL,
          media,
          numVotos: votosData.length
        });
      }

      // Ordenamos por media descendente
      tapasData.sort((a, b) => b.media - a.media);
      setRanking(tapasData);
    });

    return () => unsubscribeTapas();
  }, []);

  return (
    <div className="ranking-container">
      {ranking.map((tapa, index) => (
        <div key={tapa.id} className="ranking-item" style={{ marginBottom: "15px", border: "1px solid #ccc", padding: "10px", borderRadius: "5px" }}>
          <span style={{ fontWeight: "bold" }}>{index + 1}. {tapa.nombre}</span>
          {tapa.fotoURL && (
            <img src={tapa.fotoURL} alt={tapa.nombre} style={{ maxWidth: "200px", display: "block", marginTop: "5px", borderRadius: "5px" }} />
          )}
          <div style={{ marginTop: "5px" }}>
            {renderStars(tapa.media)}
            <span style={{ marginLeft: "5px", fontSize: "14px", color: "#555" }}>
              ({tapa.media.toFixed(1)} / 5 de {tapa.numVotos} voto{tapa.numVotos !== 1 ? "s" : ""})
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Ranking;
