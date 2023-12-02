import React, { useEffect, useRef, useState, useNavigate } from 'react';
import "../../../styles/Singleplayer/games/speedcode.css";
import axios from 'axios';
import { io } from 'socket.io-client';

function Speedcode() {
    const [code, setCode] = useState('');
    const bracketPairs = { '(': ')', '{': '}', '[': ']' };
    const [currSocket, setCurrSocket] = useState(null);
    const [room, setRoom] = useState(null);
    const navigate = useNavigate();

    const playerid = 1;
    const gameid = 1;

    useEffect(() => {
        // Connect to the Socket.IO server on the /matchmaking namespace
        const socket = io('http://192.168.2.130:5000');
    
        // Listen for the 'connect' event
        socket.on('connect', () => {
            console.log('Connected to server');
        });
    
        // Listen for the 'disconnect' event
        socket.on('disconnect', (data) => {
            socket.disconnect();
            console.log('Disconnected from server');
            setRoom(null);
            setCurrSocket(null);

            if (data.reason === 'player quit') {
                navigate('/singleplayer');
            }
        });
    
        // Listen for the 'match_found' event
        socket.on('match_found', (data) => {
            console.log('Match found:', data);
            setRoom(data.roomId);
        });
    
        socket.emit('queue', { player_id: playerid, game_id: gameid });
        // socket.emit('message', { player_id: playerid, game_id: gameid })

        // socket.on('custom_response', (data) => console.log(data))

        setCurrSocket(socket)
        // Clean up the socket connection when the component unmounts
        return () => {
            socket.emit('delete_room', { room_id: room, game_id: gameid, reason: 'player quit' });
            socket.disconnect();
            setRoom(null);
            setCurrSocket(null);
        };
    }, []);

    useEffect(() => {
        console.log(code)
    }, [code])

    const lineNums = () => {
        const lines = code.split('\n');
        lines.push('extra line number')
        return lines.map((line, index) => (
            <p className='speedcode-line-num'>{index + 1}</p>
        ));
    };

    const handleKeyPress = (e) => {
        const { value, selectionStart, selectionEnd } = e.target;

        if (e.key === '(' || e.key === '{' || e.key === '[') {
            e.preventDefault()
            const closingBracket = bracketPairs[e.key];
            console.log(value.substring(0, selectionStart))
            console.log(value.substring(selectionEnd))
            const updatedCode = `${value.substring(0, selectionStart)}${e.key}${closingBracket}${value.substring(selectionEnd)}`;
            setCode(updatedCode);
            e.target.setSelectionRange(selectionStart + 1, selectionStart + 1);
            const event = new KeyboardEvent('keydown', { key: 'ArrowLeft', keyCode: 37 });
            window.dispatchEvent(event);
        } else if (e.key === 'Tab') {
            e.preventDefault();
            const updatedCode = `${value.substring(0, selectionStart)}    ${value.substring(selectionEnd)}`;
            setCode(updatedCode);
            e.target.setSelectionRange(selectionStart + 4, selectionStart + 4);
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
            setTime((prevTime) => prevTime + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    /* Code Actions */

    const runCode = async () => {
        const userCode = document.getElementById('speedcode-code-input').value;
        
        const response = await axios.post("http://127.0.0.1:5000/code", {
            "user_code": userCode
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log(response.data);
    }

    if (room !== null && currSocket !== null) {
        return (
            <div className='speedcode-cont'>
                <div className='speedcode-header'>
                    <div className='speedcode-timer-cont'>
                        <h1>{formatTime(time)}</h1>
                    </div>
                    <div className='speedcode-opponent-info-cont'>
                        <h3>Opponent  : User135</h3>
                        <p>Max Cases Passed: 3/5</p>
                    </div>
                </div>
                <div className='speedcode-ide-cont'>
                    <div className='speedcode-ls'>
                        <div className='speedcode-line-nums' ref={nums}>
                            {lineNums()}
                        </div>
                        <div className='speedcode-code-input-cont'>
                            <textarea value={code} onKeyDown={handleKeyPress} onPaste={e => e.preventDefault()} ref={codeInput} onScroll={scrollNums} onChange={e => setCode(e.target.value)} id='speedcode-code-input' className='speedcode-code-input'>

                            </textarea>
                        </div>
                    </div>
                    <div className='speedcode-rs'>
                        <div className='speedcode-problem-cont'>
                            <h1 className='speedcode-problem-title'>isAnagram?</h1>
                            <textarea className='speedcode-problem'></textarea>
                        </div>
                        <div className='speedcode-console-cont'>
                            <textarea className='speedcode-console'></textarea>
                        </div>
                    </div>
                </div>
                <div className='speedcode-footer'>
                    <div className='speedcode-code-actions'>
                        <button>Clear Code</button>
                        <button>Submit</button>
                    </div>
                    <div className='speedcode-run-actions'>
                        <button onClick={runCode}>Run Code</button>
                        <button onClick={null}>Run Tests</button>
                    </div>
                </div>
            </div>
        );
    } else {
        return (
            <div className='speedcode-cont'>
                <h1>Finding Match</h1>
            </div>
        );
    }
}

export default Speedcode;