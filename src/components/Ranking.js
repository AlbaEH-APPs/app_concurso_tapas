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
    <div>
      <h2>🏆 Ranking de tapas</h2>
      {ranking.map((tapa, index) => (
        <div key={tapa.id} style={{ border: "1px solid #ccc", padding: 10, margin: 10 }}>
          <h3>{index + 1}. {tapa.nombre} ({tapa.votos} votos)</h3>
          <p>{tapa.descripcion}</p>
          {tapa.fotoURL && <img src={tapa.fotoURL} alt={tapa.nombre} width={150} />}
        </div>
      ))}
    </div>
  );
};

export default Ranking;
