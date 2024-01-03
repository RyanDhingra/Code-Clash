import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import "../../styles/Singleplayer/singleplayerGames.css";
import sp_g1 from "../../assets/videos/SP-G1.mp4";

function SinglePlayerGames({ user }) {
    const games = ["speedcode","bugblitz","codegolf","syntaxsniper","tracetitans","Game 6","Game 7"];
    const refs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];
    const navigate = useNavigate();
    const [selectedGame, setSelectedGame] = useState(null);
    const [singleplayerActive, setSingleplayerActive] = useState(false);

    const handleMouseEnter = (refNum) => {
        setSelectedGame(refNum)

        for (let ref of refs) {
            ref.current.pause();
            ref.current.currentTime = 0;
        }

        refs[refNum].current.play();
    };
    
    const handleMouseLeave = () => {
        setSelectedGame(null);
        for (let ref of refs) {
            ref.current.pause();
            ref.current.currentTime = 0;
        }
    };

    useEffect(() => {
        if (selectedGame !== null) {
            refs[selectedGame].current.play();
        }
    }, [selectedGame]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            e.preventDefault();

            for (let ref of refs) {
                ref.current.pause();
                ref.current.currentTime = 0;
            }

            setSelectedGame((prevSelectedGame) => {
                if (e.key === 'ArrowRight' && prevSelectedGame + 1 < games.length) {
                    return prevSelectedGame + 1;
                } else if (e.key === 'ArrowLeft' && prevSelectedGame - 1 >= 0) {
                    return prevSelectedGame - 1;
                } else if (e.key === 'ArrowUp' && prevSelectedGame - 3 >= 0) {
                    return prevSelectedGame - 3;
                } else if (e.key === 'ArrowDown' && prevSelectedGame + 3 < games.length) {
                    return prevSelectedGame + 3;
                } else if (e.key === 'Enter' && prevSelectedGame !== null) {
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

    useEffect(() => {
        if (user.id) {
            setSingleplayerActive(true)
        } else {
            navigate('/')
        }
    }, [])

    if (singleplayerActive) {
        return (
            <div className={'singleplayer-page'}>
                <div className='singleplayer-header'>
                    <h1 className='singleplayer-title'>Mode Select:</h1>
                </div>
                <div className='solo-games-list'>
                    {games.map((game, index) => (
                        <div onClick={() => navigate('/singleplayer/' + games[index])} key={index} className='solo-game'>
                            <video ref={refs[index]} className={selectedGame === index ? 'solo-game-video selected':'solo-game-video'} loop onMouseMove={null} onMouseEnter={() => handleMouseEnter(index)} onMouseLeave={() => handleMouseLeave()}>
                                <source src={sp_g1} type='video/mp4'/>
                            </video>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}

export default SinglePlayerGames;