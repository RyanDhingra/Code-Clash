import { useRef } from 'react';
import { useNavigate } from 'react-router';
import "../../styles/Singleplayer/singleplayerGames.css";
import sp_g1 from "../../assets/videos/SP-G1.mp4";

function SinglePlayerGames() {
    const games = ["Game 1","Game 2","Game 3","Game 4","Game 5","Game 6","Game 7"];
    const refs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];
    const navigate = useNavigate();


    const handleMouseEnter = (refNum) => {
        refs[refNum].current.play();
    };
    
    const handleMouseLeave = (refNum) => {
        refs[refNum].current.pause();
        refs[refNum].current.currentTime = 0;
    };

    return (
        <div className='singleplayer-page'>
            <div className='singleplayer-header'>
                <h1 className='singleplayer-title'>Mode Select</h1>
            </div>
            <div className='solo-games-list'>
                {games.map((game, index) => (
                    <div onClick={() => navigate('/singleplayer/speedcode')} key={index} className='solo-game' onMouseEnter={() => handleMouseEnter(index)} onMouseLeave={() => handleMouseLeave(index)}>
                        <video ref={refs[index]} className='solo-game-video' loop>
                            <source src={sp_g1} type='video/mp4'/>
                        </video>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default SinglePlayerGames;