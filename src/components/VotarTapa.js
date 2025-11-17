import { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, getDoc, setDoc, collection, query, where, onSnapshot, Timestamp } from "firebase/firestore";

// Función para renderizar estrellas rellenas según la media
const renderStars = (media) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (media >= i) {
      stars.push(<span key={i} style={{ color: "#FFD700", fontSize: "20px" }}>★</span>);
    } else if (media >= i - 0.5) {
      stars.push(<span key={i} style={{ color: "#FFD700", fontSize: "20px" }}>☆</span>);
    } else {
      stars.push(<span key={i} style={{ color: "#ccc", fontSize: "20px" }}>★</span>);
    }
  }
  return stars;
};

const VotarTapa = ({ tapaId }) => {
  const [votado, setVotado] = useState(false);
  const [puntuacion, setPuntuacion] = useState(0);
  const [hover, setHover] = useState(0);
  const [media, setMedia] = useState(0);
  const [numVotos, setNumVotos] = useState(0);

  const [userId] = useState(() =>
    localStorage.getItem("userId") || Math.random().toString(36).substr(2, 9)
  );

  useEffect(() => {
    localStorage.setItem("userId", userId);

    // Comprobar si el usuario ya votó
    const checkVoto = async () => {
      try {
        const docRef = doc(db, "votos", `${userId}_${tapaId}`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setVotado(true);
          setPuntuacion(docSnap.data().puntuacion);
        }
      } catch (error) {
        console.error("Error comprobando el voto:", error);
      }
    };
    checkVoto();

    // Escuchar todos los votos para calcular media en tiempo real
    const q = query(collection(db, "votos"), where("tapaId", "==", tapaId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const votosData = snapshot.docs.map(doc => doc.data().puntuacion);
      const suma = votosData.reduce((acc, val) => acc + val, 0);
      const promedio = votosData.length ? (suma / votosData.length) : 0;
      setMedia(promedio);
      setNumVotos(votosData.length);
    });

    return () => unsubscribe();
  }, [tapaId, userId]);

  const votar = async (valor) => {
    if (votado) return;
    try {
      const docRef = doc(db, "votos", `${userId}_${tapaId}`);
      await setDoc(docRef, {
        userId,
        tapaId,
        puntuacion: valor,
        votedAt: Timestamp.now()
      });
      setVotado(true);
      setPuntuacion(valor);
      // No necesitamos actualizar votos localmente; onSnapshot lo hará
    } catch (error) {
      console.error("Error al votar:", error);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Estrellas para que el usuario vote */}
      <div style={{ display: "flex", alignItems: "center" }}>
        {[1, 2, 3, 4, 5].map((num) => (
          <span
            key={num}
            style={{
              cursor: votado ? "default" : "pointer",
              color: num <= (hover || puntuacion) ? "#FFD700" : "#ccc",
              fontSize: "24px",
              marginRight: "5px",
            }}
            onClick={() => votar(num)}
            onMouseEnter={() => !votado && setHover(num)}
            onMouseLeave={() => !votado && setHover(0)}
          >
            ★
          </span>
        ))}
        {votado && <span style={{ marginLeft: "10px" }}>Puntuaste: {puntuacion}</span>}
      </div>

      {/* Media de todos los votos */}
      <div style={{ marginTop: "5px", fontSize: "14px", color: "#555", display: "flex", alignItems: "center" }}>
        {numVotos > 0 ? (
          <>
            {renderStars(media)}
            <span style={{ marginLeft: "5px" }}>({media.toFixed(1)} / 5 de {numVotos} voto{numVotos > 1 ? 's' : ''})</span>
          </>
        ) : (
          <span>Aún no hay votos</span>
        )}
      </div>
    </div>
  );
};

export default VotarTapa;
