import React, { useEffect, useRef, useState } from 'react';
import "../../../styles/Singleplayer/games/syntaxsniper.css";
import axios from 'axios';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router';
import MatchmakingLoader from '../../Loaders/Matchmaking/matchmaking';
import leftArrow from '../../../assets/images/leftArrow.png';
import rightArrow from '../../../assets/images/rightArrow.png';
import checkMark from '../../../assets/images/checkMark.png';


function Syntaxsniper({ user }) {
    const gameid = 4;

    const room = useRef(null);
    const matchFound = useRef(false);
    
    const navigate = useNavigate();

    const [currSocket, setCurrSocket] = useState(null);
    const [problem, setProblem] = useState([]);
    const [opponent, setOpponent] = useState('');
    const [player, setPlayer] = useState('');
    const [loading, setLoading] = useState(true);
    const [arrowActive, setArrowActive] = useState(1);

    const [answers, setAnswers] = useState([]);
    const [oppAnswers, setOppAnswers] = useState([]);
    const [currProblem, setCurrProblem] = useState(0);
    const timePerQuestion = 600;

    let score = 0;
    let oppScore = 0;
    score = scoreCount(answers, problem[1]);
    oppScore = scoreCount(oppAnswers, problem[1]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            event.preventDefault();
            console.log('Keydown event fired', event.key);
            console.log('Arrow active', arrowActive);
            if (event.key === 'ArrowLeft') {
                document.getElementsByClassName("syntaxsniper-options-true")[0].click();
                
            } else if (event.key === 'ArrowRight') {
                document.getElementsByClassName("syntaxsniper-options-false")[0].click();

            }
        };
    
        document.addEventListener('keydown', handleKeyDown);
    
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [arrowActive]); 

    useEffect(() => {
        // Connect to the Socket.IO server
        const socket = io('http://192.168.2.130:5000');
        setCurrSocket(socket)

        socket.on('game_over', () => {
            alert('You lost, better luck next time!')
            navigate('/singleplayer');
        })
        socket.on('game_over_tie', () => {
            alert("It's a TIE!")
            navigate('/singleplayer');
        })
        
        // Listen for the 'connect' event
        socket.on('connect', () => {
            console.log('Connected to server');
        });
    
        // Listen for the 'disconnect' event
        socket.on('leave_match', (data) => {
            socket.disconnect();
            console.log('Disconnected from server', {data});

            if (data.reason === 'player quit') {
                navigate('/singleplayer');
            }

        });


        socket.on('update_cases', (data) => {
            setOppAnswers(data.answers);
            console.log(data.answers);
            console.log(oppAnswers);
        });

        socket.on('room_created', (data) => {
            console.log('Room created:', data)
            room.current = data.room_id;
        });
    
        // Listen for the 'match_found' event
        socket.on('match_found', (data) => {
            console.log('Match found:', data);
            room.current = data.room_id;
            matchFound.current = true;
            setProblem(data.problem);
            setOpponent(data.opponent);
            setPlayer(data.player);
        });
    
        socket.emit('queue', { player_id: user.id, game_id: gameid, user: user.username });

        const handleBeforeUnload = () => {
            socket.emit('delete_room', { room_id: room.current, game_id: gameid, reason: 'player quit' });
            socket.disconnect();
        };

        /*Event Listeners*/
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            console.log('WE DELETE ROOM HERE')
            console.log(room.current)
            socket.emit('delete_room', { room_id: room.current, game_id: gameid, reason: 'player quit' });
            socket.disconnect();
        };
    }, []);

    const [time, setTime] = useState(timePerQuestion);

    useEffect(() => {
        const interval = setInterval(() => {
            if (matchFound.current && currSocket !== null) {
                setTime((prevTime) => prevTime - 1);
            }
        }, 1000);
        
        return () => clearInterval(interval);
    }, [matchFound.current, currSocket]);

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    /* Code Actions */

    const optionSelect = async (action) => {
        let newAnswers;
        if (action === 'true') {
            newAnswers = answers.concat([1]);
            console.log("true pressed");
        } else if (action === 'false') {
            newAnswers = answers.concat([0]);
            console.log("false pressed");
        } 
        setAnswers(newAnswers);
        console.log(newAnswers);
        currSocket.emit('update_cases', {game_id: gameid, room_id: room.current, cases: newAnswers});
        setTime(timePerQuestion);
        setCurrProblem(currProblem+1);

        console.log(scoreCount(newAnswers,problem[1])+', '+oppScore);
        if (currProblem+1 === problem[0].length) {
            if (scoreCount(newAnswers,problem[1]) > oppScore) {
                currSocket.emit('game_over', { room_id: room.current, game_id: gameid })
                alert('You won!')
            } else if (scoreCount(newAnswers,problem[1]) === oppScore) {
                currSocket.emit('game_over_tie', { room_id: room.current, game_id: gameid })
                alert("It's a TIE!")
            }
            navigate('/singleplayer');
        }
    }

    if (time === 0 || oppAnswers.length > currProblem) {
        let newAnswers;
        newAnswers = answers.concat([2]);
        console.log("nothing pressed");
        setAnswers(newAnswers);
        console.log(newAnswers);
        currSocket.emit('update_cases', {game_id: gameid, room_id: room.current, cases: newAnswers});
        setTime(timePerQuestion);
        setCurrProblem(currProblem+1);

        console.log(scoreCount(newAnswers,problem[1])+', '+oppScore);
        if (currProblem+1 === problem[0].length) {
            if (scoreCount(newAnswers,problem[1]) > oppScore) {
                currSocket.emit('game_over', { room_id: room.current, game_id: gameid })
                alert('You won!')
            } else if (scoreCount(newAnswers,problem[1]) === oppScore) {
                currSocket.emit('game_over_tie', { room_id: room.current, game_id: gameid })
                alert("It's a TIE!")
            }
            navigate('/singleplayer');
        }
    }


    function scoreCount(arr1, arr2) {
        let count = 0;
        for (let i = 0; i < arr1.length; i++) {
          if (arr2[i] === arr1[i]) {
            count++;
          }
        }
        return count;
    }

    
    if (matchFound.current && currSocket !== null) {
        return (
            <div className='syntaxsniper-cont'>
                <div className='syntaxsniper-header'>
                    <div className='syntaxsniper-player-info-cont'>
                        <div className='syntaxsniper-player-name-cont'>
                            <div className='syntaxsniper-player-name'>&nbsp;{player}&nbsp;</div>
                        </div>
                        <div className='syntaxsniper-pscore-cont'>
                            <figure>
                                <figcaption className='syntaxsniper-pscore-caption'><div className='syntaxsniper-pscore'>&nbsp;{score}</div></figcaption>
                                <img src={checkMark} alt="Correct" border="0" />
                            </figure>   
                        </div>
                    </div>
                    <div className='syntaxsniper-timer-cont'>
                        <h1 className='syntaxsniper-time'>{formatTime(time)}</h1>
                    </div>
                    <div className='syntaxsniper-opponent-info-cont'>
                        <div className='syntaxsniper-opponent-name-cont'>
                            <div className='syntaxsniper-opponent-name'>Opponent: {opponent}&nbsp;</div>
                        </div>
                        <div className='syntaxsniper-oppscore-cont'>
                            <figure>
                                <figcaption className='syntaxsniper-oppscore-caption'><div className='syntaxsniper-oppscore'>{oppScore}&nbsp;</div></figcaption>
                                <img src={checkMark} alt="Correct" border="0" />
                            </figure>
                            
                        </div>
                    </div>
                </div>
                <div className='syntaxsniper-ls'>
                    <h1>Syntax #{currProblem +1}</h1>
                    <textarea readOnly value={problem[0][currProblem]} className='syntaxsniper-problem'></textarea>
                    <h1>Correct or Incorrect Syntax?</h1>
                    <div className='syntaxsniper-options'>
                        <button className="syntaxsniper-options-true" onClick={() => optionSelect("true")}>
                            <figure className="syntaxsniper-options-true-fig" >
                                <img src={leftArrow} alt="Correct" border="0" />
                                <figcaption>Correct</figcaption>
                            </figure>
                        </button>
                        <button className="syntaxsniper-options-false" onClick={() => optionSelect("false")}>
                            <figure className="syntaxsniper-options-false-fig" >
                                <img src={rightArrow} alt="Incorrect" border="0" />
                                <figcaption>Incorrect</figcaption>
                            </figure>
                        </button>
                    </div>
                </div>
                <div className='syntaxsniper-footer'>
                </div>
            </div>
        );
    } else {
        return (
            <MatchmakingLoader loading={loading}/>
        );
    }
}

export default Syntaxsniper;