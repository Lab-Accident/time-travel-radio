import React, { useState, useContext } from 'react';
import Letter from './Letter.jsx';
import { getLetterValue, generateStrictPartition } from './Util.jsx';
import './WordFragment.css';

const WordFragment = ({ word, color, handleWordUpdate }) => {
    const [wordInput, setWordInput] = useState(word.word);

    const newLetter = (letter, index, previousLetter) => {
        return {
            index: index,
            letter: letter,
            ints: generateStrictPartition(getLetterValue(letter)),
            start: previousLetter ? previousLetter.start + previousLetter.length : 0,
            length: 4,
        };
    };
    
    const wordToLetters = (word) => {
        let previousLetter = null;
        return Array.from(word).map((letter, index) => {
            const newLtr = newLetter(letter, index, previousLetter);
            previousLetter = newLtr;
            return newLtr;
        });
    };

    const initialLetters = wordToLetters(word.word);
    const [letters, setLetters] = useState(initialLetters);
    word.letters = letters;

    const adjustStartsToFit = (i, letts) => {
        let nextFit = letts[i + 1] ? letts[i].start + letts[i].length <= letts[i + 1].start : true;
        while (!nextFit) {
            letts[i + 1].start = letts[i].start + letts[i].length;
            i++;
            nextFit = letts[i + 1] ? letts[i].start + letts[i].length <= letts[i + 1].start : true;
        }
        return letts;
    };


    const handleStartUpdate = (index, newStart) => {
        if (index < 0 || index >= letters.length) {
            alert(`Invalid index ${index}`);
            return;
        }
        let prevFit = letters[index - 1] 
                        ? newStart >= (letters[index - 1].start + letters[index - 1].length) 
                        : true;
        let letts = [...letters]


        if (prevFit) {
            letts[index].start = newStart;
            adjustStartsToFit(index, letts);
            setLetters(letts);
        } else {
            alert(`Start must be greater than or equal to previous letter's start + length`);
        }
    };

    const handleLengthUpdate = (index, newLength) => {
        if (index < 0 || index >= letters.length) {
            alert(`Invalid index ${index}`);
            return;
        }
        if (newLength < 1) {
            alert(`Length must be at least one`);
            return;
        }

        let letts = [...letters];

        letts[index].length = newLength;
        adjustStartsToFit(index, letts);
        setLetters(letts);
    };

    const handleWordInput = (newWord) => {
        setWordInput(newWord);
    }

    const handleWordChange = (newWord) => {
        const newLetters = wordToLetters(newWord);
        setLetters(newLetters);
        handleWordUpdate(newWord, newLetters);
    };
    

    return (
        <div>
            <div className='word-container'>
                <input 
                    type="text" 
                    style = {{
                        backgroundColor: color,
                        color : 'white',
                    }}
                    value = {wordInput.toUpperCase()}
                    placeholder="Enter a new word" 
                    onChange = {(e) => handleWordInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleWordChange(e.target.value)}/>
                
            </div>

            {letters.map((letter, index) => (
                <Letter 
                    key={index} 
                    letter={letter} 
                    updateStart={(newStart) => handleStartUpdate(index, newStart)}
                    updateLength={(newLength) => handleLengthUpdate(index, newLength)}
                />
            ))}
        </div>
    );
};

export default WordFragment;
