import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Radio.css';

const MAX_STATIONS = 12;

const Radio = () => {
    const [radioURL, setRadioURL] = useState(null);
    const [stationNumber, setStationNumber] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const audioRef = useRef(null);

    useEffect(() => {
        fetchRadio();
    }, [stationNumber]);

    const syncAudioWithCurrent = () => {
        console.log('syncing audio with current')

        if (audioRef.current) {
            const now = new Date();
            const secondsIntoMinute = now.getSeconds();
            audioRef.current.currentTime = secondsIntoMinute;
            audioRef.current.play();
        }
    };

    useEffect(() => {
        syncAudioWithCurrent();

        // resync when audio ends
        const audioElement = audioRef.current;
        if (audioElement) {
            audioElement.addEventListener('ended', syncAudioWithCurrent);
        }

        return () => {
            if (audioElement) {
                audioElement.removeEventListener('ended', syncAudioWithCurrent);
            }
        };
    }, [radioURL]);

    // useEffect(() => {
    //     speedsync();

    // const speedsync = () => {
    //     if (audioRef.current) {
    //         console.log("speedsync!!");
    //                 const duration = audio.duration;
    //                 const seconds = new Date().getTime() / 1000;
    //                 const offset = seconds % duration;
    //         let lag = audio.currentTime - offset; // will go crazy at the edges but ignoring for now
    //         let playbackSpeed = Math.exp(-0.8 * lag);
    //         if (playbackSpeed <= 0.1) {
    //         playbackSpeed = 0.1
    //         }
    //         if (Math.abs(playbackSpeed - 1.0) < 0.01) {
    //         playbackSpeed = 1;
    //         }
    //         audio.playbackRate = playbackSpeed;
    //         if (playbackSpeed != 1.0) {
            
    //         console.log("lag " + lag);
    //         console.log("speed " + playbackSpeed);
    //         }
    //         }
    //     }
    //         setInterval(() => speedsync(), 50);


    useEffect(() => {
        const timeInterval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timeInterval);
    }, []);

    useEffect(() => {
        const radioInterval = setInterval(() => {
            fetchRadio();
        }, 60000);

        return () => clearInterval(radioInterval);
    }, []);    




    const fetchRadio = async () => {
        if (!stationNumber) { return; }
        try {
            const fileResponse = await axios.get(`http://localhost:8080/api/stations/${stationNumber}`, {
                responseType: 'blob'
            });
            const url = URL.createObjectURL(fileResponse.data);
            setRadioURL(url);
        } catch (error) {
            console.error('Error fetching recordings:', error);
        }
    };

    const handleVolumeChange = (event) => {
        if (audioRef.current) {
            audioRef.current.volume = event.target.value / 100;
        }
    };

    const incrStation = () => {
        setStationNumber(prev => Math.min(prev + 1, 12));
    };

    const decrStation = () => {
        setStationNumber(prev => Math.max(prev - 1, 1));
    };

    let formattedStation = "FM " + (90 + stationNumber* 0.1).toFixed(1).toString();
    let formattedTime = currentTime.toLocaleTimeString();

    return (
        <div className="radio-container">
            <span className='station-display' style ={{fontSize:`1.5rem`, width:`250px`}}>{formattedTime}</span>
            <p className="radio-title">CHRONOWAVE RECIEVER</p>

 
            <div className="station-controls">
                <button onClick={decrStation} disabled={stationNumber === 1} className="control-button">&lt;</button>
                <span className="station-display">{formattedStation}</span>
                <button onClick={incrStation} disabled={stationNumber === MAX_STATIONS} className="control-button">&gt;</button>
            </div>
            
            {/* <input 
                type="range" 
                min="0" 
                max="100" 
                defaultValue="50" 
                className="volume-slider" 
                onChange={handleVolumeChange}
            /> */}

            {radioURL && (
                <audio 
                    ref={audioRef} 
                    src={radioURL} 
                    controls 
                    className="radio-audio"
                    />
            )}
            <div className="dial">
                <div className="dial-knob"></div>
            </div>
            <div className="speaker-grills"></div>

        </div>
    );
};

export default Radio;
