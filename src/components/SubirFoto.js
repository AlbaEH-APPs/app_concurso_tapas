import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

const IMGBB_API_KEY = "3de816ea0bfc1b0cee4b79e58f1e3246"; // Pon aquí tu API key

const SubirFoto = () => {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !nombre) return alert("Nombre y foto son obligatorios");

    setLoading(true);

    try {
      // Convertir la imagen a base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64Data = reader.result.split(",")[1]; // quitar 'data:image/...;base64,'

        // Subir a ImgBB
        const formData = new FormData();
        formData.append("key", IMGBB_API_KEY);
        formData.append("image", base64Data);

        const response = await fetch("https://api.imgbb.com/1/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (data.success) {
          const fotoURL = data.data.url;

          // Guardar en Firestore
          await addDoc(collection(db, "tapas"), {
            nombre,
            descripcion,
            fotoURL,
            createdAt: Timestamp.now(),
          });

          setNombre("");
          setDescripcion("");
          setFile(null);
          alert("Tapa subida con éxito!");
        } else {
          alert("Error subiendo la imagen a ImgBB");
        }
        setLoading(false);
      };
    } catch (error) {
      console.error("Error subiendo la tapa:", error);
      alert("Error subiendo la tapa");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Nombre de la tapa"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Descripción o ingredientes"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? "Subiendo..." : "Subir tapa"}
      </button>
    </form>
  );
};

export default SubirFoto;
