import React, { useState, useEffect } from 'react';
import { AudioPlayer as ReactAudioPlayer } from 'react-audio-player-component';
import './AudioPlayer.css';

function AudioPlayer() {
  const [audioUrl, setAudioUrl] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAudioUrl = async () => {
      try {
        const response = await fetch('https://getaudiosignedurl-cdc75557fq-uc.a.run.app');
        if (!response.ok) {
          throw new Error('Failed to fetch audio URL');
        }
        const data = await response.json();
        setAudioUrl(data.signedUrl);
      } catch (error) {
        console.error('Error fetching audio URL:', error);
        setError('Failed to load audio. Please try again later.');
      }
    };

    fetchAudioUrl();
  }, []);

  return (
    <div className="audio-player">
      <span className="title-line"></span>
      <span className="title-line"></span>
      <h3 className="audio-title">Listen to a Parcelhus podcast</h3>
      {error ? (
        <p className="error-message">{error}</p>
      ) : audioUrl ? (
        <div className="audio-player-container">
          <ReactAudioPlayer 
            src={audioUrl}
            minimal={true}
            width={350}
            trackHeight={50}
            barWidth={1}
            gap={1}
            visualise={true}
            backgroundColor="rgba(255, 255, 255, 0.1)"
            barColor="rgba(255, 255, 255, 0.1)"
            barPlayedColor="rgba(255, 255, 255, 0.8)"
            skipDuration={2}
            showLoopOption={false}
            showVolumeControl={true}
            seekBarColor="rgba(255, 255, 255, 0.5)"
            volumeControlColor="rgba(255, 255, 255, 0.8)"
          />
        </div>
      ) : (
        <p>Loading audio...</p>
      )}
    </div>
  );
}

export default AudioPlayer;