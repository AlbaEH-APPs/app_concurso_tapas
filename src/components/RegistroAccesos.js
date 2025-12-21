import { useState, useEffect } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import "../styles/RegistroAccesos.css";

function RegistroAccesos() {
  const [accesos, setAccesos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    cargarAccesos();
  }, []);

  const cargarAccesos = async () => {
    try {
      const q = query(
        collection(db, "accesos"),
        orderBy("timestamp", "desc")
      );
      
      const snapshot = await getDocs(q);
      const accesosData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setAccesos(accesosData);
    } catch (error) {
      console.error("Error al cargar accesos:", error);
    } finally {
      setCargando(false);
    }
  };

  const formatearFecha = (timestamp) => {
    if (!timestamp) return "Fecha no disponible";
    
    let fecha;
    if (timestamp.seconds) {
      // Firebase Timestamp
      fecha = new Date(timestamp.seconds * 1000);
    } else {
      // Número de timestamp
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

  const accesosFiltrados = accesos.filter(acceso =>
    acceso.nombre.toLowerCase().includes(filtro.toLowerCase())
  );

  // Estadísticas
  const totalAccesos = accesos.length;
  const usuariosUnicos = new Set(accesos.map(a => a.nombre.toLowerCase())).size;
  const ultimoAcceso = accesos[0];

  if (cargando) {
    return <div className="cargando">Cargando accesos...</div>;
  }

  return (
    <div className="registro-accesos">
      <h2>📊 Registro de Accesos</h2>
      
      <div className="estadisticas">
        <div className="stat-card">
          <div className="stat-numero">{totalAccesos}</div>
          <div className="stat-label">Accesos totales</div>
        </div>
        <div className="stat-card">
          <div className="stat-numero">{usuariosUnicos}</div>
          <div className="stat-label">Usuarios únicos</div>
        </div>
        <div className="stat-card">
          <div className="stat-texto">
            {ultimoAcceso ? ultimoAcceso.nombre : "N/A"}
          </div>
          <div className="stat-label">Último acceso</div>
        </div>
      </div>

      <div className="filtro-container">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="filtro-input"
        />
        <button onClick={cargarAccesos} className="btn-refrescar">
          🔄 Refrescar
        </button>
      </div>

      <div className="tabla-container">
        <table className="tabla-accesos">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Fecha y Hora</th>
              <th>Navegador</th>
            </tr>
          </thead>
          <tbody>
            {accesosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="3" className="sin-datos">
                  {filtro ? "No se encontraron resultados" : "No hay accesos registrados"}
                </td>
              </tr>
            ) : (
              accesosFiltrados.map((acceso) => (
                <tr key={acceso.id}>
                  <td className="nombre-celda">
                    <strong>{acceso.nombre}</strong>
                  </td>
                  <td>{formatearFecha(acceso.timestamp || acceso.fechaAcceso)}</td>
                  <td className="navegador-celda">
                    {acceso.navegador ? (
                      acceso.navegador.includes("Mobile") ? "📱 Móvil" :
                      acceso.navegador.includes("Chrome") ? "🌐 Chrome" :
                      acceso.navegador.includes("Firefox") ? "🦊 Firefox" :
                      acceso.navegador.includes("Safari") ? "🧭 Safari" : "💻 Ordenador"
                    ) : "Desconocido"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RegistroAccesos;