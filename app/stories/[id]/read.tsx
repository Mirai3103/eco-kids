import { FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import PageFlipper from "@laffy1309/react-native-page-flipper";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useCallback, useRef } from "react";
import {
  Animated,
  Modal,
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
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { useStoryRead } from "@/hooks/useStoryRead";
import { supabase } from "@/lib/supabase";
import { useAudioTimeStore } from "@/stores/audio-time.store";
import { Ionicons } from "@expo/vector-icons";

// Completion Modal Component
const CompletionModal = ({
  visible,
  onQuiz,
  onStay,
}: {
  visible: boolean;
  onQuiz: () => void;
  onStay: () => void;
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible]);

  const Action3DButton = ({
    icon,
    label,
    onPress,
    color,
    darkerColor,
  }: {
    icon: React.ReactNode;
    label: string;
    onPress: () => void;
    color: string;
    darkerColor: string;
  }) => {
    const buttonScale = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      Animated.spring(buttonScale, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(buttonScale, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start();
    };

    const buttonSize = 100;
    const borderRadius = buttonSize / 2;

    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <VStack space="sm" className="items-center">
            {/* Button Container with 3D effect */}
            <View style={{ position: "relative" }}>
              {/* Shadow/Bottom layer */}
              <View
                style={{
                  backgroundColor: darkerColor,
                  width: buttonSize,
                  height: buttonSize,
                  borderRadius,
                  position: "absolute",
                  top: 5,
                  left: 0,
                }}
              />
              {/* Top layer */}
              <View
                style={{
                  backgroundColor: color,
                  width: buttonSize,
                  height: buttonSize,
                  borderRadius,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {icon}
              </View>
            </View>

            {/* Label */}
            <Text
              style={{
                color: "#1B4B07",
                fontSize: 18,
                fontFamily: "Baloo2_700Bold",
                textAlign: "center",
              }}
            >
              {label}
            </Text>
          </VStack>
        </Animated.View>
      </Pressable>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <View
            style={{
              width: 340,
              borderRadius: 30,
              overflow: "hidden",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 15,
            }}
          >
            {/* Background gradient */}
            <LinearGradient
              colors={["#FFFFFF", "#F0F9FF"]}
              style={{ padding: 32 }}
            >
              <VStack space="2xl" className="items-center">
                {/* Celebration Animation */}
                <View
                  style={{
                    width: 150,
                    height: 150,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <LottieView
                    source={require("@/assets/congrats.json")}
                    autoPlay
                    loop
                    style={{
                      width: "100%",
                      height: "100%",
                    }}
                  />
                </View>

                {/* Title */}
                <Text
                  style={{
                    fontSize: 28,
                    fontWeight: "bold",
                    color: "#1B4B07",
                    textAlign: "center",
                    fontFamily: "Baloo2_700Bold",
                    lineHeight: 36,
                  }}
                >
                  Đã đọc xong!
                </Text>

                {/* Action Buttons */}
                <HStack space="xl" className="justify-center mt-4">
                  <Action3DButton
                    icon={
                      <FontAwesome6 name="brain" size={40} color="white" />
                    }
                    label="Quiz"
                    onPress={onQuiz}
                    color="#F59E0B"
                    darkerColor="#D97706"
                  />

                  <Action3DButton
                    icon={<Ionicons name="refresh" size={40} color="white" />}
                    label="Đọc lại"
                    onPress={onStay}
                    color="#22C55E"
                    darkerColor="#16A34A"
                  />
                </HStack>
              </VStack>
            </LinearGradient>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default function ReadStoryScreen() {
  const params = useLocalSearchParams();
  const storyId = params.id as string;
  const selectedGender = params.gender as "male" | "female" | undefined;
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const router = useRouter();

  const {
    currentPage,
    isVietnamese,
    isAutoPlay,
    isMuted,
    isMenuVisible,
    isCompletionModalVisible,
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
    closeCompletionModal,
  } = useStoryRead(storyId, selectedGender);
  console.log("Render ReadStoryScreen")
  
  const handleQuiz = () => {
    closeCompletionModal();
    router.push(`/stories/${storyId}/quiz`);
  };

  const handleStay = () => {
    closeCompletionModal();
    handleRestart();
  };

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

      {/* Completion Modal */}
      <CompletionModal
        visible={isCompletionModalVisible}
        onQuiz={handleQuiz}
        onStay={handleStay}
      />
    </View>
  );
}
