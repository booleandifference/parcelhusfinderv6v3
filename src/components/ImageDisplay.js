// ImageDisplay.js
import React from 'react';
import './ImageDisplay.css';  // Make sure to create this CSS file if it doesn't exist

function ImageDisplay({ imageUrl }) {
  return (
    <div className="image-display">
      <h3 className="image-display-title">Generated Image</h3>
      <img src={imageUrl} alt="Generated Parcelhus" className="generated-image" />
    </div>
  );
}

export default ImageDisplay;