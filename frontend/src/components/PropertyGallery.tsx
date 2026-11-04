import React, { useState, useEffect } from 'react';
import {
  Maximize,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Camera,
  Image as ImageIcon
} from 'lucide-react';
import { ImageItem } from '../types';

interface PropertyGalleryProps {
  images: ImageItem[];
  title: string;
}

export const PropertyGallery: React.FC<PropertyGalleryProps> = ({ images, title }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [failedUrls, setFailedUrls] = useState<Record<string, boolean>>({});

  const categories = ['All', 'Exterior', 'Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Balcony', 'Floor Plan'];

  const filteredImages = selectedCategory === 'All'
    ? images
    : images.filter((img) => img.category.toLowerCase() === selectedCategory.toLowerCase());

  // Safe active image
  const currentImage = filteredImages[activeImageIndex] || filteredImages[0] || images[0];

  const handleImageError = (url: string) => {
    setFailedUrls((prev) => ({ ...prev, [url]: true }));
  };

  const getImageUrl = (item?: ImageItem) => {
    if (!item) return '/api/static/property_image/exterior/sample_1.svg';
    if (failedUrls[item.url] && item.fallback) {
      return item.fallback;
    }
    return item.url;
  };

  // Lightbox keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowRight') {
        setActiveImageIndex((prev) => (prev + 1) % filteredImages.length);
      }
      if (e.key === 'ArrowLeft') {
        setActiveImageIndex((prev) => (prev - 1 + filteredImages.length) % filteredImages.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, filteredImages.length]);

  return (
    <div className="space-y-4">
      
      {/* Category Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const count = cat === 'All'
            ? images.length
            : images.filter((img) => img.category.toLowerCase() === cat.toLowerCase()).length;
          
          if (count === 0 && cat !== 'All') return null;

          return (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setActiveImageIndex(0);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Main Large Showcase Image */}
      <div className="relative h-80 sm:h-96 md:h-[460px] w-full rounded-2xl overflow-hidden bg-slate-900 shadow-md group">
        <img
          src={getImageUrl(currentImage)}
          alt={currentImage?.caption || title}
          onError={() => currentImage && handleImageError(currentImage.url)}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-101"
        />

        {/* Provenance and Category Badge */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          <span className="px-3 py-1 rounded-lg text-xs font-bold bg-white/95 text-slate-900 shadow-md">
            {currentImage?.category || 'Exterior'}
          </span>
          <span className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-950/80 text-emerald-300 backdrop-blur flex items-center shadow-md">
            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
            Curated Demo Photo (Illustrative)
          </span>
        </div>

        {/* Fullscreen Button */}
        <button
          onClick={() => setLightboxOpen(true)}
          className="absolute bottom-4 right-4 p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-950/90 text-white backdrop-blur shadow-md flex items-center space-x-1.5 text-xs font-medium transition-colors cursor-pointer"
        >
          <Maximize className="w-4 h-4" />
          <span className="hidden sm:inline">View Fullscreen</span>
        </button>

        {/* Image Caption Bar */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-transparent p-4 text-white">
          <p className="text-sm font-semibold">{currentImage?.caption || title}</p>
          <p className="text-[11px] text-slate-300 opacity-90">
            Image {activeImageIndex + 1} of {filteredImages.length} • Illustrative sample interior design
          </p>
        </div>
      </div>

      {/* Thumbnails Row */}
      {filteredImages.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5 pt-1">
          {filteredImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImageIndex(idx)}
              className={`relative h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                activeImageIndex === idx
                  ? 'border-blue-600 scale-102 shadow-md'
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={getImageUrl(img)}
                alt={img.caption}
                onError={() => handleImageError(img.url)}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 left-1 px-1 py-0.2 rounded text-[9px] font-bold bg-slate-900/80 text-white">
                {img.category}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-fade-in">
          {/* Top Bar */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 rounded bg-blue-600 text-xs font-bold">
                {currentImage?.category}
              </span>
              <span className="text-sm font-medium text-slate-300">
                {activeImageIndex + 1} / {filteredImages.length}
              </span>
            </div>
            <button
              onClick={() => setLightboxOpen(false)}
              className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Center Image with Prev / Next Controls */}
          <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
            <img
              src={getImageUrl(currentImage)}
              alt={currentImage?.caption}
              className="max-h-[75vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
            />

            {filteredImages.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImageIndex((prev) => (prev - 1 + filteredImages.length) % filteredImages.length)}
                  className="absolute left-2 sm:left-6 p-3 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setActiveImageIndex((prev) => (prev + 1) % filteredImages.length)}
                  className="absolute right-2 sm:right-6 p-3 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Bottom Caption & Provenance */}
          <div className="text-center text-slate-300 space-y-1">
            <p className="text-base font-semibold text-white">{currentImage?.caption}</p>
            <p className="text-xs text-slate-400">
              Provenance: Illustrative sample residential architecture photo. Use arrow keys to navigate.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
