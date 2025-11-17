import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import VotarTapa from "./VotarTapa";
import { IMGBB_API_KEY_original } from "../config.js";

const IMGBB_API_KEY = IMGBB_API_KEY_original;

const TapaCard = ({ tapa }) => {
  const [votos, setVotos] = useState(0);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Escucha los votos en tiempo real
  useEffect(() => {
    const q = query(collection(db, "votos"), where("tapaId", "==", tapa.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setVotos(snapshot.docs.length);
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
            else reject("Error subiendo la imagen a ImgBB");
          } catch (err) {
            reject(err);
          }
        };
      });

      const imageUrl = await uploadPromise;

      // Actualizamos Firestore
      const tapaRef = doc(db, "tapas", tapa.id);
      await updateDoc(tapaRef, { fotoURL: imageUrl });

      // Actualizamos localmente
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

  return (
    <div className="tapa-card" style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "15px" }}>
      <h3>{tapa.nombre}</h3>
      <p>{tapa.descripcion}</p>

      {tapa.fotoURL ? (
        <img src={tapa.fotoURL} alt={tapa.nombre} style={{ maxWidth: "200px", borderRadius: "5px" }} />
      ) : (
        <div style={{ marginTop: "10px" }}>
          <div className="file-upload" style={{ marginBottom: "10px" }}>
            <label
              htmlFor={`fileInput-${tapa.id}`}
              style={{
                display: "inline-block",
                padding: "10px 20px",
                backgroundColor: "#4CAF50",
                color: "#fff",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              {file ? "Cambiar foto" : "Sube tu foto de la tapa"}
            </label>
            <input
              id={`fileInput-${tapa.id}`}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
              disabled={uploading}
            />
          </div>

          {preview && (
            <div style={{ marginBottom: "10px" }}>
              <p>Vista previa:</p>
              <img src={preview} alt="Vista previa" style={{ maxWidth: "200px", borderRadius: "5px" }} />
              <button
                onClick={handleUpload}
                disabled={uploading}
                style={{
                  display: "block",
                  marginTop: "5px",
                  padding: "10px 20px",
                  backgroundColor: "#4CAF50",
                  color: "#fff",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                {uploading ? "Subiendo..." : "Subir foto"}
              </button>
            </div>
          )}
        </div>
      )}

      <p>Votos: {votos}</p>
      <VotarTapa tapaId={tapa.id} />
    </div>
  );
};

export default TapaCard;
