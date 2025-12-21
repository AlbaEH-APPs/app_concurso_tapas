import { useState, useEffect } from "react";
import { collection, doc, setDoc, getDocs, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import "../styles/ConfirmarAsistencia.css";

function ConfirmarAsistencia({ usuario, onActualizarEstadisticas }) {
  const [confirmados, setConfirmados] = useState([]);
  const [miEstado, setMiEstado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    cargarAsistencias();
  }, []);

  const cargarAsistencias = async () => {
    try {
      const snapshot = await getDocs(collection(db, "asistencias"));
      const asistenciasData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setConfirmados(asistenciasData);
      
      // Verificar si el usuario actual ya confirmó
      const miConfirmacion = asistenciasData.find(a => a.nombre === usuario.nombre);
      setMiEstado(miConfirmacion || null);
      
    } catch (error) {
      console.error("Error al cargar asistencias:", error);
    } finally {
      setCargando(false);
    }
  };

  const confirmarAsistencia = async () => {
    setProcesando(true);
    setMensaje("");

    try {
      // Crear documento con el nombre del usuario como ID
      const docRef = doc(db, "asistencias", usuario.nombre);
      
      await setDoc(docRef, {
        nombre: usuario.nombre,
        confirmado: true,
        fecha: serverTimestamp(),
        timestamp: Date.now()
      });

      setMensaje("✅ ¡Asistencia confirmada! Nos vemos en el concurso");
      await cargarAsistencias();
      
      // Notificar al componente padre para actualizar estadísticas
      if (onActualizarEstadisticas) {
        onActualizarEstadisticas();
      }
      
    } catch (error) {
      console.error("Error al confirmar:", error);
      setMensaje("❌ Error al confirmar. Inténtalo de nuevo.");
    } finally {
      setProcesando(false);
      setTimeout(() => setMensaje(""), 5000);
    }
  };

  const cancelarAsistencia = async () => {
    if (!window.confirm("¿Seguro que quieres cancelar tu asistencia?")) {
      return;
    }

    setProcesando(true);
    setMensaje("");

    try {
      const docRef = doc(db, "asistencias", usuario.nombre);
      await deleteDoc(docRef);

      setMensaje("ℹ️ Asistencia cancelada");
      await cargarAsistencias();
      
      // Notificar al componente padre para actualizar estadísticas
      if (onActualizarEstadisticas) {
        onActualizarEstadisticas();
      }
      
    } catch (error) {
      console.error("Error al cancelar:", error);
      setMensaje("❌ Error al cancelar. Inténtalo de nuevo.");
    } finally {
      setProcesando(false);
      setTimeout(() => setMensaje(""), 5000);
    }
  };

  const formatearFecha = (timestamp) => {
    if (!timestamp) return "";
    
    let fecha;
    if (timestamp.seconds) {
      fecha = new Date(timestamp.seconds * 1000);
    } else {
      fecha = new Date(timestamp);
    }
    
    return fecha.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (cargando) {
    return <div className="cargando">Cargando asistencias...</div>;
  }

  const totalConfirmados = confirmados.length;
  const porcentaje = confirmados.length > 0 ? Math.round((confirmados.length / 20) * 100) : 0; // Ajusta 20 al número esperado de participantes

  return (
    <div className="confirmar-asistencia">
      <div className="header-asistencia">
        <h2>📅 Confirmar Asistencia</h2>
        <p className="subtitulo">Confirma tu asistencia al Concurso de Tapas Reyes 2026</p>
      </div>

      {mensaje && (
        <div className={`mensaje-asistencia ${mensaje.includes("✅") ? "exito" : mensaje.includes("❌") ? "error" : "info"}`}>
          {mensaje}
        </div>
      )}

      {/* Mi confirmación */}
      <div className="mi-confirmacion">
        {!miEstado ? (
          <div className="confirmacion-pendiente">
            <div className="icono-grande">🤔</div>
            <h3>¿Vas a venir?</h3>
            <p>Confirma tu asistencia para que sepamos cuántos seremos</p>
            <button 
              className="btn-confirmar"
              onClick={confirmarAsistencia}
              disabled={procesando}
            >
              {procesando ? "Confirmando..." : "✓ Sí, voy a asistir"}
            </button>
          </div>
        ) : (
          <div className="confirmacion-ok">
            <div className="icono-grande">✅</div>
            <h3>¡Ya has confirmado!</h3>
            <p>Confirmaste tu asistencia el {formatearFecha(miEstado.fecha || miEstado.timestamp)}</p>
            <button 
              className="btn-cancelar"
              onClick={cancelarAsistencia}
              disabled={procesando}
            >
              {procesando ? "Cancelando..." : "✗ Cancelar asistencia"}
            </button>
          </div>
        )}
      </div>

      {/* Estadísticas */}
      <div className="estadisticas-asistencia">
        <div className="stat-box">
          <div className="stat-numero-grande">{totalConfirmados}</div>
          <div className="stat-label">Confirmados</div>
        </div>
        <div className="stat-box">
          <div className="barra-progreso">
            <div className="barra-fill" style={{ width: `${Math.min(porcentaje, 100)}%` }}>
              <span className="barra-texto">{porcentaje}%</span>
            </div>
          </div>
          <div className="stat-label">Participación</div>
        </div>
      </div>

      {/* Lista de confirmados */}
      <div className="lista-confirmados">
        <h3>👥 Personas que asistirán ({totalConfirmados})</h3>
        
        {confirmados.length === 0 ? (
          <div className="sin-confirmados">
            <p>🏜️ Aún no hay nadie confirmado</p>
            <p className="texto-secundario">¡Sé el primero en confirmar!</p>
          </div>
        ) : (
          <div className="grid-confirmados">
            {confirmados
              .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
              .map((persona, index) => (
                <div key={persona.id} className={`persona-card ${persona.nombre === usuario.nombre ? 'mi-card' : ''}`}>
                  <div className="persona-avatar">
                    {persona.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div className="persona-info">
                    <div className="persona-nombre">
                      {persona.nombre}
                      {persona.nombre === usuario.nombre && <span className="badge-tu">Tú</span>}
                    </div>
                    <div className="persona-fecha">
                      {formatearFecha(persona.fecha || persona.timestamp)}
                    </div>
                  </div>
                  {index === 0 && (
                    <div className="badge-primero">🥇 Primero</div>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Información adicional */}
      <div className="info-evento">
        <h4>📍 Detalles del evento</h4>
        <div className="detalles">
          <p><strong>📅 Fecha:</strong> 5 de Enero de 2026 (Noche de Reyes)</p>
          <p><strong>🕐 Hora:</strong> A partir de las 18</p>
          <p><strong>📍 Lugar:</strong> Calle Palencia 13 2º B</p>
        </div>
        <p className="nota-info">
          ℹ️ La confirmación de asistencia es importante para organizar mejor el evento
        </p>
      </div>
    </div>
  );
}

export default ConfirmarAsistencia;