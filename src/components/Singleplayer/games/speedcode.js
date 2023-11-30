import React, { useEffect, useRef, useState } from 'react';
import "../../../styles/Singleplayer/games/speedcode.css";
import axios from 'axios';

function Speedcode() {
    const [code, setCode] = useState('');
    const bracketPairs = { '(': ')', '{': '}', '[': ']' };

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
                    <button>Run Tests</button>
                </div>
            </div>
        </div>
    );
}

export default Speedcode;