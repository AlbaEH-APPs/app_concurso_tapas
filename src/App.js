import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";
import TapaList from "./components/TapaList";
import SubirFoto from "./components/SubirFoto";
import Ranking from "./components/Ranking";
import Login from "./components/Login";
import RegistroAccesos from "./components/RegistroAccesos";
import GestionarParticipantes from "./components/GestionarParticipantes";
import ConfirmarAsistencia from "./components/ConfirmarAsistencia";
import Archivo from "./components/Archivo";
import { EDICION_ACTIVA, EDICIONES, EDICIONES_ARCHIVADAS } from "./ediciones.js";
import "./App.css";

function App() {
  const [seccion, setSeccion] = useState("inicio");
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [estadisticasAsistencia, setEstadisticasAsistencia] = useState({
    total: 0,
    usuarioConfirmado: false
  });

  // Verificar si hay una sesión guardada al cargar la app
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuarioTapas");
    if (usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
    }
    setCargando(false);
  }, []);

  // Cargar estadísticas de asistencia cuando hay usuario
  useEffect(() => {
    if (usuario) {
      cargarEstadisticasAsistencia();
    }
  }, [usuario]);

  // Manejar navegación con botón "atrás" del navegador/móvil
  useEffect(() => {
    // Al cambiar de sección, añadir al historial del navegador
    if (seccion !== "inicio") {
      window.history.pushState({ seccion }, "", `#${seccion}`);
    }

    // Escuchar el evento "popstate" (botón atrás del navegador)
    const manejarNavegacion = (event) => {
      if (event.state && event.state.seccion) {
        setSeccion(event.state.seccion);
      } else {
        setSeccion("inicio");
      }
    };

    window.addEventListener("popstate", manejarNavegacion);

    // Cleanup: remover el listener al desmontar
    return () => {
      window.removeEventListener("popstate", manejarNavegacion);
    };
  }, [seccion]);

  // Al cargar la app, verificar si hay un hash en la URL
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash && usuario) {
      setSeccion(hash);
    }
  }, [usuario]);

  const cargarEstadisticasAsistencia = async () => {
    try {
      const asistenciasQuery = query(
        collection(db, "asistencias"),
        where("edicion", "==", EDICION_ACTIVA)
      );
      const snapshot = await getDocs(asistenciasQuery);
      const confirmados = snapshot.docs.map(doc => doc.data());
      
      setEstadisticasAsistencia({
        total: confirmados.length,
        usuarioConfirmado: confirmados.some(a => a.nombre === usuario.nombre)
      });
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
    }
  };

  // Función para cambiar de sección (usada por los botones/tarjetas)
  const cambiarSeccion = (nuevaSeccion) => {
    setSeccion(nuevaSeccion);
    // No necesitamos pushState aquí porque el useEffect ya lo maneja
  };

  // Función para volver al inicio (botón "Volver")
  const volverInicio = () => {
    // Si hay historial, usar el botón atrás del navegador
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Si no hay historial, ir directo a inicio
      setSeccion("inicio");
      window.location.hash = "";
    }
  };

  const handleLogin = (datosUsuario) => {
    console.log("🔍 Usuario logueado:", datosUsuario); // DEBUG
    console.log("🔍 Es admin?", datosUsuario.esAdmin); // DEBUG
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
        <h1>{EDICIONES[EDICION_ACTIVA].titulo} 🍽️</h1>
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
            
            {/* Banner de asistencia */}
            {!estadisticasAsistencia.usuarioConfirmado ? (
              <div className="banner-asistencia urgente" onClick={() => cambiarSeccion("asistencia")}>
                <div className="banner-icono">⚠️</div>
                <div className="banner-contenido">
                  <h3>¡Confirma tu asistencia! El plazo limite es hasta el {EDICIONES[EDICION_ACTIVA].plazoConfirmacion} </h3>
                  <p>Es importante saber cuántos vendrán para organizar el evento</p>
                  <div className="banner-stats">
                    <span className="stat-item">
                      <strong>{estadisticasAsistencia.total}</strong> personas confirmadas
                    </span>
                  </div>
                </div>
                <div className="banner-accion">
                  <button className="btn-banner">Confirmar ahora →</button>
                </div>
              </div>
            ) : (
              <div className="banner-asistencia confirmado" onClick={() => cambiarSeccion("asistencia")}>
                <div className="banner-icono">✅</div>
                <div className="banner-contenido">
                  <h3>¡Gracias por confirmar!</h3>
                  <p>Tu asistencia está confirmada. Nos vemos en el concurso</p>
                  <div className="banner-stats">
                    <span className="stat-item">
                      <strong>{estadisticasAsistencia.total}</strong> personas confirmadas en total
                    </span>
                  </div>
                </div>
                <div className="banner-accion">
                  <span className="ver-lista">Ver lista completa →</span>
                </div>
              </div>
            )}

            <p className="subtitulo-menu">Elige una opción para continuar:</p>
            <div className="tarjetas">
              <div className="tarjeta" onClick={() => cambiarSeccion("asistencia")}>
                <h3>✅ Confirmar Asistencia</h3>
                <p>Confirma si vas a asistir al concurso.</p>
              </div>
              <div className="tarjeta" onClick={() => cambiarSeccion("inscripciones")}>
                <h3>Inscripciones</h3>
                <p>Sube tu tapa para participar en el concurso.</p>
              </div>
              <div className="tarjeta" onClick={() => cambiarSeccion("tapas")}>
                <h3>Tapas Concursantes</h3>
                <p>Explora todas las tapas inscritas hasta ahora.</p>
              </div>
              <div className="tarjeta" onClick={() => cambiarSeccion("ranking")}>
                <h3>Votaciones / Ranking</h3>
                <p>Consulta los votos y la clasificación de los participantes.</p>
              </div>
              {EDICIONES_ARCHIVADAS.length > 0 && (
                <div className="tarjeta" onClick={() => cambiarSeccion("archivo")}>
                  <h3>📂 Ediciones Anteriores</h3>
                  <p>Consulta las tapas y el ranking final de ediciones pasadas.</p>
                </div>
              )}
              {/* Tarjetas solo visibles para admin */}
              {usuario.esAdmin && (
                <>
                  <div className="tarjeta admin" onClick={() => cambiarSeccion("accesos")}>
                    <h3>🔒 Registro de Accesos</h3>
                    <p>Ver quién ha accedido a la aplicación.</p>
                  </div>
                  <div className="tarjeta admin" onClick={() => cambiarSeccion("participantes")}>
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
            <button className="volver" onClick={volverInicio}>
              ← Volver al inicio
            </button>

            {seccion === "asistencia" && <ConfirmarAsistencia usuario={usuario} onActualizarEstadisticas={cargarEstadisticasAsistencia} />}
            {seccion === "inscripciones" && <SubirFoto usuario={usuario} />}
            {seccion === "tapas" && <TapaList />}
            {seccion === "ranking" && <Ranking />}
            {seccion === "archivo" && <Archivo />}
            {seccion === "accesos" && usuario.esAdmin && <RegistroAccesos />}
            {seccion === "participantes" && usuario.esAdmin && <GestionarParticipantes />}
          </div>
        )}
      </main>

      <footer className="footer">
        <p className="footer-text">© {EDICION_ACTIVA} Aplicación para el concurso de tapas</p>
        <p className="footer-subtext">Desarrollado por Alba Erdociain Herrero</p>
      </footer>
    </div>
  );
}

export default App;