import React, { useContext } from 'react';
import './RadioMap.css';
import { getColor } from './Util';

const RadioMap = ({ matrix }) => {

    return (
        <div>
            <div className="matrix">
                {matrix.map((row, rowIndex) => (
                    <div className="matrix-row" key={rowIndex}>
                        <div 
                            className="row-label"
                            style = {{
                                backgroundColor: 'black',
                                color: 'white',
                                width: '20px',
                                textAlign: 'center'
                            }}>
                                {rowIndex + 1}
                        </div>
                        {row.map((cell, cellIndex) => (
                            <div
                                className="matrix-cell"
                                key={cellIndex}
                                style={{ backgroundColor: getColor(cell) }}>
                                {cell.map((num, numIndex) => (
                                    <div
                                        key={numIndex}
                                        style={{
                                            backgroundColor: getColor(num),
                                            width: '100%',
                                            height: `${100 / cell.length}%`
                                        }}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default RadioMap;
