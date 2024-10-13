import React from 'react';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import PromptForm from './components/PromptForm';
import StreetViewButton from './components/StreetViewButton';
import AudioPlayer from './components/AudioPlayer';
import Info from './components/Info'; // You'll create this component
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Link to="/info" className="info-link">info</Link>
          <h1 className="parcelhus-title">
            <span className="title-line">PARCELHUS</span>
            <span className="title-line">FINDER</span>
          </h1>
        </header>
        <Routes>
          <Route path="/info" element={<Info />} />
          <Route path="/" element={
            <div className="centered-content">
              <StreetViewButton />
              <AudioPlayer />
              <span className="title-line"></span>
              <span className="title-line"></span>
              <span className="title-line"></span>
              <span className="title-line"></span>
              <span className="title-line"></span>
              <main>
                <PromptForm />
              </main>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;