import { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";

const VotarTapa = ({ tapaId, onVoto }) => {
  const [votado, setVotado] = useState(false);
  const [userId] = useState(() => 
    localStorage.getItem("userId") || Math.random().toString(36).substr(2, 9)
  );

  useEffect(() => {
    // Guardamos el userId en localStorage
    localStorage.setItem("userId", userId);

    const checkVoto = async () => {
      try {
        const docRef = doc(db, "votos", `${userId}_${tapaId}`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setVotado(true);
      } catch (error) {
        console.error("Error comprobando el voto:", error);
      }
    };

    checkVoto();
  }, [tapaId, userId]);

  const votar = async () => {
    if (votado) return;
    try {
      const docRef = doc(db, "votos", `${userId}_${tapaId}`);
      await setDoc(docRef, {
        userId,
        tapaId,
        puntuacion: 1,
        votedAt: Timestamp.now()
      });
      setVotado(true);
      if (onVoto) onVoto(); // notificar al padre para actualizar votos
    } catch (error) {
      console.error("Error al votar:", error);
    }
  };

  return (
    <button 
      className="votar-btn" 
      onClick={votar} 
      disabled={votado}
    >
      {votado ? "Votado" : "Votar"}
    </button>
  );
};

export default VotarTapa;
