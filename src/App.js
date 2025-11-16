import TapaList from "./components/TapaList";
import SubirFoto from "./components/SubirFoto";
import Ranking from "./components/Ranking";
import "./App.css";

function App() {
  return (
    <div>
      <h1>Concurso de Tapas 🍽️</h1>
      <SubirFoto />
      <TapaList />
      <Ranking />
    </div>
  );
}

export default App;
