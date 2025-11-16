import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import VotarTapa from "./VotarTapa";

const TapaCard = ({ tapa }) => {
  const [votos, setVotos] = useState(0);

  useEffect(() => {
    const q = query(collection(db, "votos"), where("tapaId", "==", tapa.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setVotos(snapshot.docs.length);
    });
    return () => unsubscribe();
  }, [tapa.id]);

  // Función para actualizar votos tras votar
  const handleVoto = () => {
    setVotos(prev => prev + 1);
  };

  return (
    <div className="tapa-card">
      <h3>{tapa.nombre}</h3>
      <p>{tapa.descripcion}</p>
      {tapa.fotoURL && <img src={tapa.fotoURL} alt={tapa.nombre} />}
      <p>Votos: {votos}</p>
      <VotarTapa tapaId={tapa.id} onVoto={handleVoto} />
    </div>
  );
};

export default TapaCard;
