import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import TapaCard from "./TapaCard";

const TapaList = () => {
  const [tapas, setTapas] = useState([]);

  useEffect(() => {
    const fetchTapas = async () => {
      const snapshot = await getDocs(collection(db, "tapas"));
      const tapasData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTapas(tapasData);
    };
    fetchTapas();
  }, []);

  return (
    <div>
      {tapas.map(tapa => (
        <TapaCard key={tapa.id} tapa={tapa} />
      ))}
    </div>
  );
};

export default TapaList;
