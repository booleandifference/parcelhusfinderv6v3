import React from 'react';
import { AudioPlayer as ReactAudioPlayer } from 'react-audio-player-component';
import './AudioPlayer.css';

function AudioPlayer() {
  const audioUrl = 'https://us-central1-parcelhusfinderv6v3.cloudfunctions.net/api/get-audio-file';

  return (
    <div className="audio-player">
      <span className="title-line"></span>
      <span className="title-line"></span>
      <h3 className="audio-title">Listen to a podcast on the history of Parcelhouses</h3>
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
    </div>
  );
}

export default AudioPlayer;