import React, { useEffect, useRef, useState } from 'react';
import "../../../styles/Singleplayer/games/bugblitz.css";
import axios from 'axios';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router';
import MatchmakingLoader from '../../Loaders/Matchmaking/matchmaking';

function BugBlitz({ user }) {
    const gameid = 2;
    const bracketPairs = { '(': ')', '{': '}', '[': ']' };

    const room = useRef(null);
    const matchFound = useRef(false);
    const codeConsole = useRef(null);
    
    const navigate = useNavigate();

    const [code, setCode] = useState('');
    const [currSocket, setCurrSocket] = useState(null);
    const [problem, setProblem] = useState([]);
    const [problemText, setProblemText] = useState('');
    const [consoleText, setConsoleText] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [maxCases, setMaxCases] = useState(0);
    const [opponent, setOpponent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (codeConsole.current) {
            codeConsole.current.scrollTop = codeConsole.current.scrollHeight;
        }
    }, [consoleText])

    useEffect(() => {
        if (problem.length !== 0) {
            setCode(problem[8])

            const desc = "Problem Description:\n\n" + problem[2] + "\n\n\n" + "Constraints:\n\n"
            let constraints = ""
            let examples = ""

            for(let x = 0; x < problem[3].length; x++) {
                constraints += (x + 1) + '. ' + problem[3][x] + "\n"
            }

            constraints += "\n\nExamples:\n\n"

            for (let example of problem[4]) {
                examples += example + "\n"
            }

            setProblemText(desc + constraints + examples)
        }
    }, [problem])

    const sleep = (milliseconds) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    };

    useEffect(() => {
        // Connect to the Socket.IO server
        const socket = io('http://192.168.2.130:5000');
        setCurrSocket(socket)

        socket.on('game_over', () => {
            alert('You lost, better luck next time!')
            navigate('/singleplayer');
        })

        socket.on('update_cases', (data) => {
            setMaxCases(data.cases);
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
            console.log(data.problem[8])
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

    const [cursorPos, setCursorPos] = useState(0);

    useEffect(() => {
        codeInput.current?.setSelectionRange(cursorPos, cursorPos);
    }, [cursorPos]);
    

    const lineNums = () => {
        const lines = code.split('\n');
        lines.push('extra line number')
        return lines.map((line, index) => (
            <p key={index} className='bugblitz-line-num'>{index + 1}</p>
        ));
    };

    const handleKeyPress = (e) => {
        const { value, selectionStart, selectionEnd } = e.target;

        console.log(e)
        if (e.key === '(' || e.key === '{' || e.key === '[') {
            e.preventDefault();
            const closingBracket = bracketPairs[e.key];
            const updatedCode = `${value.substring(0, selectionStart)}${e.key}${closingBracket}${value.substring(selectionEnd)}`;
            setCursorPos(selectionStart + 1)
            setCode(updatedCode);
        } else if (e.key === 'Tab') {
            e.preventDefault();
            const updatedCode = `${value.substring(0, selectionStart)}    ${value.substring(selectionEnd)}`;
            setCursorPos(selectionStart + 4)
            setCode(updatedCode);
        }
    };

    const nums = useRef(null);
    const codeInput = useRef(null);

    const scrollNums = () => { 
        const codeInputScroll = codeInput.current.scrollTop;
        nums.current.scrollTop = codeInputScroll;
    }

    const [time, setTime] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            if (matchFound.current && currSocket !== null) {
                setTime((prevTime) => prevTime + 1);
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

    const runCode = async (action) => {
        const userCode = document.getElementById('bugblitz-code-input').value;

        let reqData = null;

        if (action === 'run_code') {
            reqData = {
                "code": userCode,
                "action": action,
                "game_id": gameid,
                "output_type": problem[7]
            }
        } else if (action === 'run_tests') {
            reqData = {
                "code": userCode,
                "action": action,
                "tests": problem[6],
                "game_id": gameid,
                "output_type": problem[7]
            }
        }

        console.log(problem[6])

        const response = await axios.post("http://127.0.0.1:5000/code", {
            "code_info": JSON.stringify(reqData)
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log(response.data)
        const output = response.data

        if (action === 'run_code') {
            if (output.output) {
                setConsoleText((prevConsoleText) => prevConsoleText + "Output:\n" + output.output + "\n")
            } else if (output.error) {
                setConsoleText((prevConsoleText) => prevConsoleText + "Error:\n" + output.error + "\n")
            } else {
                setConsoleText((prevConsoleText) => prevConsoleText + "Error:\nNo output is being captured, please check your code.\n\n")
            }
        } else if (action === 'run_tests') {

            if (response.data.error) {
                setConsoleText((prevConsoleText) => prevConsoleText + "Error:\n" + response.data.error + "\n\n")
            } else if (response.data.output) {
                let cases_passed = 0;

                for (let val of response.data.output) {
                    if (val) {
                        cases_passed++;
                    }
                }

                let result = ""
                let gameOver = false;

                if (cases_passed === 10) {
                    result += cases_passed + "/10"
                    result += "\nAll cases passed, well done!"
                    gameOver = true;
                } else {
                    result += cases_passed + "/10"
                }
                setConsoleText((prevConsoleText) => prevConsoleText + "Cases Passed:\n" + result + "\n\n")

                if (gameOver) {
                    currSocket.emit('game_over', { room_id: room.current, game_id: gameid })
                    alert('You won!')
                    navigate('/singleplayer');
                } else {
                    currSocket.emit('update_cases', { room_id: room.current, cases: cases_passed, game_id: gameid })
                }
            }
        } 
    }

    if (submitted) {
        <div className='bugblitz-cont'>
            <h1>Waiting for opponent...</h1>
        </div>
    } else if (matchFound.current && currSocket !== null && problem.length !== 0) {
        return (
            <div className='bugblitz-cont'>
                <div className='bugblitz-header'>
                    <div className='bugblitz-timer-cont'>
                        <h1>{formatTime(time)}</h1>
                    </div>
                    <div className='bugblitz-opponent-info-cont'>
                        <h3>Opponent: {opponent}</h3>
                        <p>Max Cases Passed: {maxCases}/10</p>
                    </div>
                </div>
                <div className='bugblitz-ide-cont'>
                    <div className='bugblitz-ls'>
                        <div className='bugblitz-line-nums' ref={nums}>
                            {lineNums()}
                        </div>
                        <div className='bugblitz-code-input-cont'>
                            <textarea value={code} onKeyDown={handleKeyPress} onPaste={/*e => e.preventDefault()*/null} ref={codeInput} onScroll={scrollNums} onChange={e => setCode(e.target.value)} id='bugblitz-code-input' className='bugblitz-code-input'>
                            
                            </textarea>
                        </div>
                    </div>
                    <div className='bugblitz-rs'>
                        <div className='bugblitz-problem-cont'>
                            <h1 className='bugblitz-problem-title'>{problem[1]}</h1>
                            <textarea readOnly value={problemText} className='bugblitz-problem'></textarea>
                        </div>
                        <div className='bugblitz-console-cont'>
                            <textarea ref={codeConsole} value={consoleText} readOnly className='bugblitz-console'></textarea>
                        </div>
                    </div>
                </div>
                <div className='bugblitz-footer'>
                    <div className='bugblitz-code-actions'>
                        <button onClick={() => setCode(problem[8])}>Reset Code</button>
                        <button>Submit</button>
                    </div>
                    <div className='bugblitz-run-actions'>
                        <button onClick={() => runCode("run_code")}>Run Code</button>
                        <button onClick={() => runCode("run_tests")}>Run Tests</button>
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

export default BugBlitz;