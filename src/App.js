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
import {
  IconoCorona,
  IconoCalendario,
  IconoCamara,
  IconoPlato,
  IconoTrofeo,
  IconoCarpeta,
  IconoAlerta,
  IconoCheck,
  IconoFlechaIzq,
} from "./components/Iconos";
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
        <div className="cargando" role="status">Cargando…</div>
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

  // Permite activar con teclado (Enter / espacio) los bloques clicables
  const alPulsarTecla = (destino) => (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      cambiarSeccion(destino);
    }
  };

  const edicion = EDICIONES[EDICION_ACTIVA];
  // "Concurso de Tapas Reyes 2027" -> resalta la parte final ("Reyes 2027")
  const partesTitulo = edicion.titulo.match(/^(.*?)(\s+Reyes.*)$/);

  // App principal (solo se muestra si está autenticado)
  return (
    <div className="App">
      <header className="App-header">
        <div className="marca">
          <span className="marca-icono"><IconoCorona /></span>
          <h1>
            {partesTitulo ? (
              <>
                {partesTitulo[1]}{" "}
                <span className="titulo-acento">{partesTitulo[2].trim()}</span>
              </>
            ) : (
              edicion.titulo
            )}
          </h1>
        </div>
        <div className="usuario-info">
          <span className="usuario-avatar" aria-hidden="true">
            {usuario.nombre.charAt(0).toUpperCase()}
          </span>
          <span className="usuario-nombre">{usuario.nombre}</span>
          <button className="btn-logout" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="contenido" id="contenido">
        {seccion === "inicio" && (
          <div className="inicio">
            <p className="inicio-eyebrow">{edicion.fechaEvento}</p>
            <h2>Bienvenido/a, {usuario.nombre}</h2>

            {/* Banner de asistencia */}
            {!estadisticasAsistencia.usuarioConfirmado ? (
              <div
                className="banner-asistencia urgente"
                role="button"
                tabIndex={0}
                onClick={() => cambiarSeccion("asistencia")}
                onKeyDown={alPulsarTecla("asistencia")}
              >
                <div className="banner-icono"><IconoAlerta size={24} /></div>
                <div className="banner-contenido">
                  <h3>Confirma tu asistencia antes del {edicion.plazoConfirmacion}</h3>
                  <p>Es importante saber cuántos vendrán para organizar el evento.</p>
                  <div className="banner-stats">
                    <span className="stat-item">
                      <strong>{estadisticasAsistencia.total}</strong> personas confirmadas
                    </span>
                  </div>
                </div>
                <div className="banner-accion">
                  <span className="btn-banner">Confirmar ahora →</span>
                </div>
              </div>
            ) : (
              <div
                className="banner-asistencia confirmado"
                role="button"
                tabIndex={0}
                onClick={() => cambiarSeccion("asistencia")}
                onKeyDown={alPulsarTecla("asistencia")}
              >
                <div className="banner-icono"><IconoCheck size={24} /></div>
                <div className="banner-contenido">
                  <h3>Gracias por confirmar</h3>
                  <p>Tu asistencia está confirmada. Nos vemos en el concurso.</p>
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

            <p className="subtitulo-menu">Elige una opción para continuar</p>
            <nav className="tarjetas" aria-label="Secciones">
              <button className="tarjeta destacada" onClick={() => cambiarSeccion("asistencia")}>
                <span className="tarjeta-icono"><IconoCalendario /></span>
                <span className="tarjeta-textos">
                  <span className="tarjeta-titulo">Confirmar asistencia</span>
                  <span className="tarjeta-texto">Confirma si vas a asistir al concurso.</span>
                </span>
                <span className="tarjeta-ir">Abrir →</span>
              </button>
              <button className="tarjeta destacada" onClick={() => cambiarSeccion("inscripciones")}>
                <span className="tarjeta-icono"><IconoCamara /></span>
                <span className="tarjeta-textos">
                  <span className="tarjeta-titulo">Inscripciones</span>
                  <span className="tarjeta-texto">Sube tu tapa para participar en el concurso.</span>
                </span>
                <span className="tarjeta-ir">Abrir →</span>
              </button>
              <button className="tarjeta" onClick={() => cambiarSeccion("tapas")}>
                <span className="tarjeta-icono"><IconoPlato /></span>
                <span className="tarjeta-textos">
                  <span className="tarjeta-titulo">Tapas concursantes</span>
                  <span className="tarjeta-texto">Explora todas las tapas inscritas hasta ahora.</span>
                </span>
              </button>
              <button className="tarjeta" onClick={() => cambiarSeccion("ranking")}>
                <span className="tarjeta-icono"><IconoTrofeo /></span>
                <span className="tarjeta-textos">
                  <span className="tarjeta-titulo">Votaciones y ranking</span>
                  <span className="tarjeta-texto">Consulta los votos y la clasificación de los participantes.</span>
                </span>
              </button>
              {EDICIONES_ARCHIVADAS.length > 0 && (
                <button className="tarjeta" onClick={() => cambiarSeccion("archivo")}>
                  <span className="tarjeta-icono"><IconoCarpeta /></span>
                  <span className="tarjeta-textos">
                    <span className="tarjeta-titulo">Ediciones anteriores</span>
                    <span className="tarjeta-texto">Consulta las tapas y el ranking final de ediciones pasadas.</span>
                  </span>
                </button>
              )}
              {/* Tarjetas solo visibles para admin */}
              {usuario.esAdmin && (
                <>
                  <button className="tarjeta admin" onClick={() => cambiarSeccion("accesos")}>
                    <span className="tarjeta-etiqueta">Admin</span>
                    <span className="tarjeta-textos">
                      <span className="tarjeta-titulo">Registro de accesos</span>
                      <span className="tarjeta-texto">Ver quién ha accedido a la aplicación.</span>
                    </span>
                  </button>
                  <button className="tarjeta admin" onClick={() => cambiarSeccion("participantes")}>
                    <span className="tarjeta-etiqueta">Admin</span>
                    <span className="tarjeta-textos">
                      <span className="tarjeta-titulo">Gestionar participantes</span>
                      <span className="tarjeta-texto">Añadir, editar o eliminar participantes.</span>
                    </span>
                  </button>
                </>
              )}
            </nav>
          </div>
        )}

        {seccion !== "inicio" && (
          <div className="seccion-activa">
            <button className="volver" onClick={volverInicio}>
              <IconoFlechaIzq /> Volver al inicio
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
        <p>© {EDICION_ACTIVA} Aplicación para el concurso de tapas</p>
        <p>Desarrollado por Alba Erdociain Herrero</p>
      </footer>
    </div>
  );
}

export default App;