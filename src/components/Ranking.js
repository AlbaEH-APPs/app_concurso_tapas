import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

const Ranking = () => {
  const [ranking, setRanking] = useState([]);

  useEffect(() => {
    const fetchRanking = async () => {
      const tapasSnapshot = await getDocs(collection(db, "tapas"));
      const tapasData = [];

      for (const tapaDoc of tapasSnapshot.docs) {
        const tapaId = tapaDoc.id;
        const votesSnapshot = await getDocs(
          query(collection(db, "votos"), where("tapaId", "==", tapaId))
        );
        tapasData.push({
          id: tapaId,
          nombre: tapaDoc.data().nombre,
          descripcion: tapaDoc.data().descripcion,
          fotoURL: tapaDoc.data().fotoURL,
          votos: votesSnapshot.docs.length
        });
      }

      tapasData.sort((a, b) => b.votos - a.votos);
      setRanking(tapasData);
    };

    fetchRanking();
  }, []);

  return (
    <div className="ranking-container">
      {ranking.map((tapa, index) => (
        <div key={tapa.id} className="ranking-item">
          <span>{index + 1}. {tapa.nombre}</span>
          <img src={tapa.fotoURL} alt={tapa.nombre} />
          <span>{tapa.votos} votos</span>
        </div>
      ))}
    </div>

  );
};

export default Ranking;
