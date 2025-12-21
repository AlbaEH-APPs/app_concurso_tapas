import { useState, useEffect } from "react";
import {doc, setDoc, getDoc} from "firebase/firestore";
import { db } from "../firebase";
import "../styles/GestionarParticipantes.css";

function GestionarParticipantes() {
  const [participantes, setParticipantes] = useState([]);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [esAdmin, setEsAdmin] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    cargarParticipantes();
  }, []);

  const cargarParticipantes = async () => {
    try {
      const docRef = doc(db, "configuracion", "participantes");
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setParticipantes(docSnap.data().lista || []);
      }
    } catch (error) {
      console.error("Error al cargar participantes:", error);
    } finally {
      setCargando(false);
    }
  };

  const guardarParticipantes = async (listaActualizada) => {
    try {
      const docRef = doc(db, "configuracion", "participantes");
      await setDoc(docRef, { lista: listaActualizada });
      return true;
    } catch (error) {
      console.error("Error al guardar:", error);
      return false;
    }
  };

  const agregarParticipante = async () => {
    if (!nuevoNombre.trim()) {
      setMensaje("❌ Por favor, escribe un nombre");
      setTimeout(() => setMensaje(""), 3000);
      return;
    }

    // Verificar que no exista ya
    if (participantes.some(p => p.nombre.toLowerCase() === nuevoNombre.trim().toLowerCase())) {
      setMensaje("❌ Este nombre ya existe");
      setTimeout(() => setMensaje(""), 3000);
      return;
    }

    setGuardando(true);
    const nuevoParticipante = {
      nombre: nuevoNombre.trim(),
      esAdmin: esAdmin
    };

    const nuevaLista = [...participantes, nuevoParticipante];
    
    if (await guardarParticipantes(nuevaLista)) {
      setParticipantes(nuevaLista);
      setNuevoNombre("");
      setEsAdmin(false);
      setMensaje("✅ Participante añadido correctamente");
    } else {
      setMensaje("❌ Error al guardar");
    }
    
    setGuardando(false);
    setTimeout(() => setMensaje(""), 3000);
  };

  const eliminarParticipante = async (index) => {
    if (!window.confirm(`¿Eliminar a ${participantes[index].nombre}?`)) {
      return;
    }

    setGuardando(true);
    const nuevaLista = participantes.filter((_, i) => i !== index);
    
    if (await guardarParticipantes(nuevaLista)) {
      setParticipantes(nuevaLista);
      setMensaje("✅ Participante eliminado");
    } else {
      setMensaje("❌ Error al eliminar");
    }
    
    setGuardando(false);
    setTimeout(() => setMensaje(""), 3000);
  };

  const cambiarAdmin = async (index) => {
    setGuardando(true);
    const nuevaLista = [...participantes];
    nuevaLista[index].esAdmin = !nuevaLista[index].esAdmin;
    
    if (await guardarParticipantes(nuevaLista)) {
      setParticipantes(nuevaLista);
      setMensaje("✅ Permisos actualizados");
    } else {
      setMensaje("❌ Error al actualizar");
    }
    
    setGuardando(false);
    setTimeout(() => setMensaje(""), 3000);
  };

  if (cargando) {
    return <div className="cargando">Cargando participantes...</div>;
  }

  return (
    <div className="gestionar-participantes">
      <h2>👥 Gestionar Participantes</h2>
      
      {mensaje && (
        <div className={`mensaje ${mensaje.includes("✅") ? "exito" : "error"}`}>
          {mensaje}
        </div>
      )}

      <div className="agregar-participante">
        <h3>➕ Añadir nuevo participante</h3>
        <div className="form-agregar">
          <input
            type="text"
            placeholder="Nombre completo"
            value={nuevoNombre}
            onChange={(e) => setNuevoNombre(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && agregarParticipante()}
            disabled={guardando}
          />
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={esAdmin}
              onChange={(e) => setEsAdmin(e.target.checked)}
              disabled={guardando}
            />
            <span>Es administrador</span>
          </label>
          <button 
            onClick={agregarParticipante}
            disabled={guardando}
            className="btn-agregar"
          >
            {guardando ? "Guardando..." : "Añadir"}
          </button>
        </div>
      </div>

      <div className="lista-participantes">
        <h3>📋 Lista actual ({participantes.length} participantes)</h3>
        
        {participantes.length === 0 ? (
          <p className="sin-participantes">
            No hay participantes. Añade el primero arriba.
          </p>
        ) : (
          <div className="tabla-participantes">
            {participantes.map((participante, index) => (
              <div key={index} className="participante-item">
                <div className="participante-info">
                  <span className="participante-nombre">
                    {participante.nombre}
                  </span>
                  {participante.esAdmin && (
                    <span className="badge-admin">👑 Admin</span>

                  )}
                </div>
                <div className="participante-acciones">
                  <button
                    onClick={() => cambiarAdmin(index)}
                    disabled={guardando}
                    className="btn-admin"
                    title={participante.esAdmin ? "Quitar admin" : "Hacer admin"}
                  >
                    {participante.esAdmin ? "Quitar 👑" : "Hacer 👑"}
                  </button>
                  <button
                    onClick={() => eliminarParticipante(index)}
                    disabled={guardando}
                    className="btn-eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="info-importante">
        <h4>ℹ️ Información importante</h4>
        <ul>
          <li>Los participantes verán esta lista al iniciar sesión</li>
          <li>Los administradores pueden ver el registro de accesos</li>
          <li>Los cambios se guardan automáticamente en Firebase</li>
        </ul>
      </div>
    </div>
  );
}

export default GestionarParticipantes;