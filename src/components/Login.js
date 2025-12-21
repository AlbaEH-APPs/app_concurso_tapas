import { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import "../styles/Login.css";

function Login({ onLogin }) {
  const [participantes, setParticipantes] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState("");
  const [cargando, setCargando] = useState(false);
  const [cargandoLista, setCargandoLista] = useState(true);
  const [error, setError] = useState("");

  // Lista por defecto (solo se usa si no hay nada en Firebase)
  const PARTICIPANTES_DEFAULT = [
    { nombre: "Alba Erdociain", esAdmin: true },
    { nombre: "Participante 1", esAdmin: false },
    { nombre: "Participante 2", esAdmin: false },
    { nombre: "Participante 3", esAdmin: false },
  ];

  useEffect(() => {
    cargarParticipantes();
  }, []);

  const cargarParticipantes = async () => {
    try {
      const docRef = doc(db, "configuracion", "participantes");
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists() && docSnap.data().lista?.length > 0) {
        setParticipantes(docSnap.data().lista);
      } else {
        // Si no hay participantes en Firebase, usar la lista por defecto
        setParticipantes(PARTICIPANTES_DEFAULT);
      }
    } catch (error) {
      console.error("Error al cargar participantes:", error);
      // En caso de error, usar lista por defecto
      setParticipantes(PARTICIPANTES_DEFAULT);
    } finally {
      setCargandoLista(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!usuarioSeleccionado) {
      setError("Por favor, selecciona tu nombre de la lista");
      return;
    }

    setCargando(true);
    setError("");

    try {
      // Buscar el participante seleccionado
      const participante = participantes.find(p => p.nombre === usuarioSeleccionado);
      
      // Registrar el acceso en Firebase
      const accesoRef = await addDoc(collection(db, "accesos"), {
        nombre: usuarioSeleccionado,
        esAdmin: participante.esAdmin,
        fechaAcceso: serverTimestamp(),
        navegador: navigator.userAgent,
        timestamp: Date.now()
      });

      // Crear objeto de usuario
      const usuario = {
        id: accesoRef.id,
        nombre: usuarioSeleccionado,
        esAdmin: participante.esAdmin,
        fechaLogin: new Date().toISOString()
      };

      // Llamar al callback con los datos del usuario
      onLogin(usuario);

    } catch (err) {
      console.error("Error al registrar acceso:", err);
      setError("Hubo un error al iniciar sesión. Inténtalo de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  if (cargandoLista) {
    return (
      <div className="login-container">
        <div className="login-box">
          <div className="cargando-login">
            <div className="spinner"></div>
            <p>Cargando participantes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>🍽️</h1>
          <h2>Concurso de Tapas Reyes 2026</h2>
          <p>Selecciona tu nombre para acceder</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="usuario">¿Quién eres?</label>
            <select
              id="usuario"
              value={usuarioSeleccionado}
              onChange={(e) => setUsuarioSeleccionado(e.target.value)}
              disabled={cargando}
              className="select-usuario"
            >
              <option value="">-- Selecciona tu nombre --</option>
              {participantes.map((participante, index) => (
                <option key={index} value={participante.nombre}>
                  {participante.nombre}
                  {participante.esAdmin && " 👑"}
                </option>
              ))}
            </select>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="btn-login"
            disabled={cargando || !usuarioSeleccionado}
          >
            {cargando ? "Accediendo..." : "Acceder"}
          </button>
        </form>

        <div className="login-footer">
          <p>
            👥 {participantes.length} participantes registrados
          </p>
          <p className="login-note">
            ¿No apareces en la lista? Contacta con el administrador
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;