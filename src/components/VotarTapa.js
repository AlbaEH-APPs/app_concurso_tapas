import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { EDICION_ACTIVA } from "../ediciones.js";
import { Aviso, IconoCheck } from "./Iconos";
import "../styles/VotarTapa.css";

const VotarTapa = ({ tapaId }) => {
  const [puntuacion, setPuntuacion] = useState(0);
  const [hoverPuntuacion, setHoverPuntuacion] = useState(0);
  const [yaVotado, setYaVotado] = useState(false);
  const [votando, setVotando] = useState(false);
  const [aviso, setAviso] = useState(null); // { tipo, texto } mostrado en pantalla

  const [userName, setUserName] = useState(null);   // Persona seleccionada
  const [deviceId, setDeviceId] = useState(null);   // ID único del dispositivo

  /* =====================================================
     1. Obtener o crear ID único del dispositivo
  ===================================================== */
  useEffect(() => {
    let storedDeviceId = localStorage.getItem("deviceId");

    if (!storedDeviceId) {
      storedDeviceId = `device_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 9)}`;
      localStorage.setItem("deviceId", storedDeviceId);
    }

    setDeviceId(storedDeviceId);
  }, []);

  /* =====================================================
     2. Obtener la persona activa ("quién soy")
  ===================================================== */
  useEffect(() => {
    const nombreGuardado = localStorage.getItem("usuarioActivo");
    setUserName(nombreGuardado);
  }, []);

  /* =====================================================
     3. Verificar si ESA PERSONA ya votó esta tapa
  ===================================================== */
  useEffect(() => {
    const verificarVoto = async () => {
      if (!tapaId || !userName) return;

      try {
        const votosQuery = query(
          collection(db, "votos"),
          where("tapaId", "==", tapaId),
          where("userName", "==", userName)
        );

        const votosSnapshot = await getDocs(votosQuery);

        if (!votosSnapshot.empty) {
          const votoData = votosSnapshot.docs[0].data();
          setYaVotado(true);
          setPuntuacion(votoData.puntuacion || 0);
        } else {
          // Si cambia de persona, permitimos votar de nuevo
          setYaVotado(false);
          setPuntuacion(0);
        }
      } catch (error) {
        console.error("Error verificando voto:", error);
      }
    };

    verificarVoto();
  }, [tapaId, userName]);

  /* =====================================================
     4. Enviar voto
  ===================================================== */
  const handleVotar = async () => {
    if (!userName) {
      setAviso({ tipo: "error", texto: "Por favor, selecciona quién eres antes de votar" });
      return;
    }

    if (puntuacion === 0) {
      setAviso({ tipo: "error", texto: "Por favor, selecciona una puntuación del 1 al 5" });
      return;
    }

    if (yaVotado) {
      setAviso({ tipo: "error", texto: "Ya has votado esta tapa" });
      return;
    }

    setVotando(true);
    setAviso(null);

    try {
      await addDoc(collection(db, "votos"), {
        tapaId,
        userName,
        deviceId,
        puntuacion,
        fecha: new Date().toISOString(),
        edicion: EDICION_ACTIVA,
      });

      setYaVotado(true);
      setAviso({ tipo: "exito", texto: `Gracias por tu voto, ${userName}` });
    } catch (error) {
      console.error("Error al votar:", error);
      setAviso({ tipo: "error", texto: "Hubo un error al registrar tu voto. Inténtalo de nuevo." });
    } finally {
      setVotando(false);
    }
  };

  /* =====================================================
     5. Render estrellas
  ===================================================== */
  const renderEstrellas = () => {
    const estrellas = [];
    const puntuacionMostrar = hoverPuntuacion || puntuacion;

    for (let i = 1; i <= 5; i++) {
      estrellas.push(
        <span
          key={i}
          className={`voto-estrella ${
            i <= puntuacionMostrar ? "filled" : "empty"
          } ${yaVotado ? "disabled" : ""}`}
          role="button"
          tabIndex={yaVotado ? -1 : 0}
          aria-label={`${i} ${i === 1 ? "estrella" : "estrellas"}`}
          aria-pressed={i <= puntuacion}
          onClick={() => !yaVotado && setPuntuacion(i)}
          onKeyDown={(e) => {
            if (!yaVotado && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              setPuntuacion(i);
            }
          }}
          onMouseEnter={() => !yaVotado && setHoverPuntuacion(i)}
          onMouseLeave={() => !yaVotado && setHoverPuntuacion(0)}
        >
          {i <= puntuacionMostrar ? "★" : "☆"}
        </span>
      );
    }

    return estrellas;
  };

  /* =====================================================
     6. UI cuando ya votó
  ===================================================== */
  if (yaVotado) {
    return (
      <div className="voto-confirmado-wrap">
      {aviso && <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>}
      <div className="voto-confirmado">
        <div className="voto-confirmado-icono"><IconoCheck size={18} /></div>
        <div className="voto-confirmado-contenido">
          <span className="voto-confirmado-titulo">¡Ya has votado!</span>
          <span className="voto-confirmado-texto">
            {userName} · {puntuacion} estrellas
          </span>
        </div>
      </div>
      </div>
    );
  }

  /* =====================================================
     7. UI normal
  ===================================================== */
  return (
    <div className="votar-tapa">
      <div className="votar-header">
        <span className="votar-titulo">¿Qué te pareció?</span>
        <span className="votar-subtitulo">
          {userName ? `Votando como ${userName}` : "Selecciona quién eres"}
        </span>
      </div>

      <div className="votar-estrellas" role="group" aria-label="Puntuación">{renderEstrellas()}</div>

      {aviso && <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>}

      <button
        onClick={handleVotar}
        disabled={votando || puntuacion === 0}
        className="votar-btn"
      >
        {votando ? "Enviando..." : "Enviar voto"}
      </button>
    </div>
  );
};

export default VotarTapa;
