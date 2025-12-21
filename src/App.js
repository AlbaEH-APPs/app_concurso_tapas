import { useState, useEffect } from "react";
import TapaList from "./components/TapaList";
import SubirFoto from "./components/SubirFoto";
import Ranking from "./components/Ranking";
import Login from "./components/Login";
import RegistroAccesos from "./components/RegistroAccesos";
import GestionarParticipantes from "./components/GestionarParticipantes";
import "./App.css";

function App() {
  const [seccion, setSeccion] = useState("inicio");
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Verificar si hay una sesión guardada al cargar la app
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuarioTapas");
    if (usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
    }
    setCargando(false);
  }, []);

  const handleLogin = (datosUsuario) => {
    setUsuario(datosUsuario);
    localStorage.setItem("usuarioTapas", JSON.stringify(datosUsuario));
  };

  const handleLogout = () => {
    setUsuario(null);
    localStorage.removeItem("usuarioTapas");
    setSeccion("inicio");
  };

  // Mostrar pantalla de carga mientras verifica la sesión
  if (cargando) {
    return (
      <div className="App">
        <div className="cargando">Cargando...</div>
      </div>
    );
  }

  // Si no hay usuario autenticado, mostrar login
  if (!usuario) {
    return (
      <div className="App">
        <Login onLogin={handleLogin} />
      </div>
    );
  }

  // App principal (solo se muestra si está autenticado)
  return (
    <div className="App">
      <header className="App-header">
        <h1>Concurso de Tapas Reyes 2026 🍽️</h1>
        <div className="usuario-info">
          <span>👤 {usuario.nombre}</span>
          <button className="btn-logout" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="contenido">
        {seccion === "inicio" && (
          <div className="inicio">
            <h2>Bienvenido/a {usuario.nombre} 🍴</h2>
            <p>Elige una opción para continuar:</p>
            <div className="tarjetas">
              <div className="tarjeta" onClick={() => setSeccion("inscripciones")}>
                <h3>Inscripciones</h3>
                <p>Sube tu tapa para participar en el concurso.</p>
              </div>
              <div className="tarjeta" onClick={() => setSeccion("tapas")}>
                <h3>Tapas Concursantes</h3>
                <p>Explora todas las tapas inscritas hasta ahora.</p>
              </div>
              <div className="tarjeta" onClick={() => setSeccion("ranking")}>
                <h3>Votaciones / Ranking</h3>
                <p>Consulta los votos y la clasificación de los participantes.</p>
              </div>
              {/* Tarjetas solo visibles para admin */}
              {usuario.esAdmin && (
                <>
                  <div className="tarjeta admin" onClick={() => setSeccion("accesos")}>
                    <h3>🔒 Registro de Accesos</h3>
                    <p>Ver quién ha accedido a la aplicación.</p>
                  </div>
                  <div className="tarjeta admin" onClick={() => setSeccion("participantes")}>
                    <h3>👥 Gestionar Participantes</h3>
                    <p>Añadir, editar o eliminar participantes.</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {seccion !== "inicio" && (
          <div className="seccion-activa">
            <button className="volver" onClick={() => setSeccion("inicio")}>
              ← Volver al inicio
            </button>

            {seccion === "inscripciones" && <SubirFoto usuario={usuario} />}
            {seccion === "tapas" && <TapaList />}
            {seccion === "ranking" && <Ranking />}
            {seccion === "accesos" && usuario.esAdmin && <RegistroAccesos />}
            {seccion === "participantes" && usuario.esAdmin && <GestionarParticipantes />}
          </div>
        )}
      </main>

      <footer className="footer">
        <p className="footer-text">© 2026 Aplicación para el concurso de tapas</p>
        <p className="footer-subtext">Desarrollado por Alba Erdociain Herrero</p>
      </footer>
    </div>
  );
}

export default App;