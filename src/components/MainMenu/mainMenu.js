import { useEffect, useRef, useState } from 'react';
import selectArrow from '../../assets/images/selectArrow.png';
import "../../styles/MainMenu/mainMenu.css";
import { useNavigate } from 'react-router-dom';
import intro from '../../assets/videos/menuintro2.mp4';
import { TypeAnimation } from 'react-type-animation';
import keydown from "../../assets/audios/keydown.mp3";

function MainMenu({ user }) {
    const [arrowActive, setArrowActive] = useState(0);
    const [menuActive, setMenuActive] = useState(false);
    const navigate = useNavigate()
    const AIvid = useRef(null);
    const keySound = useRef(null);

    useEffect(() => {
        const handleKeyDown = (event) => {
            event.preventDefault();
            if (event.key === 'ArrowUp') {
                keySound.current.pause();
                keySound.current.currentTime = 0;
                keySound.current.play();
                if (arrowActive !== 1) {
                    setArrowActive((prevArrowActive) => {
                        if (prevArrowActive === 4) {
                            return 3;
                        } else if (prevArrowActive === 3) {
                            return 2;
                        } else if (prevArrowActive === 2) {
                            return 1;
                        }
                        return prevArrowActive;
                    });                      
                }
            } else if (event.key === 'ArrowDown') {
                keySound.current.pause();
                keySound.current.currentTime = 0;
                keySound.current.play();
                if (arrowActive !== 4) {
                    setArrowActive((prevArrowActive) => {
                        if (prevArrowActive === 0) {    
                            return 1;
                        } else if (prevArrowActive === 1) {
                            return 2;
                        } else if (prevArrowActive === 2) {
                            return 3;
                        } else if (prevArrowActive === 3) {
                            return 4;
                        }
                        return prevArrowActive;
                    });      
                }
            } else if (event.key === 'Enter') {
                keySound.current.pause();
                keySound.current.currentTime = 0;
                keySound.current.play();
                if (arrowActive === 1) {
                    navigate('/singleplayer');
                } else if (arrowActive === 2) {
                    console.log('Multiplayer');
                } else if (arrowActive === 3) {
                    console.log('Profile');
                } else if (arrowActive === 4) {
                    console.log('Settings');
                }
            }
        };
    
        document.addEventListener('keydown', handleKeyDown);
    
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [arrowActive]); 

    useEffect(() => {
        if (user.id) {
            setMenuActive(true)
        } else {
            navigate('/')
        }
    }, [])

    useEffect(() => {
        if (AIvid.current) {
            AIvid.current.play();
        }
    }, [menuActive])

    if (menuActive) {
        return (
            <div className='main-menu'>
                <audio ref={keySound} src={keydown} />
                <div className='mm-ls'>
                    <div className='mm-options'>
                        <div className='mm-title-cont'>
                            <h1 className='mm-title'>Main Menu</h1>
                        </div>
                        <div className='mm-categories-cont'>
                            <div className='mm-arrow-cont'>
                                <div className='mm-arrow'>
                                    <img className='mm-arrow-img' src={selectArrow} alt='Select Arrow' style={{visibility: arrowActive === 1 ? "visible":"hidden"}}/>
                                </div>
                                <div className='mm-arrow'>
                                    <img className='mm-arrow-img' src={selectArrow} alt='Select Arrow' style={{visibility: arrowActive === 2 ? "visible":"hidden"}}/>
                                </div>
                                <div className='mm-arrow'>
                                    <img className='mm-arrow-img' src={selectArrow} alt='Select Arrow' style={{visibility: arrowActive === 3 ? "visible":"hidden"}}/>
                                </div>
                                <div className='mm-arrow'>
                                    <img className='mm-arrow-img' src={selectArrow} alt='Select Arrow' style={{visibility: arrowActive === 4 ? "visible":"hidden"}}/>
                                </div>
                            </div>
                            <div className='mm-categories'>
                                <h1 style={{color: arrowActive === 1 ? "green":"white"}}>Singleplayer</h1>
                                <h1 style={{color: arrowActive === 2 ? "green":"white"}}>Multiplayer</h1>
                                <h1 style={{color: arrowActive === 3 ? "green":"white"}}>Profile</h1>
                                <h1 style={{color: arrowActive === 4 ? "green":"white"}}>Settings</h1>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='mm-rs'>
                    <div className='mm-ai-cont'>
                        <video ref={AIvid} className='mm-ai' >
                            <source src={intro} type='video/mp4'/>
                        </video>
                    </div>
                    <div className='mm-txt-cont'>
                        <div className='mm-txt'>
                            <TypeAnimation style={{fontSize: '1rem', textAlign: 'center'}} sequence={["Welcome to code clash! To get started, use the arrow keys to navigate the main menu."]} wrapper="p" speed={40} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default MainMenu;

//get a dark mode and light mode

/*
<div className='main-menu-cont'>
                    <div className='title-cont'>
                        <h1 className='title'>Main Menu</h1>
                    </div>
                    <div className='main-menu-opts'>
                        <div className='arrows-cont'>
                            <div className='arrow-cont'>
                                <img className='arrow' src={selectArrow} alt='Select Arrow' style={{visibility: arrowActive === 1 ? "visible":"hidden"}}/>
                            </div>
                            <div className='arrow-cont'>
                                <img className='arrow' src={selectArrow} alt='Select Arrow' style={{visibility: arrowActive === 2 ? "visible":"hidden"}}/>
                            </div>
                            <div className='arrow-cont'>
                                <img className='arrow' src={selectArrow} alt='Select Arrow' style={{visibility: arrowActive === 3 ? "visible":"hidden"}}/>
                            </div>
                        </div>
                        <div className='opts-cont'>
                            <div className='opt'>
                                <h1 style={{color: arrowActive === 1 ? "#009E00":"white"}}>Singleplayer</h1>
                            </div>
                            <div className='opt'>
                                <h1 style={{color: arrowActive === 2 ? "#009E00":"white"}}>Multiplayer</h1>
                            </div>
                            <div className='opt'>
                                <h1 style={{color: arrowActive === 3 ? "#009E00":"white"}}>Profile</h1>
                            </div>
                        </div>
                    </div>
                    <div className='menu-buttons'>
                        <div className='settings'>
                            <button className='settings-btn'>Settings</button>
                        </div>
                        <div className='logout'>
                            <button className='logout-btn'>Logout</button>
                        </div>
                    </div>
                </div>
*/