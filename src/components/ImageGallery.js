import React, { useEffect, useState } from 'react';
import { database } from '../firebase'; 
import { ref, query, orderByChild, limitToLast, endAt, get } from 'firebase/database';
import './ImageGallery.css';

const IMAGES_PER_PAGE = 9;

const ImageGallery = () => {
  const [images, setImages] = useState([]);
  const [lastTimestamp, setLastTimestamp] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchImages = async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);

    try {
      let imagesQuery;

      if (lastTimestamp) {
        imagesQuery = query(
          ref(database, 'gallery'),
          orderByChild('timestamp'),
          endAt(lastTimestamp),
          limitToLast(IMAGES_PER_PAGE + 1) // +1 to check if there are more images
        );
      } else {
        imagesQuery = query(
          ref(database, 'gallery'),
          orderByChild('timestamp'),
          limitToLast(IMAGES_PER_PAGE + 1) // +1 to check if there are more images
        );
      }

      const snapshot = await get(imagesQuery);

      if (snapshot.exists()) {
        const data = snapshot.val();
        let fetchedImages = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value
        })).sort((a, b) => b.timestamp - a.timestamp);

        // Remove the extra image we fetched (if it exists)
        const hasMoreImages = fetchedImages.length > IMAGES_PER_PAGE;
        if (hasMoreImages) {
          fetchedImages = fetchedImages.slice(0, IMAGES_PER_PAGE);
        }

        if (fetchedImages.length > 0) {
          setLastTimestamp(fetchedImages[fetchedImages.length - 1].timestamp - 1); // Subtract 1 to avoid duplicates
          setImages((prevImages) => [...prevImages, ...fetchedImages]);
        }

        setHasMore(hasMoreImages);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching images:", error);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  return (
    <div className="image-gallery">
      <div className="gallery-content">
        <div className="images-grid">
          {images.map((image) => (
            <div key={image.id} className="image-item">
              <img src={image.imageUrl} alt={image.prompt} />
              <p className="image-prompt">{image.prompt}</p>
              <p className="image-timestamp">{new Date(image.timestamp).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="gallery-footer">
        {hasMore && (
          <button onClick={fetchImages} disabled={isLoading} className="gallery-button">
            {isLoading ? 'Loading...' : 'Load More'}
          </button>
        )}
        {!hasMore && images.length > 0 && <p className="gallery-message">No more images to display.</p>}
        {images.length === 0 && !isLoading && <p className="gallery-message">No images available.</p>}
      </div>
    </div>
  );
};

export default ImageGallery;