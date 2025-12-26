import { MaterialIcons } from "@expo/vector-icons";
import PageFlipper from "@laffy1309/react-native-page-flipper";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback } from "react";
import {
  Animated,
  Pressable,
  StatusBar,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Components
import LoadingScreen from "@/components/LoadingScreen";
import { StoryMenu } from "@/components/read-story/StoryMenu";
import { StoryPage } from "@/components/read-story/StoryPage";
import { Text } from "@/components/ui/text";

// Hooks
import { useStoryRead } from "@/hooks/useStoryRead";
import { supabase } from "@/lib/supabase";
import { useAudioTimeStore } from "@/stores/audio-time.store";

export default function ReadStoryScreen() {
  const params = useLocalSearchParams();
  const storyId = params.id as string;
  const selectedGender = params.gender as "male" | "female" | undefined;
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const {
    currentPage,
    isVietnamese,
    isAutoPlay,
    isMuted,
    isMenuVisible,
    isLoading,
    isImageLoading,
    storySegments,
    pageFlipperRef,
    menuAnimation,
    pulseAnimation,
    handleFlippedEnd,
    toggleMenu,
    closeMenu,
    toggleMute,
    handleRestart,
    handleMenuBack,
    handleToggleLanguage,
    handleToggleAutoPlay,
    isRecording,
    startRecognize,
    stopRecognize,

  } = useStoryRead(storyId, selectedGender);
  console.log("Render ReadStoryScreen")

  const renderStoryPage = useCallback(
    (segmentData: string) => {
      const segment = JSON.parse(segmentData);
      return <StoryPage segment={segment} isVietnamese={isVietnamese} gender={selectedGender!}  />;
    },
    [isVietnamese, selectedGender]
  );

  // Loading state


  const currentSegment = storySegments[currentPage];
  const setWords = useAudioTimeStore((state) => state.setWords);
  const setSegmentId = useAudioTimeStore((state) => state.setSegmentId);
  React.useEffect(() => {
    if (!selectedGender || !isVietnamese || !currentSegment) {
      return;
    }
    async function getTranscript() {
      const { data, error } = await supabase
        .from("audio_segments")
        .select("transcript")
        .eq("gender", selectedGender!)
        .eq("language", isVietnamese ? "vi" : "en")
        .eq("segment_id", currentSegment?.id)
        .maybeSingle();
      if (error) {
        console.log("error nene", error, currentSegment?.id, isVietnamese, selectedGender);
        return [];
      }
      const transcript = (data?.transcript as string) || "[]";
      setSegmentId(currentSegment?.id);
      console.log(currentSegment.vi_text, currentSegment.vi_text?.split(" ").length, "words");
      setWords(JSON.parse(transcript));
    }
    getTranscript();
    return () => {
      setSegmentId(""); 
    };  
  }, [selectedGender, isVietnamese, currentSegment, setWords, setSegmentId]);
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
      <StoryMenu
        isMenuVisible={isMenuVisible}
        closeMenu={closeMenu}
        menuAnimation={menuAnimation}
        handleMenuBack={handleMenuBack}
        handleToggleLanguage={handleToggleLanguage}
        isVietnamese={isVietnamese}
        toggleMute={toggleMute}
        isMuted={isMuted}
        handleToggleAutoPlay={handleToggleAutoPlay}
        isAutoPlay={isAutoPlay}
        handleRestart={handleRestart}
        onPressMic={startRecognize}
        isRecording={isRecording}
        stopRecording={stopRecognize}
      />
    </View>
  );
}
