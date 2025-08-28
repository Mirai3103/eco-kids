import { Image as ExpoImage } from "expo-image";
import { useEffect, useState } from "react";

export const useImageLoader = (imageUrl: string | string[],enabled: boolean = true) => {
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    async function loadImages() {
      if(!enabled) return;
      setIsLoading(true);
      if (Array.isArray(imageUrl)) {
        await Promise.all(imageUrl.map((url) => ExpoImage.prefetch(url,'memory-disk')));
      } else {
        await ExpoImage.prefetch(imageUrl,'memory-disk');
      }
      setIsLoading(false);
    }
    loadImages();
  }, [imageUrl,enabled]);

  return {
    isLoading,
  };
};
