import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import VotarTapa from "./VotarTapa";
import { IMGBB_API_KEY_original } from "../config.js";
import "../styles/TapaCard.css";

const IMGBB_API_KEY = IMGBB_API_KEY_original;

const TapaCard = ({ tapa, posicion }) => {
  const [media, setMedia] = useState(0);
  const [numVotos, setNumVotos] = useState(0);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const votosQuery = query(collection(db, "votos"), where("tapaId", "==", tapa.id));
    const unsubscribe = onSnapshot(votosQuery, (snapshot) => {
      const votos = snapshot.docs.map(doc => doc.data().puntuacion || 0);
      const suma = votos.reduce((acc, val) => acc + val, 0);
      const mediaCalculada = votos.length ? suma / votos.length : 0;
      
      setMedia(mediaCalculada);
      setNumVotos(votos.length);
    });
    
    return () => unsubscribe();
  }, [tapa.id]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Selecciona una foto primero");

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      const uploadPromise = new Promise((resolve, reject) => {
        reader.onloadend = async () => {
          const base64Data = reader.result.split(",")[1];
          const formData = new FormData();
          formData.append("key", IMGBB_API_KEY);
          formData.append("image", base64Data);

          try {
            const response = await fetch("https://api.imgbb.com/1/upload", {
              method: "POST",
              body: formData,
            });
            const data = await response.json();
            if (data.success) resolve(data.data.url);
            else reject("Error subiendo la imagen");
          } catch (err) {
            reject(err);
          }
        };
      });

      const imageUrl = await uploadPromise;
      const tapaRef = doc(db, "tapas", tapa.id);
      await updateDoc(tapaRef, { fotoURL: imageUrl });

      tapa.fotoURL = imageUrl;
      setFile(null);
      setPreview(null);
    } catch (err) {
      console.error(err);
      alert("Error subiendo la imagen");
    } finally {
      setUploading(false);
    }
  };

  const renderEstrellas = () => {
    const estrellas = [];
    const mediaRedondeada = Math.round(media * 2) / 2;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= mediaRedondeada) {
        estrellas.push(<span key={i} className="star filled">★</span>);
      } else if (i - 0.5 === mediaRedondeada) {
        estrellas.push(<span key={i} className="star half">★</span>);
      } else {
        estrellas.push(<span key={i} className="star empty">☆</span>);
      }
    }
    
    return estrellas;
  };

  const getBadgeClass = () => {
    if (posicion === 1) return "tapa-badge oro";
    if (posicion === 2) return "tapa-badge plata";
    if (posicion === 3) return "tapa-badge bronce";
    return null;
  };

  const getBadgeEmoji = () => {
    if (posicion === 1) return "🥇";
    if (posicion === 2) return "🥈";
    if (posicion === 3) return "🥉";
    return null;
  };

  return (
    <div className="tapa-card">
      <div className="tapa-card-imagen">
        {tapa.fotoURL ? (
          <img src={tapa.fotoURL} alt={tapa.nombre} loading="lazy" />
        ) : (
          <div className="tapa-sin-imagen">🍽️</div>
        )}
        
        {posicion <= 3 && (
          <div className={getBadgeClass()}>
            <span>{getBadgeEmoji()}</span>
            <span>Posición {posicion}</span>
          </div>
        )}
      </div>

      <div className="tapa-card-contenido">
        <h3 className="tapa-card-nombre">{tapa.nombre}</h3>
        <p className="tapa-card-descripcion">{tapa.descripcion}</p>

        <div className="tapa-card-valoracion">
          <div className="tapa-estrellas">
            {renderEstrellas()}
          </div>
          
          <div className="tapa-puntuacion-box">
            <span className="tapa-puntuacion">{media.toFixed(1)}</span>
            <span className="tapa-num-votos">{numVotos} {numVotos === 1 ? 'voto' : 'votos'}</span>
          </div>
        </div>

        {!tapa.fotoURL && (
          <div className="tapa-upload-section">
            {!preview ? (
              <label htmlFor={`fileInput-${tapa.id}`} className="upload-label">
                <span className="upload-icon">📸</span>
                <span>Subir foto de la tapa</span>
              </label>
            ) : (
              <>
                <div className="upload-preview">
                  <img src={preview} alt="Vista previa" />
                </div>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="upload-btn"
                >
                  {uploading ? (
                    <>
                      <span className="spinner">⏳</span>
                      <span>Subiendo...</span>
                    </>
                  ) : (
                    <>
                      <span>✓</span>
                      <span>Confirmar foto</span>
                    </>
                  )}
                </button>
              </>
            )}
            
            <input
              id={`fileInput-${tapa.id}`}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="upload-input"
              disabled={uploading}
            />
          </div>
        )}

        <VotarTapa tapaId={tapa.id} />
      </div>
    </div>
  );
};

export default TapaCard;