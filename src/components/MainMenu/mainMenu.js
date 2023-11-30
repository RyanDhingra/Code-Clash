import { useEffect, useState } from 'react';
import selectArrow from '../../assets/images/selectArrow.png';
import "../../styles/MainMenu/mainMenu.css";
import { useNavigate } from 'react-router-dom';

function MainMenu() {
    const [arrowActive, setArrowActive] = useState(1);
    const navigate = useNavigate()

    useEffect(() => {
        const handleKeyDown = (event) => {
            event.preventDefault();
            console.log('Keydown event fired', event.key);
            console.log('Arrow active', arrowActive);
            if (event.key === 'ArrowUp') {
                if (arrowActive !== 1) {
                    setArrowActive((prevArrowActive) => {
                        if (prevArrowActive === 3) {
                          return 2;
                        } else if (prevArrowActive === 2) {
                          return 1;
                        }
                        return prevArrowActive;
                    });                      
                }
            } else if (event.key === 'ArrowDown') {
                if (arrowActive !== 3) {
                    setArrowActive((prevArrowActive) => {
                        if (prevArrowActive === 1) {
                          return 2;
                        } else if (prevArrowActive === 2) {
                          return 3;
                        }
                        return prevArrowActive;
                    });      
                }
            } else if (event.key === 'Enter') {
                if (arrowActive === 1) {
                    navigate('/singleplayer');
                } else if (arrowActive === 2) {
                    console.log('Multiplayer');
                } else if (arrowActive === 3) {
                    console.log('Profile');
                }
            }
        };
    
        document.addEventListener('keydown', handleKeyDown);
    
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [arrowActive]); 

    return (
        <div className='main-menu'>
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
        </div>
    );
}

export default MainMenu;

//get a dark mode and light mode