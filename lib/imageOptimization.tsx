import Image from "next/image";
import { useState, useEffect, useRef } from "react";

// Image optimization configuration
export const IMAGE_CONFIG = {
  // Default image sizes for responsive design
  sizes: {
    thumbnail: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
    medium: "(max-width: 640px) 100vw, (max-width: 1024px) 75vw, 50vw",
    large: "(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 75vw",
    full: "100vw",
  },

  // Quality settings
  quality: {
    low: 60,
    medium: 80,
    high: 95,
  },

  // Format priorities
  formats: ["image/webp", "image/avif", "image/jpeg"],

  // Loading strategies
  loading: {
    lazy: "lazy",
    eager: "eager",
  },

  // Placeholder types
  placeholder: {
    blur: "blur",
    empty: "empty",
  },
};

// Image optimization hook
export function useImageOptimization(
  src: string,
  options: {
    sizes?: string;
    quality?: number;
    priority?: boolean;
    placeholder?: "blur" | "empty";
    onLoad?: () => void;
    onError?: (error: Error) => void;
  } = {}
) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  const {
    sizes = IMAGE_CONFIG.sizes.medium,
    quality = IMAGE_CONFIG.quality.medium,
    priority = false,
    placeholder = "blur",
    onLoad,
    onError,
  } = options;

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imageRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "50px", // Start loading 50px before the image comes into view
        threshold: 0.1,
      }
    );

    observer.observe(imageRef.current);

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = (
    event: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    setHasError(true);
    onError?.(new Error("Image failed to load"));
  };

  return {
    isLoaded,
    hasError,
    isInView: priority || isInView,
    imageRef,
    handleLoad,
    handleError,
    sizes,
    quality,
    priority,
    placeholder,
  };
}

// Optimized Image Component
interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  sizes?: string;
  quality?: number;
  priority?: boolean;
  placeholder?: "blur" | "empty";
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  fallbackSrc?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  sizes = IMAGE_CONFIG.sizes.medium,
  quality = IMAGE_CONFIG.quality.medium,
  priority = false,
  placeholder = "blur",
  className,
  style,
  onLoad,
  onError,
  fallbackSrc,
}: OptimizedImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const { isLoaded, isInView, imageRef, handleLoad, handleError } =
    useImageOptimization(src, {
      sizes,
      quality,
      priority,
      placeholder,
      onLoad,
      onError: (error) => {
        setHasError(true);
        if (fallbackSrc && currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
          setHasError(false);
        }
        onError?.(error);
      },
    });

  // Don't render if not in view and not priority
  if (!isInView && !priority) {
    return (
      <div
        ref={imageRef}
        className={`bg-gray-200 animate-pulse ${className || ""}`}
        style={{
          width: width || "100%",
          height: height || "200px",
          ...style,
        }}
      />
    );
  }

  return (
    <Image
      ref={imageRef}
      src={currentSrc}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      quality={quality}
      priority={priority}
      placeholder={placeholder}
      className={`transition-opacity duration-300 ${
        isLoaded ? "opacity-100" : "opacity-0"
      } ${className || ""}`}
      style={style}
      onLoad={handleLoad}
      onError={handleError}
    />
  );
}

// Lazy Image Component with Intersection Observer
export function LazyImage(props: OptimizedImageProps) {
  return <OptimizedImage {...props} priority={false} />;
}

// Priority Image Component for above-the-fold content
export function PriorityImage(props: OptimizedImageProps) {
  return <OptimizedImage {...props} priority={true} />;
}

// Background Image Component
interface BackgroundImageProps {
  src: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  fallbackSrc?: string;
}

export function BackgroundImage({
  src,
  alt,
  className,
  style,
  children,
  fallbackSrc,
}: BackgroundImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const img = new window.Image();
    img.onload = () => setIsLoaded(true);
    img.onerror = () => {
      if (fallbackSrc && currentSrc !== fallbackSrc) {
        setCurrentSrc(fallbackSrc);
      }
    };
    img.src = currentSrc;
  }, [currentSrc, fallbackSrc]);

  return (
    <div
      className={`relative overflow-hidden ${className || ""}`}
      style={{
        backgroundImage: `url(${currentSrc})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        ...style,
      }}
    >
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      {children}
    </div>
  );
}

// Image Gallery Component
interface ImageGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    width?: number;
    height?: number;
  }>;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
}

export function ImageGallery({
  images,
  className,
  columns = 3,
}: ImageGalleryProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={`grid gap-4 ${gridCols[columns]} ${className || ""}`}>
      {images.map((image, index) => (
        <OptimizedImage
          key={`${image.src}-${index}`}
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes={IMAGE_CONFIG.sizes.medium}
          priority={index < 3} // Load first 3 images with priority
        />
      ))}
    </div>
  );
}

// Image optimization utilities
export const imageUtils = {
  // Generate responsive image URLs
  getResponsiveSrc: (src: string, width: number): string => {
    // This would integrate with your image optimization service
    // For now, return the original src
    return src;
  },

  // Get image dimensions
  getImageDimensions: (
    src: string
  ): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = reject;
      img.src = src;
    });
  },

  // Preload image
  preloadImage: (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = src;
    });
  },

  // Check if image is cached
  isImageCached: (src: string): boolean => {
    const img = new window.Image();
    img.src = src;
    return img.complete;
  },

  // Generate blur placeholder
  generateBlurPlaceholder: (src: string): string => {
    // This would generate a base64 blur placeholder
    // For now, return a simple data URL
    return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YzZjRmNiIvPjwvc3ZnPg==";
  },
};

// Export default components
export default {
  OptimizedImage,
  LazyImage,
  PriorityImage,
  BackgroundImage,
  ImageGallery,
  useImageOptimization,
  imageUtils,
  IMAGE_CONFIG,
};
