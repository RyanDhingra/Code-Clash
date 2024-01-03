import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthenticateUser from "./components/Account/authenticateUser";
import MainMenu from "./components/MainMenu/mainMenu";
import SinglePlayerGames from "./components/Singleplayer/singleplayerGames";
import "./styles/App.css"

/* Singleplayer Games */
import Speedcode from "./components/Singleplayer/games/speedcode";
import BugBlitz from "./components/Singleplayer/games/bugblitz";
import Codegolf from "./components/Singleplayer/games/codegolf";
import Syntaxsniper from "./components/Singleplayer/games/syntaxsniper";
import Tracetitans from "./components/Singleplayer/games/tracetitans";

function App() {
  const [user, setUser] = useState({});
  
  return (
    <div className="app">
      <Router>
        <Routes>
          <Route exact path="/" element={<AuthenticateUser setUser={setUser}/>}/>
          <Route exact path="/mainmenu" element={<MainMenu user={user}/>}/>
          <Route exact path='/singleplayer' element={<SinglePlayerGames user={user}/>}/>
          
          {/* Singleplayer Games */}
          
          {user.id ?
            <>
              <Route exact path='/singleplayer/speedcode' element={<Speedcode user={user}/>}/>
              <Route exact path='/singleplayer/bugblitz/' element={<BugBlitz user={user}/>}/>
              <Route exact path='/singleplayer/codegolf/' element={<Codegolf user={user}/>}/>
              <Route exact path='/singleplayer/syntaxsniper/' element={<Syntaxsniper user={user}/>}/>
              <Route exact path='/singleplayer/tracetitans/' element={<Tracetitans user={user}/>}/>
            </>
          :
          null}

          {/* Multiplayer Games */}
        </Routes>
      </Router>
    </div>
  );
}

export default App;
