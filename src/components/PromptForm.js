import React, { useState, useEffect } from 'react';
import * as fal from "@fal-ai/serverless-client";
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";
import { getDatabase, ref as dbRef, push, onValue } from "firebase/database";
import ImageDisplay from './ImageDisplay';

import './PromptForm.css';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const database = getDatabase(app);

function PromptForm() {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [totalSteps, setTotalSteps] = useState(0);
    const [loraStatus, setLoraStatus] = useState('');
    const [loraScale, setLoraScale] = useState(0.8);
    const [generatedImageUrl, setGeneratedImageUrl] = useState('');
    const [error, setError] = useState('');
    const [gallery, setGallery] = useState([]);
    const [simulatedProgress, setSimulatedProgress] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);

    useEffect(() => {
    let interval;
    if (isSimulating && simulatedProgress < 100) {
      interval = setInterval(() => {
        setSimulatedProgress(prev => {
          const next = prev + 1;
          if (next >= 100) {
            clearInterval(interval);
            setIsSimulating(false);
          }
          return next;
        });
      }, 20); // 20ms * 100 steps = 2000ms or 2 seconds
    }
    return () => clearInterval(interval);
  }, [isSimulating, simulatedProgress]);

    useEffect(() => {
        const galleryRef = dbRef(database, 'gallery');
        const unsubscribe = onValue(galleryRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const galleryArray = Object.entries(data)
                    .map(([key, value]) => ({
                        id: key,
                        ...value
                    }))
                    .sort((a, b) => b.timestamp - a.timestamp);
                
                // Remove duplicates based on imageUrl
                const uniqueGallery = galleryArray.filter((item, index, self) =>
                    index === self.findIndex((t) => t.imageUrl === item.imageUrl)
                );
                
                setGallery(uniqueGallery);
            } else {
                setGallery([]);
            }
        });
        
        return () => unsubscribe();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setCurrentStep(0);
        setTotalSteps(0);
        setLoraStatus('');
        setError('');
        setGeneratedImageUrl('');
        setSimulatedProgress(0);
        setIsSimulating(true);
        
        try {
          console.log("Configuring FAL client");
          const apiKey = process.env.REACT_APP_FLUX_API_KEY;
          if (!apiKey) {
              throw new Error("FLUX API key is not set");
          }
          fal.config({
              credentials: apiKey,
          });
      
          const defaultPrompt = "a realistic architectural photography of a Danish parcelhus house";
          const fullPrompt = `${defaultPrompt} ${prompt}`;
      
          console.log("Subscribing to FAL service with prompt:", fullPrompt);
      
          setSimulatedProgress(0);
          setIsSimulating(true);
      
          const result = await fal.subscribe("fal-ai/flux/dev", {
              input: {
                  prompt: fullPrompt,
                  seed: Math.floor(Math.random() * 1000000),
                  image_size: "landscape_4_3",
                  num_images: 1,
                  lora_scale: loraScale
              },
              logs: true,
              onQueueUpdate: (update) => {
                  if (update.status === "IN_PROGRESS") {
                      update.logs.forEach(log => {
                          console.log("FAL log:", log.message);
                          if (log.message.includes("Loading LoRA")) {
                              setLoraStatus('Loading LoRA...');
                          } else if (log.message.includes("LoRA loaded")) {
                              setLoraStatus('LoRA loaded');
                          }
                  
                          const stepMatch = log.message.match(/Step (\d+)\/(\d+)/);
                          if (stepMatch) {
                              const [, current, total] = stepMatch;
                              setCurrentStep(parseInt(current));
                              setTotalSteps(parseInt(total));
                              
                              // Update simulated progress based on actual progress
                              const actualProgress = (parseInt(current) / parseInt(total)) * 100;
                              setSimulatedProgress(Math.max(actualProgress, simulatedProgress));
                          }
                      });
                  }
              },
          });
            
            console.log("FAL service response:", result);
            
            if (result && result.images && result.images.length > 0) {
                const imageUrl = result.images[0].url;
                console.log("Image URL from FAL:", imageUrl);
                setGeneratedImageUrl(imageUrl);
                
                console.log("Fetching image data");
                const response = await fetch(imageUrl);
                const blob = await response.blob();
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = async function() {
                    try {
                        const base64data = reader.result;
                        console.log("Image data converted to base64");
                        const imageRef = ref(storage, `generated_images/${Date.now()}.jpg`);
                        console.log("Attempting to upload to Firebase Storage");
                        console.log("Storage reference:", imageRef.fullPath);
                        
                        await uploadString(imageRef, base64data, 'data_url');
                        console.log("Upload successful");
                        
                        console.log("Getting download URL");
                        const downloadURL = await getDownloadURL(imageRef);
                        console.log("Firebase Storage download URL:", downloadURL);
                
                        // Save image metadata to Firebase Realtime Database
                        const galleryRef = dbRef(database, 'gallery');
                        const newImageRef = await push(galleryRef, {
                            imageUrl: downloadURL,
                            prompt: prompt,
                            timestamp: Date.now()
                        });
                        console.log("Image metadata saved to Realtime Database");
                
                        const newImage = {
                            id: newImageRef.key,
                            imageUrl: downloadURL,
                            prompt: prompt,
                            timestamp: Date.now()
                        };
                        
                        setGeneratedImageUrl(downloadURL);
                        setGallery(prevGallery => {
                            // Remove any existing items with the same URL
                            const filteredGallery = prevGallery.filter(item => item.imageUrl !== downloadURL);
                            // Add the new image to the beginning of the array
                            return [newImage, ...filteredGallery];
                        });
                        
                        setGeneratedImageUrl(downloadURL);
                    } catch (error) {
                        console.error("Error in Firebase Storage upload or Database save:", error);
                        console.error("Error code:", error.code);
                        console.error("Error message:", error.message);
                        setError(`Error uploading to Firebase: ${error.message}`);
                    }
                };
            } else {
                console.error('No image generated');
                setError('No image was generated. Please try again.');
            }
        } catch (error) {
            console.error('Error generating or uploading image:', error);
            setError('An error occurred while generating or uploading the image. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
      <div className="prompt-form-container">
          <form onSubmit={handleSubmit} className="prompt-form">
              <h2 className="prompt-header">Create a parcelhus</h2>
              <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your parcelhouse here - hints: use trigger words like bricks, wood, yellow, red, large windows, modern, old etc "
                  required
                  className="prompt-textarea"
              />
              <div className="slider-container">
                  <div className="slider-labels">
                      <span>Less</span>
                      <span>How much parcelhus?</span>
                      <span>More</span>
                  </div>
                  <input
                      type="range"
                      id="loraScale"
                      min="0.5"
                      max="1"
                      step="0.01"
                      value={loraScale}
                      onChange={(e) => setLoraScale(parseFloat(e.target.value))}
                  />
              </div>
              <button type="submit" className="generate-button" disabled={isLoading}>
                  {isLoading ? 'Generating...' : 'Generate a new Parcelhus'}
              </button>
          </form>
          {isLoading && (
    <div className="loading-indicator">
        <p className="progress-text">Generating image... {simulatedProgress}%</p>
        <div className="progress-bar">
            <div 
                className="progress-bar-fill" 
                style={{width: `${simulatedProgress}%`}}
            ></div>
        </div>
        <p className="status-text">Diffusion Progress: Step {currentStep} of {totalSteps}</p>
        <p className="status-text">LoRA Status: {loraStatus}</p>
    </div>
)}
          {error && (
              <div className="error-message" onClick={() => setError('')}>
                  {error}
              </div>
          )}
      
          {generatedImageUrl && <ImageDisplay imageUrl={generatedImageUrl} />}
          <span className="title-line2"></span>
       
          <h2 className="prompt-header">A new neighbourhood...</h2>
          <span className="title-line2"></span>
     
          <div className="image-gallery">
              {gallery.map((item) => (
                  <div key={item.id} className="gallery-item">
                      <img 
                          src={item.imageUrl} 
                          alt={item.prompt} 
                          className="gallery-image" 
                      />
                      <div className="image-prompt">{item.prompt}</div>
                  </div>
              ))}
          </div>
      </div>
  );
}

export default PromptForm;