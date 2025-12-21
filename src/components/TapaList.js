import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, query, where, getDocs } from "firebase/firestore";
import TapaCard from "./TapaCard";
import "../styles/TapaList.css"; // Asegúrate que la ruta sea correcta

const TapaList = () => {
  const [tapas, setTapas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Escuchar cambios en las tapas en tiempo real
    const tapasCol = collection(db, "tapas");
    const unsubscribe = onSnapshot(tapasCol, async (snapshot) => {
      try {
        // Obtener tapas con sus valoraciones para ordenarlas
        const tapasPromises = snapshot.docs.map(async (doc) => {
          const tapaId = doc.id;
          
          // Obtener votos para calcular la media
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
        
        // Ordenar por media descendente
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

  // Calcular estadísticas
  const totalVotos = tapas.reduce((acc, tapa) => acc + (tapa.numVotos || 0), 0);
  const mediaGeneral = tapas.length > 0 
    ? (tapas.reduce((acc, tapa) => acc + (tapa.media || 0), 0) / tapas.length).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div className="tapas-container">
        <div className="tapas-loading">
          <div className="tapas-loading-spinner">⏳</div>
          <h3>Cargando tapas deliciosas...</h3>
          <p>Preparando el concurso gastronómico</p>
        </div>
      </div>
    );
  }

  if (tapas.length === 0) {
    return (
      <div className="tapas-container">
        <div className="tapas-vacio">
          <div className="tapas-vacio-icono">🍽️</div>
          <h3>Todavía no hay tapas en el concurso</h3>
          <p>Sé el primero en participar y comparte tu mejor creación culinaria con nosotros</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tapas-container">
      {/* Header profesional con título y estadísticas */}
      <div className="tapas-header">
        <h2>🍴 Tapas Concursantes</h2>
        <p>Descubre y vota por las mejores creaciones culinarias de nuestros participantes</p>
        
        <div className="tapas-stats">
          <div className="stat-badge">
            <span className="stat-badge-icon">🏆</span>
            <span className="stat-badge-text">Total de tapas:</span>
            <span className="stat-badge-number">{tapas.length}</span>
          </div>
          <div className="stat-badge">
            <span className="stat-badge-icon">⭐</span>
            <span className="stat-badge-text">Votos totales:</span>
            <span className="stat-badge-number">{totalVotos}</span>
          </div>
          <div className="stat-badge">
            <span className="stat-badge-icon">📊</span>
            <span className="stat-badge-text">Media general:</span>
            <span className="stat-badge-number">{mediaGeneral}</span>
          </div>
        </div>
      </div>

      {/* Grid de tarjetas */}
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