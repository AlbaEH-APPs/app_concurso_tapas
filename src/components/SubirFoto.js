import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { IMGBB_API_KEY_original } from "../config.js";
import { EDICION_ACTIVA } from "../ediciones.js";
import { Aviso, IconoCamara, IconoX } from "./Iconos";
import "../styles/SubirFoto.css";

const IMGBB_API_KEY = IMGBB_API_KEY_original;

const SubirFoto = () => {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorForm, setErrorForm] = useState(""); // aviso en pantalla (antes: alert)
  const [errorFoto, setErrorFoto] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setErrorFoto("");

    if (selectedFile) {
      // Validar tamaño (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setErrorFoto("La imagen es demasiado grande. Máximo 5MB.");
        return;
      }

      // Validar tipo
      if (!selectedFile.type.startsWith('image/')) {
        setErrorFoto("Por favor, selecciona un archivo de imagen válido.");
        return;
      }

      setFile(selectedFile);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const removeImage = () => {
    setFile(null);
    setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorForm("");
    if (!nombre.trim()) {
      setErrorForm("El nombre de la tapa es obligatorio");
      return;
    }

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
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        fotoURL,
        createdAt: Timestamp.now(),
        edicion: EDICION_ACTIVA,
      });

      // Mostrar mensaje de éxito
      setShowSuccess(true);
      
      // Limpiar formulario
      setNombre("");
      setDescripcion("");
      setFile(null);
      setPreview(null);

      // Ocultar mensaje después de 3 segundos
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);

    } catch (error) {
      console.error("Error subiendo la tapa:", error);
      setErrorForm("Error subiendo la tapa. Por favor, inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="subir-foto-container">
      {showSuccess && (
        <div className="success-message">
          <Aviso tipo="exito">Tapa inscrita con éxito</Aviso>
        </div>
      )}

      <form className="subir-form" onSubmit={handleSubmit}>
        <div className="subir-form-cabecera">
          <h2>Inscripción de tapa</h2>
          <p className="subir-form-subtitle">
            Completa el formulario para participar en el concurso
          </p>
        </div>

        {/* Campo Nombre */}
        <div className="form-group">
          <label className="form-label" htmlFor="nombre">
            Nombre de la tapa <span className="required">*</span>
          </label>
          <input
            id="nombre"
            type="text"
            placeholder="Ej: Croquetas de jamón ibérico"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            aria-invalid={errorForm === "El nombre de la tapa es obligatorio"}
            required
            maxLength={100}
          />
          <p className="form-hint">El nombre puede ser creativo y atractivo</p>
        </div>

        {/* Campo Descripción */}
        <div className="form-group">
          <label className="form-label" htmlFor="descripcion">
            Descripción e ingredientes
          </label>
          <textarea
            id="descripcion"
            placeholder="Describe tu tapa y lista los ingredientes principales..."
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            maxLength={500}
          />
          <p className="form-hint">Incluye los ingredientes</p>
        </div>

        {/* Upload de Foto */}
        <div className="file-upload-container">
          <label className="form-label">
            Foto de la tapa
          </label>
          
          {!preview ? (
            <div className={`file-upload-area ${file ? 'has-file' : ''}`}>
              <div className="upload-icon"><IconoCamara size={24} /></div>
              <label className="upload-label" htmlFor="fileInput">
                {file ? "✓ Foto seleccionada" : "Sube tu foto"}
              </label>
              <span className="upload-hint">
                Formatos: JPG, PNG, GIF (máx. 5MB)
              </span>
              <input
                id="fileInput"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className="form-group">
              <div className="preview-label">
                <span>Vista previa</span>
                <span className="preview-badge">Listo</span>
              </div>
              <div className="image-preview">
                <img src={preview} alt="Vista previa de la tapa" />
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={removeImage}
                  aria-label="Eliminar imagen"
                >
                  <IconoX />
                </button>
              </div>
            </div>
          )}
        </div>

        {(errorForm || errorFoto) && (
          <div className="subir-avisos">
            {errorForm && <Aviso tipo="error">{errorForm}</Aviso>}
            {errorFoto && <Aviso tipo="error">{errorFoto}</Aviso>}
          </div>
        )}

        {/* Botón Submit */}
        <div className="submit-btn-container">
          <button type="submit" disabled={loading}>
            {loading ? (
              <span className="btn-loading">
                <span className="spinner"></span>
                Subiendo...
              </span>
            ) : (
              "Confirmar inscripción"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubirFoto;