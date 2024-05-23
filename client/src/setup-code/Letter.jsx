import React, { useState, useEffect, useContext } from 'react';
import './Letter.css';

import { getLetterValue } from './Util.jsx';

const NUM_CHANNELS = 12;

const Letter = ({ letter, updateLength, updateStart }) => {
    const targetValue = getLetterValue(letter.letter);
    const [intInput, setIntInput] = useState('');


    const handleInputChange = (e) => {
        setIntInput(e.target.value);
    };

    const handleInputKeyPress = (e) => {
        if (e.key === 'Enter') {
            const inputInts = intInput.split(',').map(str => parseInt(str.trim())).filter(num => !isNaN(num));
            const inputSet = new Set(inputInts);
            const inputSum = inputInts.reduce((acc, val) => acc + val, 0);
            const inputMax = Math.max(...inputInts);
            

            if (inputSet.size === inputInts.length && inputSum === targetValue && inputMax <= NUM_CHANNELS) {
                letter.ints = inputSet;
                setIntInput('');
            } else {
                alert(`The integers must be unique and sum to ${targetValue}`);
                setIntInput('');
            }
        }
    };

    return (
        <div className='letter-row'>
            <h1>{letter.letter.toUpperCase()} : {targetValue}</h1>

            <input
                type="text"
                value={intInput ? intInput : Array.from(letter.ints).join(', ')}
                onChange={handleInputChange}
                onKeyPress={handleInputKeyPress}
                placeholder={`Ints sum to ${targetValue}`}
            />

            <label>start : </label>
            <input 
                type="text" 
                value={letter.start} 
                onChange={(e) => updateStart(parseInt(e.target.value))} 
                placeholder='Start of the segment'
            />
            
            <label>length : </label>
            <input 
                type="text" 
                value={letter.length} 
                onChange={(e) => updateLength(parseInt(e.target.value)) }
                placeholder='Length of the segment'
            />
        
        </div>
    );
};

export default Letter;
