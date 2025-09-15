import { Feather, Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ImageStyle, TextStyle } from "react-native";
import {
  Animated,
  Dimensions,
  Pressable,
  StatusBar,
  View,
  ViewStyle
} from "react-native";
import {
  PanGestureHandler
} from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

// Components
import LoadingScreen from "@/components/LoadingScreen";
import { Center } from "@/components/ui/center";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

// Hooks
import { useImageLoader } from "@/hooks/useImageLoader";
import useTTS from "@/hooks/useTTS";

// Queries and Types
import { getAllStorySegmentsQueryByStoryIdOptions } from "@/lib/queries/segment.query";
import { StorySegment } from "@/types";

// Constants
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const SWIPE_THRESHOLD = 50;
const SWIPE_VELOCITY_THRESHOLD = 500;
const ANIMATION_DURATION = 300;
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

interface GestureEventData {
  translationX: number;
  velocityX: number;
}

// 3D Control Button Component
const ControlButton = React.memo<ControlButtonProps>(({
  icon,
  onPress,
  disabled = false,
  color = "#22C55E",
  size = 48,
  shadowColor = "#22C55E",
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    if (!disabled) {
      Animated.spring(scaleAnim, {
        toValue: 0.9,
        useNativeDriver: true,
      }).start();
    }
  }, [disabled, scaleAnim]);

  const handlePressOut = useCallback(() => {
    if (!disabled) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  }, [disabled, scaleAnim]);

  const shadowStyle: ViewStyle = useMemo(() => ({
    backgroundColor: disabled ? "#9CA3AF" : shadowColor,
    width: size,
    height: size,
    borderRadius: size / 2,
    position: "absolute",
    top: 3,
    left: 0,
  }), [disabled, shadowColor, size]);

  const topLayerStyle: ViewStyle = useMemo(() => ({
    backgroundColor: disabled ? "#D1D5DB" : color,
    width: size,
    height: size,
    borderRadius: size / 2,
    justifyContent: "center",
    alignItems: "center",
  }), [disabled, color, size]);

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <View style={{ position: "relative" }}>
          <View style={shadowStyle} />
          <View style={topLayerStyle}>
            {icon}
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
});

