import React, { useEffect, useState } from 'react';
import "../../../styles/Loaders/Matchmaking/matchmaking.css";

function MatchmakingLoader() {
    const [matchmakingText, setMatchmakingText] = useState('> Finding a match');
    const [loaderWidth, setLoaderWidth] = useState('0%');

    const sleep = (milliseconds) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    };

    useEffect(() => {
        const handleMatchmakingText = async () => {
            await sleep(250)
            if (matchmakingText === "> Finding a match") {
                setMatchmakingText("> Finding a match.")
            } else if (matchmakingText === "> Finding a match.") {
                setMatchmakingText("> Finding a match..")
            } else if (matchmakingText === "> Finding a match..") {
                setMatchmakingText("> Finding a match...")
            } else if (matchmakingText === "> Finding a match...") {
                setMatchmakingText("> Finding a match")
            }
        }

        handleMatchmakingText()
    }, [matchmakingText])

    useEffect(() => {
        const handleLoader = async () => {
            console.log('here')
            if (loaderWidth === '0%') {
                await sleep(500)
                setLoaderWidth('30%')
            } else if (loaderWidth === '30%') {
                await sleep(250)
                setLoaderWidth('60%')
            } else if (loaderWidth === '60%') {
                await sleep(100)
                setLoaderWidth('75%')
            } else if (loaderWidth === '75%') {
                await sleep(750)
                setLoaderWidth('95%')
            }
        }

        if ((loaderWidth) !== '95%') {
            handleLoader()
        }
    }, [loaderWidth])

    return (
        <div className='matchmaking-page'>
            <div className='matchmaking-loader-cont'>
                <div className='matchmaking-txt-cont'>
                    <h1>{matchmakingText}</h1>
                </div>
                <div className='matchmaking-loader'>
                    <div className='matchmaking-loader-filler' style={{width: loaderWidth}}>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default MatchmakingLoader;