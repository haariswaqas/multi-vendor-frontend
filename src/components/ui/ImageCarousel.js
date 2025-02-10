// ImageCarousel.jsx
import React, { useState } from 'react';

const ImageCarousel = ({ images, alt, imgClass = "w-full h-auto object-cover rounded-lg shadow-md" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50; // Minimum swipe distance to trigger a slide change

  const prevImage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const nextImage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const onTouchStart = (e) => {
    setTouchEnd(null); // Reset previous touch end
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) {
      // Swiped left -> next image
      nextImage();
    } else if (distance < -minSwipeDistance) {
      // Swiped right -> previous image
      prevImage();
    }
  };

  if (!images || images.length === 0) return null;

  return (
    <div className="relative w-full">
      <img
        src={images[currentIndex]}
        alt={alt}
        className={imgClass}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      />
      {images.length > 1 && (
        <>
          {/* Previous Button */}
          <button
            onClick={prevImage}
            className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full opacity-70 hover:opacity-100 transition"
          >
            &#8592;
          </button>
          {/* Next Button */}
          <button
            onClick={nextImage}
            className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full opacity-70 hover:opacity-100 transition"
          >
            &#8594;
          </button>
          {/* Dots Indicator */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {images.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${index === currentIndex ? 'bg-white' : 'bg-gray-500'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ImageCarousel;
