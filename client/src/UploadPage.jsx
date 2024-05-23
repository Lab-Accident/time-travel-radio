import React, { useState, useEffect } from 'react'
import vmsg from 'vmsg'
import axios from 'axios'

const recorder = new vmsg.Recorder({
    wasmURL: 'https://unpkg.com/vmsg@0.3.0/vmsg.wasm'
  })
  
  const MAX_RECORDINGS = 5;
  const RECORDING_DURATION = 60000; 
  
  const UploadPage = () => {

    const [recordings, setRecordings] = useState(Array.from({ length: MAX_RECORDINGS }, () => null));

    const [isLoading, setIsLoading] = useState(false)
    const [isRecording, setIsRecording] = useState(false)
    const [currRecordingIndex, setCurrRecordingIndex] = useState(0)
    const [elapsedTime, setElapsedTime] = useState(0)
  
    useEffect(() => {
      let timer;
      if (isRecording) {
        timer = setInterval(() => {
          setElapsedTime(prevTime => prevTime + 1000); 
        }, 1000);
      } else {
        setElapsedTime(0); 
      }
      return () => clearInterval(timer);
    }, [isRecording]);
  
  
    const startRecording = async () => {
      await recorder.initAudio()
      await recorder.initWorker()
      await recorder.startRecording()
      setIsRecording(true)
      setIsLoading(false)
      setTimeout(stopRecording, RECORDING_DURATION) 
    }
  
    const uploadRecording = async (blob, index) => {
      setIsLoading(true)

      const formData = new FormData()
      formData.append('recording', blob, `recordings/recording${index + 1}.wav`)
      formData.append('index', index);
      
      try {
      const response = await axios.post('http://localhost:8080/api/upload_audio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const newRecordings = [...recordings];
      newRecordings[index] = { url: URL.createObjectURL(blob), blob: blob };
      console.log('newRecordings:', newRecordings);
      setRecordings(newRecordings);

      console.log(response.data);
      } catch (error) {
        console.error(error);
      }
      setIsLoading(false)
    }
  
    const stopRecording = async () => {
      const blob = await recorder.stopRecording()
      await uploadRecording(blob, currRecordingIndex)
      setIsRecording(false)
      setCurrRecordingIndex((currRecordingIndex + 1) % MAX_RECORDINGS)
    }
  
    const record = () => {
      setIsLoading(true)
      if (!isRecording) {
        startRecording()
      }
    }
  
    const formatTime = (ms) => {
      const seconds = Math.floor(ms / 1000) % 60;
      const minutes = Math.floor(ms / (1000 * 60));
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
    const elapsedTimeDisplay = isRecording ? formatTime(elapsedTime) : '';
  
    return (
      <div className="App">
        <button disabled={isLoading || isRecording} onClick={record}>
          {isRecording 
            ? `Recording ${currRecordingIndex + 1}` 
            : `Start Recording ${currRecordingIndex + 1}`
          }
        </button>
        <p>{elapsedTimeDisplay}</p>
          {recordings.map((recording, index) => (
            <div 
              key={index} 
              className={currRecordingIndex === index && isRecording ? 'recording' : ''}>
              <audio controls src={recording ? recording.url : ''}></audio>
            </div>
          ))}
      </div>
    )
  }

export default UploadPage