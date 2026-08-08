import { useState } from "react";
import { EDICIONES, EDICIONES_ARCHIVADAS } from "../ediciones.js";
import TapaList from "./TapaList";
import Ranking from "./Ranking";
import "../styles/Archivo.css";

function Archivo() {
  const [edicionSeleccionada, setEdicionSeleccionada] = useState(
    EDICIONES_ARCHIVADAS[0] || null
  );
  const [vista, setVista] = useState("tapas");

  if (!edicionSeleccionada) {
    return (
      <div className="archivo-container">
        <p>Todavía no hay ediciones archivadas.</p>
      </div>
    );
  }

  return (
    <div className="archivo-container">
      <div className="archivo-header">
        <h2>📂 Archivo de ediciones</h2>
        <p>Consulta, en modo solo lectura, las tapas y el ranking final de ediciones anteriores.</p>
      </div>

      <select
        className="archivo-select"
        value={edicionSeleccionada}
        onChange={(e) => setEdicionSeleccionada(e.target.value)}
      >
        {EDICIONES_ARCHIVADAS.map((ed) => (
          <option key={ed} value={ed}>
            {EDICIONES[ed].titulo}
          </option>
        ))}
      </select>

      <div className="archivo-tabs">
        <button
          className={vista === "tapas" ? "activo" : ""}
          onClick={() => setVista("tapas")}
        >
          Tapas
        </button>
        <button
          className={vista === "ranking" ? "activo" : ""}
          onClick={() => setVista("ranking")}
        >
          Ranking
        </button>
      </div>

      {vista === "tapas" && (
        <TapaList edicion={edicionSeleccionada} soloLectura />
      )}
      {vista === "ranking" && <Ranking edicion={edicionSeleccionada} />}
    </div>
  );
}

export default Archivo;
