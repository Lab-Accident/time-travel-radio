import React, { useState, useEffect, createContext, useContext } from 'react';
import UploadPage from './UploadPage';
import Radio from './Radio';
import SetupPage from './setup-code/SetupPage';
import './App.css'

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import axios from 'axios'


const MAX_RECORDINGS = 5;

function App() {

  return (
    <div className="App">
      <Router>
        <Routes>

          <Route path="/upload"
                 element = {<UploadPage />} />
          <Route path="/radio"
                 element = {<Radio />} />
          <Route path="/setup"
                  element = {<SetupPage />} />

        </Routes>
      </Router>
    </div>
  )
}

export default App
