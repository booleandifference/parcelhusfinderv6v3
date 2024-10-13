import React, { useState } from 'react';
import FlightIcon from '@mui/icons-material/Flight';  // Import the TravelExplore icon
import './StreetView.css';  // Assuming the CSS file is in the same folder

function StreetViewButton() {
  // Array of locations with coordinates
  const locations = [
    { name: 'Slagelse', lat: 55.403976, lng: 11.323387 },
    { name: 'Nyborg', lat: 55.307272, lng: 10.769178 },
    { name: 'Odense', lat: 55.355429, lng: 10.383763 },
    { name: 'Middelfart', lat: 55.486576, lng: 9.745457 },
    { name: 'Kolding', lat: 55.487256, lng: 9.442280 },
    { name: 'Gram', lat: 55.292611, lng: 9.046335 },
    { name: 'Ribe', lat: 55.344196, lng: 8.781805 },
    { name: 'Ølgod', lat: 55.806746, lng: 8.610786 },
    { name: 'Spjald', lat: 56.129822, lng: 8.504141 }
  ];

  // State to store the current location
  const [currentLocation, setCurrentLocation] = useState('');

  // Function to select a random location
  const getRandomLocation = () => {
    const randomIndex = Math.floor(Math.random() * locations.length);
    const location = locations[randomIndex];
    return `https://www.google.com/maps/@${location.lat},${location.lng},3a,75y,0h,90t/data=!3m6!1e1!3m4!1s8QLSzxiTsD39T9yBWNkCqA!2e0!7i16384!8i8192`;
  };

  // Handle button click to update the URL
  const handleClick = () => {
    const newLocation = getRandomLocation();
    setCurrentLocation(newLocation);
  };

  return (
    <div className="street-view-button">
      <h3 className="explorer-text">
        Explorer a [random] danish parcelhus neighbourhood
      </h3>
      <span className="title-line"></span>
      <a
        href={currentLocation || getRandomLocation()}
        onClick={handleClick}
        target="_blank"
        rel="noopener noreferrer"
        className="icon-button"
      >
        <FlightIcon className="flight-icon" />
      </a>
    </div>
  );
}
export default StreetViewButton;
