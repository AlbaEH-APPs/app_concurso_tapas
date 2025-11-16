import { useState } from "react";
import TapaList from "./components/TapaList";
import SubirFoto from "./components/SubirFoto";
import Ranking from "./components/Ranking";
import "./App.css";

function App() {
  const [seccion, setSeccion] = useState("inicio");

  return (
    <div className="App">
      <header className="App-header">
        <h1>Concurso de Tapas Reyes 2026 🍽️</h1>
      </header>

      <main className="contenido">
        {seccion === "inicio" && (
          <div className="inicio">
            <h2>Bienvenido al Concurso de Tapas 🍴</h2>
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
            </div>
          </div>
        )}

        {seccion !== "inicio" && (
          <div className="seccion-activa">
            <button className="volver" onClick={() => setSeccion("inicio")}>
              ← Volver al inicio
            </button>

            {seccion === "inscripciones" && <SubirFoto />}
            {seccion === "tapas" && <TapaList />}
            {seccion === "ranking" && <Ranking />}
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
