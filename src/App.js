import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthenticateUser from "./components/Account/authenticateUser";
import MainMenu from "./components/MainMenu/mainMenu";
import SinglePlayerGames from "./components/Singleplayer/singleplayerGames";
import "./styles/App.css"
import Speedcode from "./components/Singleplayer/games/speedcode";

function App() {
  const [user, setUser] = useState('');
  
  return (
    <div className="app">
      <Router>
        <Routes>
          <Route exact path="/" element={<AuthenticateUser setUser={setUser}/>}/>
          <Route exact path="/mainmenu" element={<MainMenu />}/>
          <Route exact path='/singleplayer' element={<SinglePlayerGames />}/>
          <Route exact path='/singleplayer/speedcode' element={<Speedcode user={user}/>}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
