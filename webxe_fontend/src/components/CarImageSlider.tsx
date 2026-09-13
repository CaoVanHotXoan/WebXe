import React, { useState, useEffect, useRef, useCallback } from 'react';

export interface CarData {
  title: string;
  images: string[];
}

export interface CarImageSliderProps {
  car: CarData;
}

export default function CarImageSlider({ car }: CarImageSliderProps) {
  const { title, images } = car;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const thumbnailsRef = useRef<HTMLDivElement>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex < images.length - 1 ? prevIndex + 1 : 0));
    }, 3000);
  }, [images.length]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (!isHovered && images.length > 1) {
      startTimer();
    } else {
      stopTimer();
    }
    return () => stopTimer();
  }, [isHovered, startTimer, stopTimer, images.length]);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex < images.length - 1 ? prevIndex + 1 : 0));
    if (!isHovered) startTimer();
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : images.length - 1));
    if (!isHovered) startTimer();
  };

  const handleSelect = (index: number) => {
    setCurrentIndex(index);
    if (!isHovered) startTimer();
    thumbnailsRef.current?.children[index]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  };

  if (!images || images.length === 0) return null;

  return (
    <div className="w-full flex flex-col gap-4">
      <div 
        className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-950/60 backdrop-blur-md border border-white/10 flex items-center justify-center group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img 
          src={images[currentIndex]} 
          alt={`${title} - ảnh ${currentIndex + 1}`} 
          className="w-full h-full object-cover"
        />
        
        {images.length > 1 && (
          <>
            <button 
              type="button" 
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors z-10"
              aria-label="Ảnh trước"
            >
              ‹
            </button>
            <button 
              type="button" 
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors z-10"
              aria-label="Ảnh tiếp theo"
            >
              ›
            </button>
            <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-black/60 text-white text-sm font-medium backdrop-blur-md">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="relative flex items-center w-full">
          <button
            type="button"
            className="hidden md:flex absolute left-0 z-10 w-8 h-full items-center justify-center bg-gradient-to-r from-black/50 to-transparent text-white"
            onClick={() => thumbnailsRef.current?.scrollBy({ left: -200, behavior: 'smooth' })}
          >
            ‹
          </button>
          <div 
            className="flex gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-hide py-2 px-1 w-full" 
            ref={thumbnailsRef}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {images.map((image, index) => (
              <button
                key={index}
                type="button"
                className={`flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden snap-center transition-all duration-300 border-2 ${
                  index === currentIndex 
                    ? 'border-red-500 scale-105 opacity-100 shadow-lg shadow-red-500/20' 
                    : 'border-transparent opacity-50 hover:opacity-80 hover:scale-100'
                }`}
                onClick={() => handleSelect(index)}
                aria-label={`Xem ảnh ${index + 1}`}
              >
                <img src={image} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          <button
            type="button"
            className="hidden md:flex absolute right-0 z-10 w-8 h-full items-center justify-center bg-gradient-to-l from-black/50 to-transparent text-white"
            onClick={() => thumbnailsRef.current?.scrollBy({ left: 200, behavior: 'smooth' })}
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
