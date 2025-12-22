import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, query, where, getDocs } from "firebase/firestore";
import TapaCard from "./TapaCard";
import "../styles/TapaList.css";

const TapaList = () => {
  const [tapas, setTapas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tapasCol = collection(db, "tapas");
    const unsubscribe = onSnapshot(tapasCol, async (snapshot) => {
      try {
        const tapasPromises = snapshot.docs.map(async (doc) => {
          const tapaId = doc.id;
          
          const votosQuery = query(collection(db, "votos"), where("tapaId", "==", tapaId));
          const votosSnapshot = await getDocs(votosQuery);
          
          const votosData = votosSnapshot.docs.map(votoDoc => votoDoc.data().puntuacion || 0);
          const suma = votosData.reduce((acc, val) => acc + val, 0);
          const media = votosData.length ? (suma / votosData.length) : 0;
          
          return {
            id: tapaId,
            ...doc.data(),
            media,
            numVotos: votosData.length
          };
        });

        const tapasData = await Promise.all(tapasPromises);
        tapasData.sort((a, b) => b.media - a.media);
        
        setTapas(tapasData);
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar tapas:", error);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const totalVotos = tapas.reduce((acc, tapa) => acc + (tapa.numVotos || 0), 0);
  const mediaGeneral = tapas.length > 0 
    ? (tapas.reduce((acc, tapa) => acc + (tapa.media || 0), 0) / tapas.length).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div className="tapas-container">
        <div className="tapas-loading">
          <div className="loading-spinner"></div>
          <h3 className="loading-title">Cargando tapas deliciosas...</h3>
          <p className="loading-subtitle">Preparando el concurso gastronómico</p>
        </div>
      </div>
    );
  }

  if (tapas.length === 0) {
    return (
      <div className="tapas-container">
        <div className="tapas-vacio">
          <div className="tapas-vacio-icono">🍽️</div>
          <h3 className="tapas-vacio-titulo">Todavía no hay tapas en el concurso</h3>
          <p className="tapas-vacio-texto">Sé el primero en participar y comparte tu mejor creación culinaria</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tapas-container">
      <div className="tapas-header">
        <div className="tapas-header-content">
          <h2 className="tapas-titulo">Tapas Concursantes</h2>
          <p className="tapas-subtitulo">Descubre y vota por las mejores creaciones culinarias de nuestros participantes</p>
        </div>
        
        <div className="tapas-stats">
          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-content">
              <span className="stat-label">Total de tapas</span>
              <span className="stat-value">{tapas.length}</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <span className="stat-label">Votos totales</span>
              <span className="stat-value">{totalVotos}</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <span className="stat-label">Media general</span>
              <span className="stat-value">{mediaGeneral}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="tapa-list">
        {tapas.map((tapa, index) => (
          <TapaCard 
            key={tapa.id} 
            tapa={tapa} 
            posicion={index + 1}
          />
        ))}
      </div>
    </div>
  );
};

export default TapaList;