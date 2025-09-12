import { Feather, Ionicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import { Animated, Dimensions, Pressable, StatusBar, View } from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
// GlueStack UI Components
import LoadingScreen from "@/components/LoadingScreen";
import { Center } from "@/components/ui/center";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useImageLoader } from "@/hooks/useImageLoader";
import useTTS from "@/hooks/useTTS";
import { getAllStorySegmentsQueryByStoryIdOptions } from "@/lib/queries/segment.query";
import { StorySegment } from "@/types";
import { useQuery } from "@tanstack/react-query";
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// 3D Control Button Component
const ControlButton = ({
  icon,
  onPress,
  disabled = false,
  color = "#22C55E",
  size = 48,
  total = 0,
  shadowColor = "#22C55E",
}: {
  icon: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
  color?: string;
  size?: number;
  total?: number;
  shadowColor?: string;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!disabled) {
      Animated.spring(scaleAnim, {
        toValue: 0.9,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  };

  const darkerColor = disabled ? "#9CA3AF" : shadowColor;

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
              backgroundColor: darkerColor,
              width: size,
              height: size,
              borderRadius: size / 2,
              position: "absolute",
              top: 3,
              left: 0,
            }}
          />
          {/* Top layer */}
          <View
            style={{
              backgroundColor: disabled ? "#D1D5DB" : color,
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
};

// Story Page Component
const StoryPage = ({
  segment,
  isVietnamese = true,
  total = 0,
}: {
  segment: StorySegment;
  isVietnamese?: boolean;
  total?: number;
}) => {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "white",
        borderRadius: 20,
        margin: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 10,
      }}
    >
      <View className="flex-1 p-6">
        {/* Image Section */}
        {segment?.image_url && (
          <Center className="flex-1">
            <ExpoImage
              source={{ uri: segment.image_url }}
              style={{
                width: screenWidth - 80,
                height: (screenHeight - 200) * 0.5,
                borderRadius: 16,
              }}
              alt={`Story page ${(segment.segment_index || 0) + 1}`}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
          </Center>
        )}

        {/* Text Content Section */}
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Text
            style={{
              color: "#1B4B07",
              fontSize: 18,
              lineHeight: 28,
              textAlign: "center",
              fontFamily: "NunitoSans_600SemiBold",
              marginBottom: 16,
            }}
          >
            {isVietnamese ? segment?.vi_text : segment?.en_text || ""}
          </Text>
        </View>
      </View>
    </View>
  );
};
type Language = "vi" | "en";
type Gender = "male" | "female";
export default function ReadStoryScreen() {
  const params = useLocalSearchParams();
  const storyId = params.id as string;
  const [currentPage, setCurrentPage] = useState(0);
  const [isVietnamese, setIsVietnamese] = useState(true);
  const translateX = useRef(new Animated.Value(0)).current;
  const { data, isLoading } = useQuery(
    getAllStorySegmentsQueryByStoryIdOptions(storyId)
  );
  const imageUrls = React.useMemo(
    () => data?.map((segment) => segment.image_url!) || [],
    [data]
  );
  const { isLoading: isImageLoading } = useImageLoader(imageUrls, !isLoading);
  const selectAudioUrl = React.useMemo(
    () =>
      data
        ?.sort((a, b) => (a.segment_index || 0) - (b.segment_index || 0))
        .map(
          (segment) =>
            segment.audio_segments.find(
              (audio) => audio.language === "vi" && audio.gender === "female"
            )?.audio_url || ""
        ) || [],
    [data?.length]
  );
  const {playAudio,playTTSOffline} = useTTS()
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const storySegments = React.useMemo(
    () =>
      data?.sort((a, b) => (a.segment_index || 0) - (b.segment_index || 0)) ||
      [],
    [data?.length]
  );

  const handleBack = () => {
    router.back();
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      Animated.timing(translateX, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleNextPage = () => {
    if (currentPage < storySegments.length - 1) {
      setCurrentPage(currentPage + 1);
      Animated.timing(translateX, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const handleGestureEnd = (event: any) => {
    const { translationX, velocityX } = event.nativeEvent;

    if (translationX > 50 || velocityX > 500) {
      // Swipe right - go to previous page
      handlePreviousPage();
    } else if (translationX < -50 || velocityX < -500) {
      // Swipe left - go to next page
      handleNextPage();
    } else {
      // Return to original position
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  };

  const toggleLanguage = () => {
    setIsVietnamese(!isVietnamese);
  };

  const handlePlayAudio = React.useCallback(() => {
    const handleFinish = () => {
      if(currentPage  < storySegments.length - 1){
        setCurrentPage(currentPage + 1)
      }
    }
    if(selectAudioUrl[currentPage]){
      playAudio(selectAudioUrl[currentPage],handleFinish)
      
    }else{
      playTTSOffline( (isVietnamese ? storySegments[currentPage].vi_text : storySegments[currentPage].en_text )|| "" ,isVietnamese ? "vi-VN" : "en-US",handleFinish)
    }
  }, [currentPage, storySegments, isVietnamese, playAudio, playTTSOffline]);
  React.useEffect(() => {
    if(isAutoPlay){
      setTimeout(() => {
      handlePlayAudio()
      }, 1000)
    }
  }, [handlePlayAudio,isAutoPlay,currentPage, storySegments, isVietnamese, playAudio, playTTSOffline]);
  if (isLoading || isImageLoading)
    return <LoadingScreen isLoaded={!isLoading && !isImageLoading} />;

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
              {storySegments && (
                <StoryPage
                  segment={storySegments[currentPage]}
                  isVietnamese={isVietnamese}
                  total={storySegments?.length || 0}
                />
              )}
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
                icon={<Feather name="settings" size={20} color="white" />}
                onPress={() => console.log("Settings")}
                color="#6B7280"
                size={40}
                shadowColor="#374151"
              />
            </HStack>

            {/* Next Button */}
            <ControlButton
              icon={<Feather name="chevron-right" size={24} color="white" />}
              onPress={handleNextPage}
              disabled={currentPage === storySegments.length - 1}
            />
          </HStack>
        </VStack>
      </SafeAreaView>
    </View>
  );
}
