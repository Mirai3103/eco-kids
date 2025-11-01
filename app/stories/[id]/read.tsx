import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import PageFlipper from "@laffy1309/react-native-page-flipper";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Image as ExpoImage } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ImageStyle, TextStyle } from "react-native";
import {
  Alert,
  Animated,
  Dimensions,
  Pressable,
  StatusBar,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Components
import LoadingScreen from "@/components/LoadingScreen";
import { Center } from "@/components/ui/center";
import { Text } from "@/components/ui/text";

// Hooks
import { useImageLoader } from "@/hooks/useImageLoader";
import useTTS from "@/hooks/useTTS";

// Queries and Types
import useSession from "@/hooks/useSession";
import { recalculateVector } from "@/lib/egde";
import { getAllStorySegmentsQueryByStoryIdOptions } from "@/lib/queries/segment.query";
import { supabase } from "@/lib/supabase";
import { StorySegment } from "@/types";
import * as Network from "expo-network";

// Constants
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const AUTO_PLAY_DELAY = 1000;

// Types
type Language = "vi" | "en";
type Gender = "male" | "female";

interface ControlButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
  color?: string;
  size?: number;
  shadowColor?: string;
}

interface StoryPageProps {
  segment: StorySegment;
  isVietnamese?: boolean;
}

interface FloatingButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  color?: string;
  disabled?: boolean;
  size?: number;
}

interface Menu3DButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  color?: string;
  shadowColor?: string;
  disabled?: boolean;
  size?: number;
}

// 3D Control Button Component
const ControlButton = React.memo<ControlButtonProps>(
  ({
    icon,
    onPress,
    disabled = false,
    color = "#22C55E",
    size = 48,
    shadowColor = "#22C55E",
  }) => {
    const shadowStyle: ViewStyle = useMemo(
      () => ({
        backgroundColor: disabled ? "#9CA3AF" : shadowColor,
        width: size,
        height: size,
        borderRadius: size / 2,
        position: "absolute",
        top: 3,
        left: 0,
      }),
      [disabled, shadowColor, size]
    );

    const topLayerStyle: ViewStyle = useMemo(
      () => ({
        backgroundColor: disabled ? "#D1D5DB" : color,
        width: size,
        height: size,
        borderRadius: size / 2,
        justifyContent: "center",
        alignItems: "center",
      }),
      [disabled, color, size]
    );

    return (
      <Pressable
        onPress={disabled ? undefined : onPress}
        disabled={disabled}
        style={({ pressed }) => ({
          opacity: pressed ? 0.8 : 1,
          transform: [{ scale: pressed ? 0.95 : 1 }],
        })}
      >
        <View style={{ position: "relative" }}>
          <View style={shadowStyle} />
          <View style={topLayerStyle}>{icon}</View>
        </View>
      </Pressable>
    );
  }
);

// Floating Button Component
const FloatingButton = React.memo<FloatingButtonProps>(
  ({ icon, onPress, color = "#22C55E", disabled = false, size = 50 }) => {
    return (
      <Pressable
        onPress={disabled ? undefined : onPress}
        disabled={disabled}
        style={({ pressed }) => ({
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: disabled ? "#9CA3AF" : color,
          justifyContent: "center",
          alignItems: "center",
          shadowColor: color,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 8,
          borderWidth: 2,
          borderColor: "#FFF",
          opacity: pressed ? 0.8 : 1,
          transform: [{ scale: pressed ? 0.95 : 1 }],
        })}
      >
        {icon}
      </Pressable>
    );
  }
);

