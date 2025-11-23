import { useMutation, useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Alert, Animated } from "react-native";

// Hooks
import { useImageLoader } from "@/hooks/useImageLoader";
import useSession from "@/hooks/useSession";
import useTTS from "@/hooks/useTTS";

// Queries and Types
import { recalculateVector } from "@/lib/egde";
import { getAllStorySegmentsQueryByStoryIdOptions } from "@/lib/queries/segment.query";
import { supabase } from "@/lib/supabase";
import { useReadStore } from "@/stores/read.store";
import { useSettingStore } from "@/stores/setting.store";

const AUTO_PLAY_DELAY = 1000;

export const useStoryRead = (storyId: string) => {
  const { setLastReadStoryId } = useReadStore();
  const { isDefaultAutoPlay, defaultLanguage, defaultGender } = useSettingStore();

  // State
  const [currentPage, setCurrentPage] = useState(0);
  const [isVietnamese, setIsVietnamese] = useState(defaultLanguage === "vi");
  const [gender, setGender] = useState<"male" | "female">(defaultGender);
  const [isAutoPlay, setIsAutoPlay] = useState(isDefaultAutoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  // Refs
  const pageFlipperRef = useRef<any>(null);
  const isAutoPlayRef = useRef(isAutoPlay);

  // Update ref when state changes
  useEffect(() => {
    isAutoPlayRef.current = isAutoPlay;
  }, [isAutoPlay]);

  // Animations
  const [menuAnimation] = useState(new Animated.Value(0));
  const [pulseAnimation] = useState(new Animated.Value(1));

  // Hooks
  const session = useSession();
  const { playAudio, stopAll, playTTSOnline } = useTTS();

  // Data fetching
  const { data, isLoading } = useQuery(
    getAllStorySegmentsQueryByStoryIdOptions(storyId)
  );

  const mutation = useMutation({
    mutationFn: async ({
      storyId,
      segmentId,
      userId,
    }: {
      storyId: string;
      segmentId: string;
      userId: string;
    }) => {
      return await supabase.rpc("log_reading_progress", {
        p_story_id: storyId,
        p_segment_id: segmentId,
        p_user_id: userId,
      });
    },
    onSuccess: () => {
      if (session.session?.user.id) {
        recalculateVector({ userId: session.session.user.id });
      }
    },
    onError: (error) => {
      console.error(error);
      Alert.alert("Lỗi", "Không thể ghi nhận tiến trình đọc");
    },
  });

  // Effects
  useEffect(() => {
    // increase view count
    if (storyId) {
      supabase.rpc("increment_story_view", {
        story_id: storyId,
      });
    }
  }, [storyId]);

  // Gentle pulse animation for the main button
  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTimeout(pulse, 4000);
      });
    };

    const timer = setTimeout(pulse, 3000);
    return () => clearTimeout(timer);
  }, [pulseAnimation]);

  // Memoized computations
  const storySegments = useMemo(() => {
    return (
      data?.sort((a, b) => (a.segment_index || 0) - (b.segment_index || 0)) ||
      []
    );
  }, [data]);

  const imageUrls = useMemo(() => {
    return storySegments
      .map((segment) => segment.image_url)
      .filter(Boolean) as string[];
  }, [storySegments]);

  const audioUrls = useMemo(() => {
    return storySegments.map((segment) => {
      const targetLang = isVietnamese ? "vi" : "en";
      const audioSegment = segment.audio_segments?.find(
        (audio) => audio.language === targetLang && audio.gender === gender
      );
      return audioSegment?.audio_url || "";
    });
  }, [storySegments, isVietnamese, gender]);

  // Image preloading
  const { isLoading: isImageLoading } = useImageLoader(imageUrls, !isLoading);

  // Handlers
  const handleFlippedEnd = useCallback(
    (pageIndex: number) => {
      if (session.session?.user.id && storySegments[pageIndex]) {
        mutation.mutate({
          storyId,
          segmentId: storySegments[pageIndex].id,
          userId: session.session.user.id,
        });
      }
      setCurrentPage(pageIndex);
      if (pageIndex >= 2) setLastReadStoryId(storyId);
    },
    [
      session.session?.user.id,
      storyId,
      storySegments,
      mutation,
      setLastReadStoryId,
    ]
  );

  const toggleMenu = useCallback(() => {
    const toValue = isMenuVisible ? 0 : 1;
    setIsMenuVisible(!isMenuVisible);

    Animated.spring(menuAnimation, {
      toValue,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, [isMenuVisible, menuAnimation]);

  const closeMenu = useCallback(() => {
    setIsMenuVisible(false);
    Animated.spring(menuAnimation, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, [menuAnimation]);

  const handlePlayAudio = useCallback(
    (options?: { forceLanguage?: boolean; ignoreMute?: boolean }) => {
      const { forceLanguage, ignoreMute } = options || {};

      if (isMuted && !ignoreMute) return;

      const currentSegment = storySegments[currentPage];
      if (!currentSegment) return;

      stopAll();
      const handleFinish = () => {
        if (isAutoPlayRef.current && currentPage < storySegments.length - 1) {
          if (pageFlipperRef.current) {
            pageFlipperRef.current.nextPage();
          }
        }
      };

      const audioUrl = audioUrls[currentPage];
      
      const targetIsVietnamese =
        forceLanguage !== undefined ? forceLanguage : isVietnamese;

      if (audioUrl) {
        playAudio(audioUrl, handleFinish);
      } else {
        const text = targetIsVietnamese
          ? currentSegment.vi_text
          : currentSegment.en_text;
        const language = targetIsVietnamese ? "vi" : "en";
        playTTSOnline(text || "", gender, language, handleFinish);
      }
    },
    [
      currentPage,
      storySegments,
      audioUrls,
      isVietnamese,
      playAudio,
      isMuted,
      playTTSOnline,
      stopAll,
      gender
    ]
  );

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const newState = !prev;
      if (newState) {
        stopAll();
      } else {
        // Unmuted, play audio immediately
        setTimeout(() => handlePlayAudio({ ignoreMute: true }), 100);
      }
      return newState;
    });
    closeMenu();
  }, [stopAll, closeMenu, handlePlayAudio]);

  const handleRestart = useCallback(() => {
    if (pageFlipperRef.current) {
      pageFlipperRef.current.goToPage(0);
      setCurrentPage(0);
    }
    closeMenu();
  }, [closeMenu]);

  const handleMenuBack = useCallback(() => {
    stopAll();
    router.back();
  }, [stopAll]);

  const handleToggleLanguage = useCallback(() => {
    stopAll();
    setIsVietnamese((prev) => {
      const newState = !prev;
      // Replay audio with new language immediately
      setTimeout(() => handlePlayAudio({ forceLanguage: newState }), 100);
      return newState;
    });
    closeMenu();
  }, [closeMenu, handlePlayAudio, stopAll]);

  const handleToggleAutoPlay = useCallback(() => {
    setIsAutoPlay((prev) => {
      const newState = !prev;
      isAutoPlayRef.current = newState; // Update ref immediately to prevent race conditions
      return newState;
    });
    closeMenu();
  }, [closeMenu]);

  // Auto-play effect
  useEffect(() => {
    if (isAutoPlay && storySegments.length > 0) {
      const timer = setTimeout(() => {
        handlePlayAudio();
      }, AUTO_PLAY_DELAY);

      return () => clearTimeout(timer);
    }
  }, [handlePlayAudio, isAutoPlay, currentPage, storySegments.length]);

  return {
    // State
    currentPage,
    isVietnamese,
    gender,
    isAutoPlay,
    isMuted,
    isMenuVisible,
    isLoading,
    isImageLoading,
    storySegments,

    // Refs
    pageFlipperRef,

    // Animations
    menuAnimation,
    pulseAnimation,

    // Handlers
    handleFlippedEnd,
    toggleMenu,
    closeMenu,
    toggleMute,
    handleRestart,
    handleMenuBack,
    handleToggleLanguage,
    handleToggleAutoPlay,
  };
};