// Story Page Component
const StoryPage = React.memo<StoryPageProps>(({
  segment,
  isVietnamese = true,
}) => {
  const containerStyle: ViewStyle = useMemo(() => ({
    flex: 1,
    backgroundColor: "white",
    borderRadius: 20,
    margin: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  }), []);

  const imageStyle: ImageStyle = useMemo(() => ({
    width: screenWidth - 80,
    height: (screenHeight - 200) * 0.5,
    borderRadius: 16,
  }), []);

  const textStyle: TextStyle = useMemo(() => ({
    color: "#1B4B07",
    fontSize: 18,
    lineHeight: 28,
    textAlign: "center" as const,
    fontFamily: "NunitoSans_600SemiBold",
    marginBottom: 16,
  }), []);

  const displayText = useMemo(() => {
    return isVietnamese ? segment?.vi_text : segment?.en_text || "";
  }, [isVietnamese, segment?.vi_text, segment?.en_text]);

  if (!segment) return null;

  return (
    <View style={containerStyle}>
      <View className="flex-1 p-6">
        {/* Image Section */}
        {segment.image_url && (
          <Center className="flex-1">
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
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Text style={textStyle}>
            {displayText}
          </Text>
        </View>
      </View>
    </View>
  );
});

export default function ReadStoryScreen() {
  const params = useLocalSearchParams();
  const storyId = params.id as string;
  
  // State
  const [currentPage, setCurrentPage] = useState(0);
  const [isVietnamese, setIsVietnamese] = useState(true);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  
  // Refs
  const translateX = useRef(new Animated.Value(0)).current;
  
  // Data fetching
  const { data, isLoading } = useQuery(
    getAllStorySegmentsQueryByStoryIdOptions(storyId)
  );
  
  // Memoized computations
  const storySegments = useMemo(() => {
    return data?.sort((a, b) => (a.segment_index || 0) - (b.segment_index || 0)) || [];
  }, [data?.length]);
  
  const imageUrls = useMemo(() => {
    return storySegments.map((segment) => segment.image_url).filter(Boolean) as string[];
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
  const { playAudio, playTTSOffline,stopAll } = useTTS();

  // Navigation handlers
  const handleBack = useCallback(() => {
    stopAll()
    router.back();
  }, [stopAll]);

  const handlePreviousPage = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
      Animated.timing(translateX, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }).start();
    }
  }, [currentPage, translateX]);

  const handleNextPage = useCallback(() => {
    if (currentPage < storySegments.length - 1) {
      setCurrentPage(prev => prev + 1);
      Animated.timing(translateX, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }).start();
    }
  }, [currentPage, storySegments.length, translateX]);

  // Gesture handlers
  const handleGestureEvent = useMemo(
    () => Animated.event(
      [{ nativeEvent: { translationX: translateX } }],
      { useNativeDriver: true }
    ),
    [translateX]
  );

  const handleGestureEnd = useCallback((event: { nativeEvent: GestureEventData }) => {
    const { translationX, velocityX } = event.nativeEvent;

    if (translationX > SWIPE_THRESHOLD || velocityX > SWIPE_VELOCITY_THRESHOLD) {
      handlePreviousPage();
    } else if (translationX < -SWIPE_THRESHOLD || velocityX < -SWIPE_VELOCITY_THRESHOLD) {
      handleNextPage();
    } else {
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  }, [handlePreviousPage, handleNextPage, translateX]);

  const toggleLanguage = useCallback(() => {
    setIsVietnamese(prev => !prev);
  }, []);

  const handleSettings = useCallback(() => {
    setIsAutoPlay(prev => !prev);
  }, []);

  // Audio handling
  const handlePlayAudio = useCallback(() => {
    const currentSegment = storySegments[currentPage];
    if (!currentSegment) return;

    stopAll()
    const handleFinish = () => {
      if (isAutoPlay && currentPage < storySegments.length - 1) {
        setCurrentPage(prev => prev + 1);
      }
    };

    const audioUrl = audioUrls[currentPage];
    if (audioUrl) {

      playAudio(audioUrl, handleFinish);
    } else {
      const text = isVietnamese ? currentSegment.vi_text : currentSegment.en_text;
      const language = isVietnamese ? "vi-VN" : "en-US";
      playTTSOffline(text || "", language, handleFinish);
    }
  }, [
    currentPage, 
    storySegments, 
    audioUrls, 
    isVietnamese, 
    isAutoPlay, 
    playAudio, 
    playTTSOffline
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No story segments found</Text>
      </View>
    );
  }

  const currentSegment = storySegments[currentPage];
  if (!currentSegment) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Story segment not found</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Background Gradient */}
      <LinearGradient
        colors={["#EEF0FE", "#CAFEC3"]}
        style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      <SafeAreaView className="flex-1">
        {/* Header */}
        <HStack className="justify-between items-center px-6 py-4">
          <Pressable
            onPress={handleBack}
            style={{
              backgroundColor: "white",
              borderRadius: 20,
              width: 40,
              height: 40,
              justifyContent: "center",
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Ionicons name="arrow-back" size={20} color="#1B4B07" />
          </Pressable>

          <Text
            style={{
              color: "#1B4B07",
              fontSize: 18,
              fontFamily: "Baloo2_700Bold",
            }}
          >
            Đọc truyện
          </Text>

          {/* Language Toggle */}
          <Pressable
            onPress={toggleLanguage}
            style={{
              backgroundColor: "white",
              borderRadius: 20,
              paddingHorizontal: 8,
              paddingVertical: 2,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Text
              style={{
                color: "#1B4B07",
                fontSize: 24,
              }}
            >
              {isVietnamese ? "🇻🇳" : "🇬🇧"}
            </Text>
          </Pressable>
        </HStack>

        {/* Main Content - Swipeable Pages */}
        <VStack style={{ flex: 1, marginTop: -10 }}>
          <PanGestureHandler
            onGestureEvent={handleGestureEvent}
            onHandlerStateChange={handleGestureEnd}
          >
            <Animated.View
              style={{
                flex: 1,
                transform: [{ translateX }],
              }}
            >
              <StoryPage
                segment={currentSegment}
                isVietnamese={isVietnamese}
              />
            </Animated.View>
          </PanGestureHandler>
        </VStack>

        {/* Bottom Controls */}
        <VStack
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingHorizontal: 24,
            paddingVertical: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <HStack className="justify-between items-center">
            {/* Previous Button */}
            <ControlButton
              icon={<Feather name="chevron-left" size={24} color="white" />}
              onPress={handlePreviousPage}
              disabled={currentPage === 0}
              shadowColor="#16A34A"
            />

            {/* Center Controls */}
            <HStack space="lg" className="items-center">
              {/* Audio Button */}
              <ControlButton
                icon={<Feather name="volume-2" size={20} color="white" />}
                onPress={handlePlayAudio}
                color="#3B82F6"
                size={40}
                shadowColor="#2563EB"
              />

              {/* Page Progress */}
              <VStack className="items-center">
                <Text
                  style={{
                    color: "#1B4B07",
                    fontSize: 16,
                    fontFamily: "Baloo2_700Bold",
                  }}
                >
                  {currentPage + 1}/{storySegments.length}
                </Text>

                {/* Progress Bar */}
                <View
                  style={{
                    width: 100,
                    height: 4,
                    backgroundColor: "#E5E7EB",
                    borderRadius: 2,
                    marginTop: 4,
                  }}
                >
                  <View
                    style={{
                      width: `${
                        ((currentPage + 1) / storySegments.length) * 100
                      }%`,
                      height: "100%",
                      backgroundColor: "#22C55E",
                      borderRadius: 2,
                    }}
                  />
                </View>
              </VStack>

              {/* Settings Button */}
              <ControlButton
                icon={<Feather name={isAutoPlay ? "pause" : "play"} size={20} color="white" />}
                onPress={handleSettings}
                color={isAutoPlay ? "#EF4444" : "#22C55E"}
                size={40}
                shadowColor={isAutoPlay ? "#DC2626" : "#16A34A"}
              />
            </HStack>

            {/* Next Button */}
            <ControlButton
              icon={<Feather name="chevron-right" size={24} color="white" />}
              onPress={handleNextPage}
              disabled={currentPage === storySegments.length - 1}
              shadowColor="#16A34A"
            />
          </HStack>
        </VStack>
      </SafeAreaView>
    </View>
  );
}
