import React, { useEffect, useRef, useState } from 'react';
import "../../../styles/Singleplayer/games/tracetitans.css";
import axios from 'axios';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router';
import MatchmakingLoader from '../../Loaders/Matchmaking/matchmaking';

function Tracetitans({ user }) {
    const gameid = 5;

    const room = useRef(null);
    const matchFound = useRef(false);
    
    const navigate = useNavigate();

    const [currSocket, setCurrSocket] = useState(null);
    const [problem, setProblem] = useState([]);
    const [opponent, setOpponent] = useState('');
    const [loading, setLoading] = useState(true);

    const [answers, setAnswers] = useState([]);
    const [oppAnswers, setOppAnswers] = useState([]);
    const [currProblem, setCurrProblem] = useState(0);
    const timePerQuestion = 600;

    let score = 0;
    let oppScore = 0;
    score = scoreCount(answers, problem[3]);
    oppScore = scoreCount(oppAnswers, problem[3]);

    
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


        socket.on('oppAnswerUpdateSent', (data) => {
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
        currSocket.emit('oppAnswerUpdate', {game_id: gameid, room_id: room.current, answers: newAnswers});
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
        currSocket.emit('oppAnswerUpdate', {game_id: gameid, room_id: room.current, answers: newAnswers});

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

    function formatArrays(arr1, arr2, arr3) {
        let p1 = 'Your Answers';
        let p2 = opponent+' Answers'
        let result = ` ${p1.padEnd(10, ' ')} - ${p2.padStart(10, ' ')}\n\n`;
        for (let i = 0; i < arr2.length; i++) {
          let val1 = arr1[i] === arr3[i] ? 'Correct' : arr1[i] === undefined ? '': 'Incorrect';
          let val2 = arr2[i] === arr3[i] ? 'Correct' : arr2[i] === undefined ? '': 'Incorrect';
          result += `${i + 1}) ${val1.padEnd(10, ' ')} - ${val2.padStart(10, ' ')}\n`;
        }
        return result;
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
                            <button className="tracetitans-options-1" onClick={() => optionSelect(problem[4][currProblem][0])}>{problem[4][currProblem][0]}</button>
                            <button className="tracetitans-options-2" onClick={() => optionSelect(problem[4][currProblem][1])}>{problem[4][currProblem][1]}</button>
                        </div>
                        <div className='tracetitans-options-34'>
                            <button className="tracetitans-options-3" onClick={() => optionSelect(problem[4][currProblem][2])}>{problem[4][currProblem][2]}</button>
                            <button className="tracetitans-options-4" onClick={() => optionSelect(problem[4][currProblem][3])}>{problem[4][currProblem][3]}</button>
                        </div>
                    </div>
                </div>
            );
        } else{
            return (
                <div>
                    <div className='tracetitans-result'>
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
                    <div className='tracetitans-timer-cont'>
                        <h1>{formatTime(time)}</h1>
                    </div>
                    <div className='tracetitans-opponent-info-cont'>
                        <h3 className='tracetitans-opponent-name'>Opponent: {opponent}&nbsp;&nbsp;</h3>
                        <p className='tracetitans-score'>Your Score: {score}/{problem[2].length}</p>
                    </div>
                </div>
                <div className='tracetitans-ide-cont'>
                    <div className='tracetitans-ls'>
                        <h1>{problem[0]}</h1>
                        <textarea readOnly value={problem[1]} className='tracetitans-problem'></textarea>
                    </div>
                    
                    <div className='tracetitans-rs'>
                        <div className='tracetitans-problem-cont'>
                            <h1 className='tracetitans-problem-title'>Answers</h1>
                            {optionGenerate()}
                        </div>
                        <div>
                            <textarea readOnly value={formatArrays(answers,oppAnswers,problem[3])} className='tracetitans-problem'></textarea>
                        </div>
                    </div>
                    
                </div>
                <div className='tracetitans-footer'>
                    <div className='tracetitans-options'>
                    </div>
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