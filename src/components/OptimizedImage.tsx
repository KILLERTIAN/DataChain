"use client";

import { useState } from "react";
import { generateOptimizedImageUrl, generateFileUrl, isImageFile } from "@/lib/pinata";

interface OptimizedImageProps {
  cid: string;
  filename?: string;
  alt?: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'png' | 'jpg';
  className?: string;
  fallbackToOriginal?: boolean;
}

export function OptimizedImage({
  cid,
  filename = '',
  alt = 'IPFS Image',
  width,
  height,
  quality = 80,
  format,
  className = '',
  fallbackToOriginal = true
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if the file is likely an image
  const isImage = filename ? isImageFile(filename) : true;

  if (!isImage && !fallbackToOriginal) {
    return (
      <div className={`bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center ${className}`}>
        <span className="text-gray-400 text-sm">Not an image file</span>
      </div>
    );
  }

  // Generate optimized image URL for public files
  const optimizedUrl = generateOptimizedImageUrl(cid, {
    width,
    height,
    quality,
    format
  });

  // Fallback to our API route
  const fallbackUrl = generateFileUrl(cid);

  const handleImageLoad = () => {
    setLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setLoading(false);
  };

  if (imageError && !fallbackToOriginal) {
    return (
      <div className={`bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center ${className}`}>
        <span className="text-gray-400 text-sm">Failed to load image</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-400"></div>
        </div>
      )}
      <img
        src={imageError ? fallbackUrl : optimizedUrl}
        alt={alt}
        className={`${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 ${className}`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{
          width: width ? `${width}px` : 'auto',
          height: height ? `${height}px` : 'auto',
        }}
      />
    </div>
  );
}