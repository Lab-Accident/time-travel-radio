import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

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

    useEffect(() => {
        const timeInterval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timeInterval);
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

    const incrStation = () => {
        setStationNumber(prev => Math.min(prev + 1, 12));
    };

    const decrStation = () => {
        setStationNumber(prev => Math.max(prev - 1, 1));
    };

    let formattedStation = "FM " + (90 + stationNumber* 0.1).toFixed(1).toString();
    let formattedTime = currentTime.toLocaleTimeString();

    return (
        <div>
            <p>Current Time: {formattedTime}</p>

            <br />
            <button onClick={decrStation} disabled={stationNumber === 1}>-</button>
            <span> {formattedStation} </span>
            <button onClick={incrStation} disabled={stationNumber === 12}>+</button>
            <br />
            {radioURL && (
                <audio 
                    ref={audioRef} 
                    src={radioURL} 
                    controls 
                    />
            )}
        </div>
    );
};

export default Radio;
