import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { IMGBB_API_KEY_original } from "../config.js";

const IMGBB_API_KEY = IMGBB_API_KEY_original;

const SubirFoto = () => {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null); // para mostrar previsualización
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre) return alert("El nombre de la tapa es obligatorio");

    setLoading(true);

    try {
      let fotoURL = "";

      if (file) {
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

              if (data.success) {
                resolve(data.data.url);
              } else {
                reject("Error subiendo la imagen a ImgBB");
              }
            } catch (err) {
              reject(err);
            }
          };
        });

        fotoURL = await uploadPromise;
      }

      await addDoc(collection(db, "tapas"), {
        nombre,
        descripcion,
        fotoURL,
        createdAt: Timestamp.now(),
      });

      setNombre("");
      setDescripcion("");
      setFile(null);
      setPreview(null);
      alert("Tapa subida con éxito!");
    } catch (error) {
      console.error("Error subiendo la tapa:", error);
      alert("Error subiendo la tapa");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="subir-form" onSubmit={handleSubmit}>
      <h2>Inscripción de Tapa</h2>

      <input
        type="text"
        placeholder="Nombre de la tapa"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        required
      />

      <textarea
        placeholder="Descripción o ingredientes"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
      />

      <div className="file-upload" style={{ margin: "10px 0" }}>
        <label
          htmlFor="fileInput"
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
          id="fileInput"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </div>

      {preview && (
        <div style={{ marginBottom: "10px" }}>
          <p>Vista previa:</p>
          <img
            src={preview}
            alt="Vista previa"
            style={{ maxWidth: "200px", borderRadius: "5px" }}
          />
        </div>
      )}

      <button type="submit" disabled={loading}>
        {loading ? "Subiendo..." : "Confirmar tapa"}
      </button>
    </form>
  );
};

export default SubirFoto;
