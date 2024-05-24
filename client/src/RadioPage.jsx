import React, { useState, useEffect } from 'react'
import axios from 'axios'

const MAX_RECORDINGS = 3;

const RadioPage = ({ recordings }) => {
    const [radios, setRadios] = useState([]);

    useEffect(() => {
        fetchRadios();
    }, []);

    const fetchRadios = async () => {
        try {
          const response = await axios.get(API_URL + '/api/split_tracks/files');
          const files = response.data.split_tracks;
    
          const radiosData = await Promise.all(
            files.map(async (file) => {
              const fileResponse = await axios.get(`${API_URL}/api/split_tracks/${file}`, {
                responseType: 'blob'
              });
              const url = URL.createObjectURL(fileResponse.data);
              return { url: url, blob: fileResponse.data };
            })
          );
    
          setRadios(radiosData);
        } catch (error) {
          console.error('Error fetching recordings:', error);
        }
      };
    

    return (
        <div>
            <ol>
                {radios.map((radio, index) => (
                    (radio && radio.url) &&
                        <li key={radio.url}>
                            <audio controls src={radio.url} loop autoPlay></audio>
                        </li>
                ))}
            </ol>

        </div>
    )
}

export default RadioPage