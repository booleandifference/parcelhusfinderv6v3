import React, { useState, useEffect } from 'react';
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { initializeApp } from "firebase/app";
import { getDatabase, ref as dbRef, push, onValue } from "firebase/database";
import ImageDisplay from './ImageDisplay';
import axios from 'axios';
import './PromptForm.css';

const firebaseConfig = {
 apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
 authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
 projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
 databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
 storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const storage = getStorage(app);

function PromptForm() {
 const [prompt, setPrompt] = useState('');
 const [isLoading, setIsLoading] = useState(false);
 const [loraScale, setLoraScale] = useState(0.8);
 const [generatedImageUrl, setGeneratedImageUrl] = useState('');
 const [error, setError] = useState('');
 const [simulatedProgress, setSimulatedProgress] = useState(0);
 const [isSimulating, setIsSimulating] = useState(false);
 const [gallery, setGallery] = useState([]);

 const refreshImageUrl = async (path) => {
  const imageRef = ref(storage, path);
  return await getDownloadURL(imageRef);
};

useEffect(() => {
  const galleryRef = dbRef(database, 'gallery');
  onValue(galleryRef, async (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const galleryArray = await Promise.all(
        Object.entries(data).map(async ([key, value]) => {
          const imagePath = `generated_images/${value.imageUrl.split('/').pop().split('?')[0]}`;
          const newUrl = await refreshImageUrl(imagePath);
          return {
            id: key,
            ...value,
            imageUrl: newUrl
          };
        })
      );
      setGallery(galleryArray.sort((a, b) => b.timestamp - a.timestamp));
    }
  });
}, []);
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
     }, 20);
   }
   return () => clearInterval(interval);
 }, [isSimulating, simulatedProgress]);

 const handleSubmit = async (e) => {
   e.preventDefault();
   setIsLoading(true);
   setError('');
   setGeneratedImageUrl('');
   setSimulatedProgress(0);
   setIsSimulating(true);

   try {
     const response = await axios.post('https://us-central1-parcelhusfinderv6v3.cloudfunctions.net/api/generate-image', {
       prompt,
       loraScale
     }, {
       headers: {
         'Content-Type': 'application/json',
       },
     });
     const { imageUrl, firebaseUrl } = response.data;
     setGeneratedImageUrl(firebaseUrl || imageUrl);

     const galleryRef = dbRef(database, 'gallery');
     await push(galleryRef, {
       imageUrl: firebaseUrl || imageUrl,
       prompt: prompt,
       timestamp: Date.now()
     });

     setSimulatedProgress(100);
   } catch (error) {
     console.error("Error generating or uploading image:", error);
     setError('An error occurred while generating or uploading the image. Please try again.');
   } finally {
     setIsLoading(false);
     setIsSimulating(false);
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
       </div>
     )}

     {error && (
       <div className="error-message" onClick={() => setError('')}>
         {error}
       </div>
     )}
 
     {generatedImageUrl && <ImageDisplay imageUrl={generatedImageUrl} />}

     <section className="gallery-section">
       <h2>Generated Images</h2>
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
     </section>
   </div>
 );
}

export default PromptForm;