"use client";
import { useState } from "react";

export default function ProductImageCarousel({ images, productName, className = "" }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  if (!images || images.length === 0) {
    return null;
  }

  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index, e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(index);
  };

  // If only one image, show it without carousel controls
  if (images.length === 1) {
    return (
      <img
        src={images[0].url}
        alt={images[0].alt || productName}
        className={`aspect-square w-full object-cover transition duration-300 ease-out group-hover:scale-[1.03] cursor-pointer ${className}`}
        loading="lazy"
        decoding="async"
      />
    );
  }

  return (
    <div className="relative w-full h-full group">
      {/* Main Image */}
      <img
        src={images[currentImageIndex].url}
        alt={images[currentImageIndex].alt || productName}
        className={`aspect-square w-full object-cover transition duration-300 ease-out group-hover:scale-[1.03] cursor-pointer ${className}`}
        loading="lazy"
        decoding="async"
      />

      {/* Modern Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800 hover:text-black rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-110 z-20 flex items-center justify-center border border-gray-200/50"
            aria-label="Previous image"
          >
            <svg className="w-5 h-5 -ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={nextImage}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800 hover:text-black rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-110 z-20 flex items-center justify-center border border-gray-200/50"
            aria-label="Next image"
          >
            <svg className="w-5 h-5 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Modern Thumbnail Navigation */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={(e) => goToImage(index, e)}
              className={`relative w-12 h-12 rounded-lg overflow-hidden transition-all duration-300 border-2 transform hover:scale-110 ${
                index === currentImageIndex
                  ? 'border-white shadow-lg scale-105'
                  : 'border-white/40 hover:border-white/80 shadow-md'
              }`}
              aria-label={`View image ${index + 1}`}
            >
              <img
                src={image.url}
                alt={image.alt || `${productName} view ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {/* Active indicator overlay */}
              <div className={`absolute inset-0 bg-white/20 backdrop-blur-[1px] transition-opacity duration-300 ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`} />
            </button>
          ))}
        </div>
      )}

      {/* Modern Image Counter Badge - Moved to Left */}
      {images.length > 1 && (
        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white text-sm font-medium px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 border border-white/10">
          <span className="text-white/90">{currentImageIndex + 1}</span>
          <span className="text-white/60 mx-1">/</span>
          <span className="text-white/90">{images.length}</span>
        </div>
      )}

      {/* Subtle gradient overlays for better button visibility */}
      {images.length > 1 && (
        <>
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </>
      )}
    </div>
  );
}