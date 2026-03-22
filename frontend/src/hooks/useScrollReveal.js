import { useEffect, useRef, useState, useCallback } from 'react';

export function useScrollReveal(options = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const observerRef = useRef(null);

  // Use callback ref so the observer re-attaches when the DOM element appears
  const ref = useCallback(
    (node) => {
      // Clean up previous observer
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      if (!node || isVisible) return;

      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observerRef.current?.disconnect();
          }
        },
        {
          threshold: options.threshold || 0.05,
          rootMargin: options.rootMargin || '0px 0px 50px 0px',
        }
      );

      observerRef.current.observe(node);
    },
    [options.threshold, options.rootMargin]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => observerRef.current?.disconnect();
  }, []);

  return { ref, isVisible };
}
