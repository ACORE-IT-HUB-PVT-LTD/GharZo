// src/components/common/LazyImage.jsx
import React, { useEffect, useRef, useState } from 'react';
import profile from '../../assets/Images/profileBG.jpg';
const DEFAULT_PLACEHOLDER = profile; // Use absolute path

export default function LazyImage({
  src,
  alt = '',
  className = '',
  placeholder = DEFAULT_PLACEHOLDER,
  style = {},
  ...props
}) {
  const imgRef = useRef(null);
  const [isInView, setIsInView] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Reset state when src changes
  useEffect(() => {
    setIsInView(false);
    setHasLoaded(false);
    setHasError(false);
  }, [src]);

  useEffect(() => {
    const imgEl = imgRef.current;
    if (!imgEl) return;

    // If already in view (e.g. SSR or no JS), load immediately
    if (imgEl.getBoundingClientRect().top < window.innerHeight) {
      setIsInView(true);
      return;
    }

    let observer;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(imgEl);
          }
        },
        {
          rootMargin: '100px 0px', // Load a bit earlier
          threshold: 0.01,
        }
      );

      observer.observe(imgEl);

      return () => {
        if (observer && imgEl) observer.unobserve(imgEl);
      };
    } else {
      // Fallback: load immediately
      setIsInView(true);
    }
  }, [src]); // Re-run only when src changes

  const handleLoad = () => {
    setHasLoaded(true);
  };

  const handleError = (e) => {
    setHasError(true);
    e.target.src = placeholder;
    if (props.onError) props.onError(e);
  };

  const shouldShowPlaceholder = !hasLoaded || hasError;
  const currentSrc = isInView && !hasError ? src : placeholder;

  return (
    <img
      ref={imgRef}
      src={currentSrc}
      alt={alt}
      className={`
        ${className}
        transition-opacity duration-500 ease-in-out
        ${hasLoaded && !hasError ? 'opacity-100' : 'opacity-0'}
      `.trim()}
      style={{
        ...style,
        // Optional: blur-up effect
        filter: shouldShowPlaceholder ? 'blur(8px)' : 'none',
        transition: 'filter 0.5s ease, opacity 0.5s ease',
      }}
      onLoad={handleLoad}
      onError={handleError}
      // Remove loading="lazy" to avoid conflict
      {...props}
    />
  );
}