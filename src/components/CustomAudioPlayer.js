// src/components/CustomAudioPlayer.js

import React, { useRef, useState } from 'react';

function CustomAudioPlayer() {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="custom-audio-player">
      <h3>Listen to a podcast on the Danish Parcelhus History</h3>
      
      <audio ref={audioRef} src="path/to/audio/file.mp3" />
      
      <div className="controls">
        <button onClick={togglePlayPause}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>
      </div>
    </div>
  );
}

export default CustomAudioPlayer;
