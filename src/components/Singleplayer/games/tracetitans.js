import React, { useEffect, useRef, useState } from 'react';
import "../../../styles/Singleplayer/games/tracetitans.css";
import axios from 'axios';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router';
import MatchmakingLoader from '../../Loaders/Matchmaking/matchmaking';
import checkMark from '../../../assets/images/checkMark.png';

function Tracetitans({ user }) {
    const gameid = 5;

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
    score = scoreCount(answers, problem[3]);
    oppScore = scoreCount(oppAnswers, problem[3]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            event.preventDefault();
            console.log('Keydown event fired', event.key);
            console.log('Arrow active', arrowActive);
            if (event.key === 'ArrowUp') {
                if (arrowActive !== 1 || arrowActive !== 2 ) {
                    setArrowActive((prevArrowActive) => {
                        if (prevArrowActive === 3) {
                          return 1;
                        } else if (prevArrowActive === 4) {
                          return 2;
                        }
                        return prevArrowActive;
                    });                      
                }
            } else if (event.key === 'ArrowDown') {
                if (arrowActive !== 3 || arrowActive !== 4) {
                    setArrowActive((prevArrowActive) => {
                        if (prevArrowActive === 1) {
                          return 3;
                        } else if (prevArrowActive === 2) {
                          return 4;
                        }
                        return prevArrowActive;
                    });      
                }
            } else if (event.key === 'ArrowLeft') {
                if (arrowActive !== 1 || arrowActive !== 3) {
                    setArrowActive((prevArrowActive) => {
                        if (prevArrowActive === 2) {
                          return 1;
                        } else if (prevArrowActive === 4) {
                          return 3;
                        }
                        return prevArrowActive;
                    });      
                }
            } else if (event.key === 'ArrowRight') {
                if (arrowActive !== 2 || arrowActive !== 4) {
                    setArrowActive((prevArrowActive) => {
                        if (prevArrowActive === 1) {
                          return 2;
                        } else if (prevArrowActive === 3) {
                          return 4;
                        }
                        return prevArrowActive;
                    });      
                }
            } else if (event.key === 'Enter') {
                let buttonStr = "tracetitans-options-" + String(arrowActive);
                document.getElementsByClassName(buttonStr)[0].click();
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
            setTime(timePerQuestion);
        });
        
        socket.on('time_reduce', (data) => {
            setTime(10);
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
        newAnswers = answers.concat([action]);
        console.log(action+" pressed");
        setAnswers(newAnswers);
        console.log(newAnswers);
        currSocket.emit('update_cases', {game_id: gameid, room_id: room.current, cases: newAnswers});
        setTime(timePerQuestion);
        setCurrProblem(currProblem+1);

        console.log("HHHH "+newAnswers.length+", "+oppAnswers.length);
        if (newAnswers.length > oppAnswers.length){
            currSocket.emit('time_reduce', { room_id: room.current, game_id: gameid })

        }

        console.log(oppAnswers.length+"==="+newAnswers.length);
        if (oppAnswers.length === newAnswers.length && currProblem+1 === problem[3].length) {
            if (scoreCount(newAnswers,problem[3]) > oppScore) {
                currSocket.emit('game_over', { room_id: room.current, game_id: gameid })
                alert('You won!')
            } else if (scoreCount(newAnswers,problem[3]) === oppScore) {
                currSocket.emit('game_over_tie', { room_id: room.current, game_id: gameid })
                alert("It's a TIE!")
            }
            navigate('/singleplayer');
        }
    }

    if (time === 0) {
        let newAnswers;
        newAnswers = answers.concat([""]);
        console.log("nothing pressed");
        setAnswers(newAnswers);
        console.log(newAnswers);
        currSocket.emit('update_cases', {game_id: gameid, room_id: room.current, cases: newAnswers});

        setTime(timePerQuestion);
        setCurrProblem(currProblem+1);

        console.log(oppAnswers.length+"==="+newAnswers.length);
        if (oppAnswers.length === newAnswers.length && currProblem+1 === problem[3].length) {
            if (scoreCount(newAnswers,problem[3]) > oppScore) {
                currSocket.emit('game_over', { room_id: room.current, game_id: gameid })
                alert('You won!')
            } else if (scoreCount(newAnswers,problem[3]) === oppScore) {
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


    function optionGenerate() {
        if (oppAnswers.length >= answers.length && currProblem < problem[3].length){
            return (
                <div>
                    <div className='tracetitans-result'>
                        <h2 className='tracetitans-result-title'>{problem[0]+'('+problem[2][currProblem]+')'} </h2>
                    
                        <div className='tracetitans-options-12'>
                            <button className="tracetitans-options-1" onClick={() => optionSelect(problem[4][currProblem][0])} style={{backgroundColor: arrowActive === 1 ? "#50C878":""}}>{problem[4][currProblem][0]}</button>
                            <button className="tracetitans-options-2" onClick={() => optionSelect(problem[4][currProblem][1])} style={{backgroundColor: arrowActive === 2 ? "#50C878":""}}>{problem[4][currProblem][1]}</button>
                        </div>
                        <div className='tracetitans-options-34'>
                            <button className="tracetitans-options-3" onClick={() => optionSelect(problem[4][currProblem][2])} style={{backgroundColor: arrowActive === 3 ? "#50C878":""}}>{problem[4][currProblem][2]}</button>
                            <button className="tracetitans-options-4" onClick={() => optionSelect(problem[4][currProblem][3])} style={{backgroundColor: arrowActive === 4 ? "#50C878":""}}>{problem[4][currProblem][3]}</button>
                        </div>
                    </div>
                </div>
            );
        } else{
            return (
                <div>
                    <div className='tracetitans-result2'>
                        <h2 className='tracetitans-result-title'>{problem[0]+'( )'} </h2>
                        <h2 className='tracetitans-result-title'>Wait for Opponent... </h2>
                    
                    </div>
                </div>
            );
        }
    }


    
    if (matchFound.current && currSocket !== null) {
        return (
            <div className='tracetitans-cont'>
                <div className='tracetitans-header'>
                    <div className='tracetitans-player-info-cont'>
                        <div className='tracetitans-player-name-cont'>
                            <div className='tracetitans-player-name'>&nbsp;{player}&nbsp;</div>
                        </div>
                        <div className='tracetitans-pscore-cont'>
                            <figure>
                                <figcaption className='tracetitans-pscore-caption'><div className='tracetitans-pscore'>&nbsp;{score}</div></figcaption>
                                <img src={checkMark} alt="Correct" border="0" />
                            </figure>   
                        </div>
                    </div>
                    <div className='tracetitans-timer-cont'>
                        <h1 className='tracetitans-time'>{formatTime(time)}</h1>
                    </div>
                    <div className='tracetitans-opponent-info-cont'>
                        <div className='tracetitans-opponent-name-cont'>
                            <div className='tracetitans-opponent-name'>Opponent: {opponent}&nbsp;</div>
                        </div>
                        <div className='tracetitans-oppscore-cont'>
                            <figure>
                                <figcaption className='tracetitans-oppscore-caption'><div className='tracetitans-oppscore'>{oppScore}&nbsp;</div></figcaption>
                                <img src={checkMark} alt="Correct" border="0" />
                            </figure>
                            
                        </div>
                    </div>
                </div>
                <div className='tracetitans-ls'>
                    <textarea readOnly value={problem[1]} className='tracetitans-problem'></textarea>
                    <h1 className='tracetitans-problem-text'>Output of the following function call:</h1>
                    <div className='tracetitans-options'>
                       {optionGenerate()}
                    </div>
                </div>
                <div className='tracetitans-footer'>
                </div>
            </div>
        );
    } else {
        return (
            <MatchmakingLoader loading={loading}/>
        );
    }
}

export default Tracetitans;