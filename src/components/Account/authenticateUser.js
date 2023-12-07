import React, { useEffect, useState, useRef } from 'react';
import "../../styles/Account/authenticateUser.css"
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AuthenticateUser({ setUser }) {
    const terminal = useRef(null)
    const navigate = useNavigate();
    const [stage, setStage] = useState(0);
    const [initText, setInitText] = useState("> Initializing");
    const [initTextCounter, setInitTextCounter] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        nextInput()
    }, [stage])

    useEffect(() => {
        window.addEventListener('focus', nextInput);
        window.addEventListener('click', nextInput);
    
        return () => {
          window.removeEventListener('focus', nextInput);
          window.removeEventListener('click', nextInput)
        };
      }, []);

    const sleep = (milliseconds) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    };

    const scrollTerminal = () => {
        if (terminal.current) {
            terminal.current.scrollTop = terminal.current.scrollHeight;
        }
    }

    useEffect(() => {
        scrollTerminal()
    })

    const nextInput = () => {
        const inputs = Array.from(document.getElementsByTagName('input'));
        
        for (let x = inputs.length - 1;x >= 0;x--) {
            const parent = inputs[x].parentElement;
            if (getComputedStyle(parent).visibility === "visible" && inputs[x].disabled === false) {
                inputs[x].focus()
                break;
            }
        }
    }

    useEffect(() => {
        const handleInitText = async () => {
            await sleep(250)
            if (initText === "> Initializing") {
                setInitText("> Initializing.")
            } else if (initText === "> Initializing.") {
                setInitText("> Initializing..")
            } else if (initText === "> Initializing..") {
                setInitText("> Initializing...")
            } else if (initText === "> Initializing...") {
                setInitText("> Initializing")
            }
        }

        setInitTextCounter(initTextCounter + 1)
        if (initTextCounter <= 13) {
            handleInitText()
        } else {
            nextInput()
        }
    }, [initText])

    const [authRes, setAuthRes] = useState([]);

    useEffect(() => {
        nextInput()
    }, [authRes])

    const handleAuthInput = (e) => {
        setAuthRes(prevAuthRes => {
                const currOpt = e.target.value
                e.target.disabled = true;

                if (currOpt === '1') { //|| currOpt === '2' (uncomment and place in conditional statement for production)
                    setStage(Number(currOpt))
                    
                    let newRes = null

                    if (currOpt === '1') {
                        newRes = (
                            <>
                                <h1>{"> Credentials Required:"}</h1>
                            </>
                        )
                    } else {
                        newRes = (
                            <>
                                <h1>{"> Input Credentials:"}</h1>
                            </>
                        )
                    }
        
                    return [...prevAuthRes, newRes]
                } else {
                    const newRes = (
                        <>
                            <h1 style={{color: 'red'}}>{"> ERROR: Please select a valid option."}</h1>
                            <h1 className='opt-txt'>{"> login (1) / signup (2)"}</h1>
                            <input className='auth-inp' onChange={handleAuthInput}/>
                        </>
                    )
        
                    return [...prevAuthRes, newRes]
                }
            }
        )
    }

    const currUsername = useRef(null);
    const passwordCont = useRef(null);
    const [loginRes, setLoginRes] = useState([]);
 
    const handleUsername = (e) => {
        if (e.key === "Enter") {
            if (stage === 1) {
                setStage(1.1)
            } else if (stage === 3) {
                setStage(3.1)
            }

            passwordCont.current = null;
            
            setLoginRes(prevLoginRes => {

                const newRes = (
                    <>
                        <div ref={passwordCont} className='password-cont'>
                            <h1 className='password-txt'>{"> $password="}</h1>
                            <input className='password' type='password' onKeyDown={handleLogin}/>
                        </div>
                    </>
                )

                return [...prevLoginRes, newRes]
            })

            e.target.disabled = true;
        }
    }

    const [authText, setAuthText] = useState("")
    const authUse = useRef(null);

    useEffect(() => {
        const handleAuthText = async () => {
            if (authUse.current) {
                await sleep(250)
                if (authText === "> Authenticating" && authUse.current) {
                    setAuthText("> Authenticating.")
                    authUse.current.innerText = "> Authenticating."
                } else if (authText === "> Authenticating." && authUse.current) {
                    setAuthText("> Authenticating..")
                    authUse.current.innerText = "> Authenticating.."
                } else if (authText === "> Authenticating.." && authUse.current) {
                    setAuthText("> Authenticating...")
                    authUse.current.innerText = "> Authenticating..."
                } else if (authText === "> Authenticating..." && authUse.current) {
                    setAuthText("> Authenticating")
                    authUse.current.innerText = "> Authenticating"
                }
            }
        }

        if (authUse.current && authText !== "") {
            handleAuthText()
        } else if (!authUse.current) {
            setAuthText("")
        }
    }, [authText])

    const handleLogin = async (e) => {
        if (e.key === "Enter") {
            e.target.disabled = true;
            setAuthText("> Authenticating")
            setLoginRes(prevLoginRes => {
                const authRes = (<h1 ref={authUse}>{"> Authenticating"}</h1>);
    
                return [...prevLoginRes, authRes]
            })
            
            const username = currUsername.current.value;
            const pass = e.target.value;

            try {
                const response = await axios.post("http://192.168.2.130:5000/auth", {
                    "user_info": {
                        "action": "login",
                        "username": username.toLowerCase(),
                        "password": pass
                    }
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.data.message === "Success") {

                    setLoginRes(prevLoginRes => {
                        const newRes = (
                            <>
                                <h1 style={{color: "#009E00"}}>{"> Credentials: OK"}</h1>
                                <h1>{"> Welcome " + username + "!"}</h1>
                                <button onClick={() => navigate('/mainmenu')}>Commence Clashing</button>
                            </>
                        )
            
                        return [...prevLoginRes, newRes]
                    })
                    setUser(response.data.username)
                } else {
                    alert(response.data)
                    currUsername.current = null;
    
                    setLoginRes(prevLoginRes => {
    
                        const newRes = (
                            <>
                                <h1 style={{color: 'red'}}>{"> Credentials: INVALID"}</h1>
                                <div className='username-cont'>
                                    <h1 className='username-txt'>{"> $username="}</h1>
                                    <input ref={currUsername} className='username' onKeyDown={handleUsername}/>
                                </div>
                            </>
                        )
    
                        return [...prevLoginRes, newRes]
                    })
                }
                authUse.current.innerText = "> Authentication Status:"
                authUse.current = null;
            } catch (error) {
                currUsername.current = null;
    
                setLoginRes(prevLoginRes => {

                    const newRes = (
                        <>
                            <h1 style={{color: 'red'}}>{"> Credentials: INVALID"}</h1>
                            <div className='username-cont'>
                                <h1 className='username-txt'>{"> $username="}</h1>
                                <input ref={currUsername} className='username' onKeyDown={handleUsername}/>
                            </div>
                        </>
                    )

                    return [...prevLoginRes, newRes]
                })
            }
        }
    }

    useEffect(() => {
        nextInput()
        console.log('here')
    }, [loginRes])

    const [signupRes, setSignupRes] = useState([]);
    
    const signupInpOne = useRef(null);
    const signupInpTwo = useRef(null);
    const signupInpThree = useRef(null);
    const signupInpFour = useRef(null);

    const handleSignUp = async (e) => {
        if (e.key === "Enter") {
            if (signupInpFour.current.className === "confirm-password-cont") {
                //return a cipher thingy to show and handle errors and just return err msg and let them try again. After that, try resetting all things back to login again and clear console.
                let error = false
                const username = signupInpOne.current.querySelector('input').value
                const email = signupInpTwo.current.querySelector('input').value
                const pass = signupInpThree.current.querySelector('input').value
                const confirmPass = signupInpFour.current.querySelector('input').value

                e.target.disabled = true;
                signupInpOne.current = null;
                signupInpTwo.current = null;
                signupInpThree.current = null;
                signupInpFour.current = null;
                
                console.log(username, email, pass, confirmPass)

                if (pass === confirmPass) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    
                    if (emailRegex.test(email) === false) {
                        error = <h1>{"> "}<span style={{color: "red"}}>ERROR:</span>{" Invalid email address"}</h1>
                        console.log('here errror email')
                    } else {
                        setAuthText("> Authenticating")
                        setSignupRes(prevSignupRes => {
                            const authRes = (<h1 ref={authUse}>{"> Authenticating"}</h1>);
                
                            return [...prevSignupRes, authRes]
                        })
                        try {
                            const response = await axios.post("http://192.168.2.130:5000/auth", {
                                "user_info": {
                                    "action": "signup",
                                    "username": username.toLowerCase(),
                                    "email": email.toLowerCase(),
                                    "password": pass
                                }
                            }, {
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            });
    
                            if (response.data.message !== "Success") {
                                error = <h1>{"> "}<span style={{color: "red"}}>ERROR:</span>{" Unable to create account"}</h1>
                                console.log('here errror')
                            } else {
                                alert(response.data)
                            }
                        } catch (err) {
                            error = <h1>{"> "}<span style={{color: "red"}}>ERROR:</span>{" Unable to create account"}</h1>
                            console.log('no its here lol')
                        }
                        authUse.current.innerText = "> Authentication Status:"
                        authUse.current = null;
                    }
                } else {
                    error = <h1>{"> "}<span style={{color: "red"}}>ERROR:</span>{" Passwords do not match"}</h1>
                }

                if (error) {
                    const newRes = (
                        <>  
                            {error}
                            <div ref={signupInpOne} className={'username-cont'}>
                                <h1 className='username-txt'>{"> $username ="}</h1>
                                <input className='username' onKeyDown={handleSignUp}/>
                            </div>
                            <div ref={signupInpTwo} className={'email-cont inactive'}>
                                <h1 className='email-txt'>{"> $email_address ="}</h1>
                                <input className='email' onKeyDown={handleSignUp}/>
                            </div>
                            <div ref={signupInpThree} className={'password-cont inactive'}>
                                <h1 className='password-txt'>{"> $password ="}</h1>
                                <input className='password' type='password' onKeyDown={handleSignUp}/>
                            </div>
                            <div ref={signupInpFour} className={'confirm-password-cont inactive'}>
                                <h1 className='confirm-password-txt'>{"> $confirm_password ="}</h1>
                                <input className='confirm-password' type='password' onKeyDown={handleSignUp}/>
                            </div>
                        </>
                    )

                    setSignupRes((prevSignupRes) => [...prevSignupRes, newRes])
                } else if (!error) {
                    const newRes = (
                        <>
                            <h1>{"> "}<span style={{color: "#009E00"}}>SUCCESS:</span>{" Account has been created"}</h1>
                            <h1>{"> Input Credentials:"}</h1>
                        </>
                    )

                    setSignupRes((prevSignupRes) => [...prevSignupRes, newRes]);
                    setStage(3);
                }
            } else if (signupInpThree.current.className === "password-cont") {
                e.target.disabled = true;
                signupInpFour.current.className = "confirm-password-cont";
                nextInput()
            } else if (signupInpTwo.current.className === "email-cont") {
                e.target.disabled = true;
                signupInpThree.current.className = "password-cont"
                nextInput()
            } else if (signupInpOne.current.className === "username-cont") {
                e.target.disabled = true;
                signupInpTwo.current.className = "email-cont"
                nextInput()
            }
        }
    }

    useEffect(() => {
        nextInput()
    }, [signupRes])

    return (
        <div className='login-page'>
            <div className='terminal' ref={terminal}>
                <h1>Welcome to Code Clash!</h1>
                <h1 className='init-txt' style={{color: initTextCounter >= 13 ? "#009E00":"white"}}>{initTextCounter >= 13 ? "> Initialization Complete":initText}</h1>
                <h1 className='auth-txt' style={{visibility: initTextCounter >= 13 ? "visible":"hidden"}}>{"> User Authentication Required:"}</h1>
                <div className='auth-opt-cont'>
                    <div id='auth-res-cont' style={{visibility: initTextCounter >= 13 ? "visible":"hidden"}}>
                        <h1 className='opt-txt'>{'> login (1) / signup (2)'}</h1>
                        <input className='auth-inp' onChange={handleAuthInput}/>
                        {authRes.map(res => (res))}
                    </div>
                </div>

                <div className={stage >= 1 && stage < 2 ? 'login-cont':'login-cont inactive'}>
                    <div className='login-res-cont'>
                        <div className='username-cont'>
                            <h1 className='username-txt'>{"> $username ="}</h1>
                            <input ref={stage >= 1 && stage < 2 ? currUsername:null} className='username' onKeyDown={handleUsername}/>
                        </div>
                        {loginRes.map(res => (res))}
                    </div>
                </div>


                <div className={stage >= 2 ? 'signup-cont':'signup-cont inactive'}>
                    <div className='signup-res-cont'>
                        <div ref={signupInpOne} className={'username-cont'}>
                            <h1 className='username-txt'>{"> $username ="}</h1>
                            <input className='username' onKeyDown={handleSignUp}/>
                        </div>
                        <div ref={signupInpTwo} className={'email-cont inactive'}>
                            <h1 className='email-txt'>{"> $email_address ="}</h1>
                            <input className='email' onKeyDown={handleSignUp}/>
                        </div>
                        <div ref={signupInpThree} className={'password-cont inactive'}>
                            <h1 className='password-txt'>{"> $password ="}</h1>
                            <input className='password' type='password' onKeyDown={handleSignUp}/>
                        </div>
                        <div ref={signupInpFour} className={'confirm-password-cont inactive'}>
                            <h1 className='confirm-password-txt'>{"> $confirm_password ="}</h1>
                            <input className='confirm-password' type='password' onKeyDown={(event) => handleSignUp(event)}/>
                        </div>
                        {signupRes.map(res => (res))}
                    </div>
                </div>

                <div className={stage >= 3 && stage < 4 ? 'login-cont':'login-cont inactive'}>
                    <div className='login-res-cont'>
                        <div className='username-cont'>
                            <h1 className='username-txt'>{"> $username ="}</h1>
                            <input ref={stage >= 3 && stage < 4 ? currUsername:null} className='username' onKeyDown={handleUsername}/>
                        </div>
                        {stage >= 3 && stage < 4 ? loginRes.map(res => (res)):null}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AuthenticateUser;

//FF0000