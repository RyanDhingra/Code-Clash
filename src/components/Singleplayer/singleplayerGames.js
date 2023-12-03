import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import "../../styles/Singleplayer/singleplayerGames.css";
import sp_g1 from "../../assets/videos/SP-G1.mp4";

function SinglePlayerGames() {
    const games = ["speedcode","Game 2","Game 3","Game 4","Game 5","Game 6","Game 7"];
    const refs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];
    const navigate = useNavigate();
    const [selectedGame, setSelectedGame] = useState(0);

    const handleMouseEnter = (refNum) => {
        refs[refNum].current.play();
    };
    
    const handleMouseLeave = (refNum) => {
        refs[refNum].current.pause();
        refs[refNum].current.currentTime = 0;
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            setSelectedGame((prevSelectedGame) => {
                if (e.key === 'ArrowRight' && prevSelectedGame + 1 < games.length) {
                    return prevSelectedGame + 1;
                } else if (e.key === 'ArrowLeft' && prevSelectedGame - 1 >= 0) {
                    return prevSelectedGame - 1;
                } else if (e.key === 'ArrowUp' && prevSelectedGame - 3 >= 0) {
                    return prevSelectedGame - 3;
                } else if (e.key === 'ArrowDown' && prevSelectedGame + 3 < games.length) {
                    return prevSelectedGame + 3;
                } else if (e.key === 'Enter') {
                    navigate('/singleplayer/' + games[prevSelectedGame]);
                }
    
                // If no condition is met, return the current state
                return prevSelectedGame;
            });
        };
    
        window.addEventListener('keydown', handleKeyDown);
    
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);
    

    return (
        <div className='singleplayer-page'>
            <div className='singleplayer-header'>
                <h1 className='singleplayer-title'>Mode Select:</h1>
            </div>
            <div className='solo-games-list'>
                {games.map((game, index) => (
                    <div onClick={() => navigate('/singleplayer/' + games[index])} key={index} className='solo-game' onMouseEnter={() => handleMouseEnter(index)} onMouseLeave={() => handleMouseLeave(index)}>
                        <video ref={refs[index]} className={selectedGame === index ? 'solo-game-video selected':'solo-game-video'} loop onMouseEnter={() => setSelectedGame(index)} onMouseLeave={() => setSelectedGame(null)}>
                            <source src={sp_g1} type='video/mp4'/>
                        </video>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default SinglePlayerGames;