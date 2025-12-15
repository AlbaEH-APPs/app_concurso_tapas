import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

// Función para renderizar estrellas según la media
const renderStars = (media) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (media >= i) {
      stars.push(<span key={i} style={{ color: "#FFD700", fontSize: "18px" }}>★</span>);
    } else if (media >= i - 0.5) {
      stars.push(<span key={i} style={{ color: "#FFD700", fontSize: "18px" }}>☆</span>);
    } else {
      stars.push(<span key={i} style={{ color: "#ccc", fontSize: "18px" }}>★</span>);
    }
  }
  return stars;
};

const Ranking = () => {
  const [ranking, setRanking] = useState([]);

  useEffect(() => {
    // Escuchar en tiempo real cambios en la colección "tapas"
    const tapasCol = collection(db, "tapas");
    const unsubscribeTapas = onSnapshot(tapasCol, async (tapasSnapshot) => {
      const tapasData = [];

      // Para cada tapa, escuchar los votos en tiempo real
      for (const tapaDoc of tapasSnapshot.docs) {
        const tapaId = tapaDoc.id;

        // Snapshot de votos en tiempo real para esta tapa
        const votosQuery = query(collection(db, "votos"), where("tapaId", "==", tapaId));
        const votosSnapshot = await new Promise((resolve) => {
          const unsub = onSnapshot(votosQuery, (snapshot) => {
            resolve(snapshot);
            unsub(); // Solo queremos la snapshot inicial aquí
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

      // Ordenar por media descendente
      tapasData.sort((a, b) => b.media - a.media);
      setRanking(tapasData);
    });

    return () => unsubscribeTapas();
  }, []);

  return (
    <div className="ranking-container">
      {ranking.map((tapa, index) => (
        <div
          key={tapa.id}
          className="ranking-item"
          style={{
            marginBottom: "10px",
            border: "1px solid #ccc",
            padding: "10px",
            borderRadius: "5px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <span style={{ fontWeight: "bold" }}>{index + 1}. {tapa.nombre}</span>
          <div style={{ display: "flex", alignItems: "center" }}>
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