// Menu 3D Button Component
const Menu3DButton = React.memo<Menu3DButtonProps>(
  ({
    icon,
    onPress,
    color = "#22C55E",
    shadowColor,
    disabled = false,
    size = 50,
  }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start();
    };

    const effectiveShadowColor = shadowColor || color;

    return (
      <Pressable
        onPress={disabled ? undefined : onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <View style={{ position: "relative" }}>
            {/* Shadow/Bottom layer */}
            <View
              style={{
                backgroundColor: disabled ? "#6B7280" : effectiveShadowColor,
                width: size,
                height: size,
                borderRadius: size / 2,
                position: "absolute",
                top: 4,
                left: 0,
              }}
            />
            {/* Top layer */}
            <View
              style={{
                backgroundColor: disabled ? "#9CA3AF" : color,
                width: size,
                height: size,
                borderRadius: size / 2,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {icon}
            </View>
          </View>
        </Animated.View>
      </Pressable>
    );
  }
);

// Story Page Component
const StoryPage = React.memo<StoryPageProps>(
  ({ segment, isVietnamese = true }) => {
    const containerStyle: ViewStyle = useMemo(
      () => ({
        flex: 1,
        backgroundColor: "white",
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        margin: 0,
      }),
      []
    );

    const imageStyle: ImageStyle = useMemo(
      () => ({
        width: screenWidth - 40,
        height: screenHeight * 0.55,
        borderRadius: 12,
      }),
      []
    );

    const textStyle: TextStyle = useMemo(
      () => ({
        color: "#1B4B07",
        fontSize: 18,
        lineHeight: 28,
        textAlign: "center" as const,
        fontFamily: "NunitoSans_600SemiBold",
        marginBottom: 16,
      }),
      []
    );

    const displayText = useMemo(() => {
      return isVietnamese ? segment?.vi_text : segment?.en_text || "";
    }, [isVietnamese, segment?.vi_text, segment?.en_text]);

    if (!segment) return null;

    return (
      <View style={containerStyle}>
        <View style={{ flex: 1, padding: 20, justifyContent: "space-between" }}>
          {/* Image Section */}
          {segment.image_url && (
            <Center style={{ flex: 1, marginBottom: 20 }}>
              <ExpoImage
                source={{ uri: segment.image_url }}
                style={imageStyle}
                alt={`Story page ${(segment.segment_index || 0) + 1}`}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
            </Center>
          )}

          {/* Text Content Section */}
          <View style={{ paddingBottom: 40 }}>
            <Text style={textStyle}>{displayText}</Text>
          </View>
        </View>
      </View>
    );
  }
);

export default function ReadStoryScreen() {
  console.log("ReadStoryScreen");
  const params = useLocalSearchParams();
  const storyId = params.id as string;

  // State
  const [currentPage, setCurrentPage] = useState(0);
  const [isVietnamese, setIsVietnamese] = useState(true);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  React.useEffect(() => {
    // increase view count
    supabase.rpc("increment_story_view", {
      story_id: storyId,
    });
  }, []);

  // Refs
  const pageFlipperRef = useRef<any>(null);

  // Menu animations
  const [menuAnimation] = useState(new Animated.Value(0));
  const [pulseAnimation] = useState(new Animated.Value(1));
  const networkState = Network.useNetworkState();
  console.log(networkState, ":networkState");

  const session = useSession();
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
      recalculateVector({ userId: session.session!.user.id });
    },
    onError: (error) => {
      console.error(error);
      Alert.alert("Lỗi", "Không thể ghi nhận tiến trình đọc");
    },
  });
  // Data fetching
  const { data, isLoading } = useQuery(
    getAllStorySegmentsQueryByStoryIdOptions(storyId)
  );

  // Memoized computations
  const storySegments = useMemo(() => {
    return (
      data?.sort((a, b) => (a.segment_index || 0) - (b.segment_index || 0)) ||
      []
    );
  }, [data?.length]);

  const imageUrls = useMemo(() => {
    return storySegments
      .map((segment) => segment.image_url)
      .filter(Boolean) as string[];
  }, [storySegments]);

  const audioUrls = useMemo(() => {
    return storySegments.map((segment) => {
      const audioSegment = segment.audio_segments?.find(
        (audio) => audio.language === "vi" && audio.gender === "female"
      );
      return audioSegment?.audio_url || "";
    });
  }, [storySegments]);

  // Hooks
  const { isLoading: isImageLoading } = useImageLoader(imageUrls, !isLoading);
  const { playAudio, playTTSOffline, stopAll, playTTSOnline } = useTTS();

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
  }, []);

  // Navigation handlers
  const handleBack = useCallback(() => {
    stopAll();
    router.back();
  }, [stopAll]);

  const handlePreviousPage = useCallback(() => {
    if (pageFlipperRef.current && currentPage > 0) {
      pageFlipperRef.current.previousPage();
    }
  }, [currentPage]);

  const handleNextPage = useCallback(() => {
    if (pageFlipperRef.current && currentPage < storySegments.length - 1) {
      pageFlipperRef.current.nextPage();
    }
  }, [currentPage, storySegments.length]);

  const handleFlippedEnd = useCallback(
    (pageIndex: number) => {
      mutation.mutate({
        storyId,
        segmentId: storySegments[pageIndex].id,
        userId: session.session!.user.id,
      });
      setCurrentPage(pageIndex);
    },
    [session.session?.user.id, storyId, storySegments]
  );

  // Render function for PageFlipper
  const renderStoryPage = useCallback(
    (segmentData: string) => {
      const segment = JSON.parse(segmentData);
      return <StoryPage segment={segment} isVietnamese={isVietnamese} />;
    },
    [isVietnamese]
  );

  const toggleLanguage = useCallback(() => {
    setIsVietnamese((prev) => !prev);
  }, []);

  const handleSettings = useCallback(() => {
    setIsAutoPlay((prev) => !prev);
  }, []);

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

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
    if (!isMuted) {
      stopAll();
    }
    closeMenu();
  }, [isMuted, stopAll, closeMenu]);

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
    setIsVietnamese((prev) => !prev);
    closeMenu();
  }, [closeMenu]);

  const handleToggleAutoPlay = useCallback(() => {
    setIsAutoPlay((prev) => !prev);
    closeMenu();
  }, [closeMenu]);

  // Audio handling
  const handlePlayAudio = useCallback(() => {
    if (isMuted) return;

    const currentSegment = storySegments[currentPage];
    if (!currentSegment) return;

    stopAll();
    const handleFinish = () => {
      if (isAutoPlay && currentPage < storySegments.length - 1) {
        if (pageFlipperRef.current) {
          pageFlipperRef.current.nextPage();
        }
      }
    };

    const audioUrl = audioUrls[currentPage];
    if (audioUrl) {
      playAudio(audioUrl, handleFinish);
    } else {
      const text = isVietnamese
        ? currentSegment.vi_text
        : currentSegment.en_text;
      const language = isVietnamese ? "vi" : "en";
      playTTSOnline(text || "", "female", language, handleFinish);
    }
  }, [
    currentPage,
    storySegments,
    audioUrls,
    isVietnamese,
    isAutoPlay,
    playAudio,
    playTTSOffline,
    isMuted,
  ]);

  // Auto-play effect
  useEffect(() => {
    if (isAutoPlay && storySegments.length > 0) {
      const timer = setTimeout(() => {
        handlePlayAudio();
      }, AUTO_PLAY_DELAY);

      return () => clearTimeout(timer);
    }
  }, [handlePlayAudio, isAutoPlay, currentPage]);

  // Loading state
  if (isLoading || isImageLoading) {
    return <LoadingScreen isLoaded={!isLoading && !isImageLoading} />;
  }

  // Error state
  if (!storySegments.length) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>No story segments found</Text>
      </View>
    );
  }

  const currentSegment = storySegments[currentPage];
  if (!currentSegment) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Story segment not found</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* PageFlipper - Full Screen */}
      <PageFlipper
        ref={pageFlipperRef}
        data={storySegments.map((segment) => JSON.stringify(segment))}
        pageSize={{ width: screenWidth, height: screenHeight }}
        portrait={true}
        singleImageMode={true}
        enabled={true}
        pressable={true}
        renderPage={renderStoryPage}
        contentContainerStyle={{ flex: 1 }}
        onFlippedEnd={handleFlippedEnd}
      />

      {/* Fixed Menu Button - Top Right */}
      <SafeAreaView
        style={{ position: "absolute", top: 0, right: 0, zIndex: 1000 }}
      >
        <View style={{ padding: 20 }}>
          <Animated.View
            style={{
              transform: [{ scale: pulseAnimation }],
            }}
          >
            <Pressable
              onPress={toggleMenu}
              style={({ pressed }) => ({
                width: 70,
                height: 70,
                borderRadius: 35,
                backgroundColor: isMenuVisible ? "#FFE6F2" : "#FFFFFF",
                justifyContent: "center",
                alignItems: "center",
                shadowColor: "#22C55E",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
                elevation: 12,
                borderWidth: 4,
                borderColor: isMenuVisible ? "#FF69B4" : "#22C55E",
                opacity: pressed ? 0.8 : 1,
                transform: [{ scale: pressed ? 0.9 : 1 }],
              })}
            >
              <MaterialIcons
                name={isMenuVisible ? "close" : "menu"}
                size={36}
                color={isMenuVisible ? "#FF69B4" : "#22C55E"}
              />
            </Pressable>
          </Animated.View>
        </View>
      </SafeAreaView>

      {/* Dropdown Menu */}
      {isMenuVisible && (
        <>
          {/* Overlay */}
          <Pressable
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              zIndex: 999,
            }}
            onPress={closeMenu}
          />

          {/* Menu Content */}
          <Animated.View
            style={{
              position: "absolute",
              top: 110,
              right: 20,
              backgroundColor: "white",
              borderRadius: 24,
              paddingVertical: 16,
              paddingHorizontal: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.2,
              shadowRadius: 16,

              elevation: 16,
              zIndex: 1001,
              opacity: menuAnimation,
              gap: 6,
              transform: [
                {
                  translateY: menuAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
                {
                  scale: menuAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            }}
          >
            {/* Home Button */}
            <View
              style={{
                paddingVertical: 4,
                paddingHorizontal: 8,
                alignItems: "center",
              }}
            >
              <Menu3DButton
                icon={<Ionicons name="home" size={28} color="white" />}
                onPress={handleMenuBack}
                color="#EF4444"
                shadowColor="#DC2626"
                size={50}
              />
            </View>

            {/* Language Toggle */}
            <View
              style={{
                paddingVertical: 4,
                paddingHorizontal: 8,
                alignItems: "center",
              }}
            >
              <Menu3DButton
                icon={
                  <Text style={{ fontSize: 24 }}>
                    {isVietnamese ? "🇻🇳" : "🇬🇧"}
                  </Text>
                }
                onPress={handleToggleLanguage}
                color="#3B82F6"
                shadowColor="#2563EB"
                size={50}
              />
            </View>

            {/* Mute Toggle */}
            <View
              style={{
                paddingVertical: 4,
                paddingHorizontal: 8,
                alignItems: "center",
              }}
            >
              <Menu3DButton
                icon={
                  <Ionicons
                    name={isMuted ? "volume-mute" : "volume-high"}
                    size={28}
                    color="white"
                  />
                }
                onPress={toggleMute}
                color={isMuted ? "#F59E0B" : "#10B981"}
                shadowColor={isMuted ? "#D97706" : "#059669"}
                size={50}
              />
            </View>

            {/* Auto Play Toggle */}
            <View
              style={{
                paddingVertical: 4,
                paddingHorizontal: 8,
                alignItems: "center",
              }}
            >
              <Menu3DButton
                icon={
                  <Ionicons
                    name={isAutoPlay ? "pause" : "play"}
                    size={28}
                    color="white"
                  />
                }
                onPress={handleToggleAutoPlay}
                color={isAutoPlay ? "#EF4444" : "#22C55E"}
                shadowColor={isAutoPlay ? "#DC2626" : "#16A34A"}
                size={50}
              />
            </View>

            {/* Restart Button */}
            <View
              style={{
                paddingVertical: 4,
                paddingHorizontal: 8,
                alignItems: "center",
              }}
            >
              <Menu3DButton
                icon={<Ionicons name="refresh" size={28} color="white" />}
                onPress={handleRestart}
                color="#8B5CF6"
                shadowColor="#7C3AED"
                size={50}
              />
            </View>
          </Animated.View>
        </>
      )}
    </View>
  );
}
