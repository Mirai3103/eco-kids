import { useEffect, useRef, useState } from 'react';


export const useLoadingProgress = (isLoaded: boolean) => {
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isLoaded && progress < 100) {
      intervalRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(intervalRef.current as NodeJS.Timeout);
            return 95; 
          }

          if (prev < 60) {
            return prev + 10; 
          }
          if (prev < 85) {
            return prev + 8; 
          }
          return prev + 5; 
        });
      }, 120); 
    }

    // Nếu đã load xong
    if (isLoaded) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current as NodeJS.Timeout);
      }
      setProgress(100);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current as NodeJS.Timeout );
      }
    };
  }, [isLoaded]); 

  return Math.max(1, progress);
};