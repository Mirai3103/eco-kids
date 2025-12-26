import { useMachine } from "@xstate/react";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated } from "react-native";

// Hooks
import { useImageLoader } from "@/hooks/useImageLoader";
import useSession from "@/hooks/useSession";
import useTTS from "@/hooks/useTTS";

// State Machine
import { storyReadMachine } from "@/machines/storyReadMachine";
import { useReadStore } from "@/stores/read.store";
import { useSettingStore } from "@/stores/setting.store";

const AUTO_PLAY_DELAY = 1000;

export const useStoryRead = (storyId: string, selectedGender?: "male" | "female") => {
  const { setLastReadStoryId } = useReadStore();
  const { isDefaultAutoPlay, defaultLanguage, defaultGender } =
    useSettingStore();

  // Session
  const session = useSession();

  // Use selectedGender from query param if available, otherwise use defaultGender
  const initialGender = selectedGender || defaultGender;
  // Initialize state machine
  const [state, send] = useMachine(storyReadMachine, {
    input: {
      storyId,
      userId: session.session?.user?.id,
      isVietnamese: defaultLanguage === "vi",
      gender: initialGender,
      isAutoPlay: isDefaultAutoPlay,
    },
  });

  // Refs
  const pageFlipperRef = useRef<any>(null);
  const isAutoPlayRef = useRef(state.context.isAutoPlay);

  // Animations
  const [menuAnimation] = useState(new Animated.Value(0));
  const [pulseAnimation] = useState(new Animated.Value(1));

  // Hooks
  const { playAudio, stopAll, playTTSOnline } = useTTS();


  // Extract state values
  const {
    currentPage,
    isVietnamese,
    gender,
    isAutoPlay,
    isMuted,
    isMenuVisible,
    isCompletionModalVisible,
    storySegments,
    imageUrls,
    audioUrls,
  } = state.context;

  const isLoading = state.matches("loading");
  const isInPreloadState = state.matches({ loading: "preloadingImages" });

  // Update ref when isAutoPlay changes
  useEffect(() => {
    isAutoPlayRef.current = isAutoPlay;
  }, [isAutoPlay]);

  // Image preloading - only starts after segments are loaded
  const shouldStartPreload = isInPreloadState && imageUrls.length > 0;
  const { isLoading: isImageLoading } = useImageLoader(
    imageUrls,
    shouldStartPreload
  );

  // Notify machine when images are loaded
  useEffect(() => {
    // If in preload state with no images, or images are loaded
    if (isInPreloadState && (imageUrls.length === 0 || !isImageLoading)) {
      send({ type: "IMAGES_LOADED" });
    }
  }, [isInPreloadState, isImageLoading, send, imageUrls.length]);

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

  // Handlers
  const handleFlippedEnd = useCallback(
    (pageIndex: number) => {
      // Stop current audio when flipping page
      stopAll();
      send({ type: "PAGE_FLIPPED", pageIndex });
      if (pageIndex >= 2) {
        setLastReadStoryId(storyId);
      }
    },
    [send, storyId, setLastReadStoryId, stopAll]
  );

  const toggleMenu = useCallback(() => {
    const toValue = isMenuVisible ? 0 : 1;
    send({ type: "TOGGLE_MENU" });

    Animated.spring(menuAnimation, {
      toValue,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, [isMenuVisible, menuAnimation, send]);

  const closeMenu = useCallback(() => {
    send({ type: "CLOSE_MENU" });
    Animated.spring(menuAnimation, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, [menuAnimation, send]);

  const handlePlayAudio = useCallback(
    (options?: { forceLanguage?: boolean; ignoreMute?: boolean }) => {
      const { forceLanguage, ignoreMute } = options || {};

      if (isMuted && !ignoreMute) return;

      const currentSegment = storySegments[currentPage];
      if (!currentSegment) return;

      stopAll();
      const handleFinish = () => {
        send({ type: "AUDIO_FINISHED" });
        // Auto-flip page nếu isAutoPlay = true (sử dụng ref để tránh re-create callback)
        if (isAutoPlayRef.current && currentPage < storySegments.length - 1) {
          if (pageFlipperRef.current) {
            pageFlipperRef.current.nextPage();
          }
        } else {
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
        playTTSOnline(text || "", gender, language, handleFinish, currentSegment.id);
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
      gender,
      send,
    ]
  );

  const toggleMute = useCallback(() => {
    const newIsMuted = !isMuted;
    send({ type: "TOGGLE_MUTE" });

    if (newIsMuted) {
      stopAll();
    } else {
      // Unmuted, play audio immediately
      setTimeout(() => handlePlayAudio({ ignoreMute: true }), 100);
    }
  }, [isMuted, send, stopAll, handlePlayAudio]);

  const handleRestart = useCallback(() => {
    stopAll();
    send({ type: "RESTART" });
    if (pageFlipperRef.current) {
      pageFlipperRef.current.goToPage(0);
    }
  }, [send, stopAll]);

  const handleMenuBack = useCallback(() => {
    stopAll();
    send({ type: "BACK" });
    router.back();
  }, [stopAll, send]);

  const handleToggleLanguage = useCallback(() => {
    stopAll();
    const newIsVietnamese = !isVietnamese;
    send({ type: "TOGGLE_LANGUAGE" });
    // Replay audio with new language immediately
    setTimeout(() => handlePlayAudio({ forceLanguage: newIsVietnamese }), 100);
  }, [isVietnamese, send, stopAll, handlePlayAudio]);

  const handleToggleAutoPlay = useCallback(() => {
    send({ type: "TOGGLE_AUTOPLAY" });
  }, [send]);

  const closeCompletionModal = useCallback(() => {
    send({ type: "CLOSE_COMPLETION_MODAL" });
  }, [send]);

  // Auto-play effect - trigger audio when in playingAudio state
  const isPlayingAudio = state.matches({ ready: "playingAudio" });
  
  useEffect(() => {
    if (isPlayingAudio) {
      const timer = setTimeout(() => {
        handlePlayAudio();
      }, AUTO_PLAY_DELAY);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [isPlayingAudio, currentPage, handlePlayAudio]);


  const handleMute = useCallback(() => {
    if (isMuted) {
      send({ type: "TOGGLE_MUTE" });
    }
  }, [isMuted, send]);

  return {
    // State
    currentPage,
    isVietnamese,
    gender,
    isAutoPlay,
    isMuted,
    isMenuVisible,
    isCompletionModalVisible,
    isLoading: isLoading || isImageLoading,
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
    closeCompletionModal,
    handleMute,

    // Machine state (for debugging)
    machineState: state.value,

    // Speech Recognition
  };
};
