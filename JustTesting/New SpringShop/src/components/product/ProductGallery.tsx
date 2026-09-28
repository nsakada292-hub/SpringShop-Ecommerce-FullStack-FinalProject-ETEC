import React, { useState } from 'react';

interface ProductGalleryProps {
  mainImage: string;
  productName: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ mainImage, productName }) => {
  // Generate companion angle thumbnails
  const images = [
    mainImage,
    `${mainImage}&auto=format&fit=crop&q=80&crop=entropy`,
    `${mainImage}&auto=format&fit=crop&q=80&sat=-20`,
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80'
  ];

  const [selectedImage, setSelectedImage] = useState(mainImage);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePosition({ x, y });
  };

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      {/* Thumbnails */}
      <div className="flex md:flex-col gap-3 overflow-x-auto pb-2 md:pb-0 shrink-0">
        {images.map((img, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setSelectedImage(img)}
            className={`w-16 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
              selectedImage === img
                ? 'border-[#009dff] shadow-md ring-2 ring-[#009dff]/20'
                : 'border-zinc-200 dark:border-zinc-800 opacity-70 hover:opacity-100'
            }`}
          >
            <img src={img} alt={`${productName} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {/* Main Image with smooth zoom preview on hover */}
      <div
        className="relative flex-1 aspect-4/5 md:aspect-square rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800/80 cursor-crosshair"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseMove={handleMouseMove}
      >
        <img
          src={selectedImage}
          alt={productName}
          className="w-full h-full object-cover transition-transform duration-200"
          style={
            isHovered
              ? {
                  transform: 'scale(1.7)',
                  transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                }
              : undefined
          }
        />
        {isHovered && (
          <span className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-md text-[10px] text-white font-medium rounded-lg pointer-events-none">
            2x Zoomed
          </span>
        )}
      </div>
    </div>
  );
};
