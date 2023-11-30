import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthenticateUser from "./components/Account/authenticateUser";
import MainMenu from "./components/MainMenu/mainMenu";
import SinglePlayerGames from "./components/Singleplayer/singleplayerGames";
import "./styles/App.css"
import Speedcode from "./components/Singleplayer/games/speedcode";

function App() {
  return (
    <div className="app">
      <Router>
        <Routes>
          <Route exact path="/" element={<AuthenticateUser />}/>
          <Route exact path="/mainmenu" element={<MainMenu />}/>
          <Route exact path='/singleplayer' element={<SinglePlayerGames />}/>
          <Route exact path='/singleplayer/speedcode' element={<Speedcode />}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
