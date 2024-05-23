import React, { useState, useEffect, createContext, useContext } from 'react';
import WordFragment from './WordFragment';
import RadioMap from './RadioMap';
import { getColor } from './Util';

import { v4 as uuidv4 } from 'uuid';


const NUM_CHANNELS = 12;
const AUDIO_LENGTH = 12;

function createDefaultMatrix() {
  return Array.from({ length: NUM_CHANNELS }, () => Array.from({ length: AUDIO_LENGTH }, () => []));
}


const SetupPage = () => {

  const [words, setWords] = useState([{word: 'ABC', index:0, id: uuidv4(), letters: null}]);
  const [newWordInput, setNewWordInput] = useState('');
  const [matrix, setMatrix] = useState(createDefaultMatrix());


  const handleWordChange = (e) => {
    const input = e.target.value;
    if (/^[a-zA-Z]*$/.test(input)) {
      setNewWordInput(input);
    }
  };

  const newWord = (wordText) => {
    return {
        id: uuidv4(),
        index: words.length,
        word: wordText,
        letters: null
    }
  }

  const addWord = () => {
    if (newWordInput.trim()) {
      let newW = newWord(newWordInput.trim());
      setWords([...words, newW]);
      setNewWordInput('');
      console.log(words);
    }
  };


  const handleDeleteWord = (id) => {
    setWords((prevWords) => {
      const updatedWords = prevWords.filter(word => word.id !== id);
      updatedWords.forEach((word, index) => {
        word.index = index;
      });
      return updatedWords;
    });
  };

  const handleWordUpdate = (index, newWordText, newLetters) => {
    let newWords = [...words];
    newWords[index].word = newWordText;
    newWords[index].letters = newLetters;
    setWords(newWords);
  }

  const checkMatrixSize = (col, mat) => {
    while (col >= mat[0].length + 1) {
        for (let row = 0; row < mat.length; row++) {
            mat[row].push([]);
        }
    }
}

const prettyPrintMatrix = (mat) => {
  let str = '';
  for (let row = 0; row < mat.length; row++) {
      str += '[';
      for (let col = 0; col < mat[row].length; col++) {
          str += mat[row][col];
          if (col < mat[row].length - 1) {
              str += ', ';
          }
      }
      str += ']';
      if (row < mat.length - 1) {
          str += ',\n';
      }
  }
  return '[' + str + ']';
}



const generateMatrix = () => {
  const newMatrix = createDefaultMatrix();
  words.forEach(word => {
    word.letters.forEach(letter => {
      letter.ints.forEach(integer => {
        for (let col = 0; col < letter.length; col++) {
          checkMatrixSize(letter.start + col, newMatrix);
          newMatrix[integer - 1][letter.start + col].push(word.index + 1);
        }
      });
    });
  });
  console.log(prettyPrintMatrix(newMatrix));
  setMatrix(newMatrix);
}

// const generateJSON = () => {
//   words.forEach(word => {


  return (
    <div className='control-page-container'
      style = {{
        display: `flex`,
        flexDirection: `row`,
        justifyContent: `space-around`,
        gap: `50px`,
      }}>
      <div className='words-list'
        style = {{
          display: `flex`,
          flexDirection: `column`,
          alignItems: `center`,
        }}>

        <button
          onClick={generateMatrix}
          style = {{
            width: `350px`,
            marginBottom: `20px`,
            marginLeft: `0px`,
          }}
        >
          Update Matrix
        </button>

        {words.map((word, index) => (
          <div key={word.id}>
            <WordFragment
              color = {getColor(index + 1)}
              word={word}
              handleWordUpdate={(newWordText, newLetters) => handleWordUpdate(index, newWordText, newLetters)}
            />
            <button 
              className="delete-button" 
              onClick={() => handleDeleteWord(word.id)}
              style = {{
                width: `350px`,
                marginBottom: `20px`,
                marginLeft: `0px`,
              }}>
                Delete
            </button>
          </div>
        ))}
        
        <div className="word-input-container">
          <input
            type="text"
            value={newWordInput.toUpperCase()}
            onChange={(e) => handleWordChange(e)}
            placeholder="Enter a new word"/>

          <button onClick={addWord}>Add Word</button>
        </div>
      </div>

      <div className="radio-map-container">
        <RadioMap matrix={matrix} />
      </div>

    </div>
  )
}

export default SetupPage


// [[4, 4, 4, 4, , , , , 4, 4, 4, 4],
// [4, 4, 4, 4, , , 5, 5, 5, , , ],
// [4, 4, 4, 4, 4, 4, , , 2, 2, 2, 2],
// [2, 2, 2, 2, , , , , 4, 4, 4, 4],
// [, , , , 2, 2, 2, , , 5, 5, 5],
// [1, 1, 1, , 4, 4, , , , , , ],
// [3, 3, 3, 3, 3, 3, 3, 3, , , , ],
// [5, 5, 5, , 3, 3, 3, 3, 2, 2, 2, 2],
// [1, 1, 1, 5, 5, 5, , , 4, 4, 4, 4],
// [2, 2, 2, 2, 2, 2, 2, , 4, 4, 4, 4],
// [, , , 1, 1, 1, 5, 5, 5, , , ],
// [5, 5, 5, , , , , , 2, 2, 2, 2]]