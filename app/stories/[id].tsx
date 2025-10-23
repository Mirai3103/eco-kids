import { Feather, FontAwesome6, Ionicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  StatusBar,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
// GlueStack UI Components
import LoadingScreen from "@/components/LoadingScreen";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import useOfflineStory from "@/lib/offline";
import { getStoryByIdQueryOptions } from "@/lib/queries/story.query";
import { supabase } from "@/lib/supabase";
import theme from "@/lib/theme";
import { useUserStore } from "@/stores/user.store";
import { useQuery } from "@tanstack/react-query";
import * as Network from "expo-network";

const { width: screenWidth } = Dimensions.get("window");

// Sample story data (would come from API based on ID)

// Circular Progress Component
const CircularProgress = ({
  progress,
  size = 90,
}: {
  progress: number;
  size?: number;
}) => {
  const AnimatedCircle = Animated.createAnimatedComponent(Circle);
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  return (
    <View style={{ width: size, height: size, position: "absolute" }}>
      <Svg width={size} height={size}>
        {/* Background Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress Circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="white"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
    </View>
  );
};

// Enhanced 3D Button Component
const Action3DButton = ({
  icon,
  label,
  onPress,
  color = "#22C55E",
  darkerColor = "#16A34A",
  progress = 0,
  showProgress = false,
  disabled = false,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  color?: string;
  darkerColor?: string;
  progress?: number;
  showProgress?: boolean;
  disabled?: boolean;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shadowAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    if (disabled) return;
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }),
      Animated.timing(shadowAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(shadowAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const shadowOpacity = shadowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.1],
  });

  const shadowOffset = shadowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [8, 4],
  });

  const buttonStyle = {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    position: "relative" as const,
    // 3D Effect with gradient-like shadows
    shadowColor: color,
    shadowOffset: { width: 0, height: shadowOffset },
    shadowOpacity: disabled ? 0.1 : shadowOpacity,
    shadowRadius: 15,
    elevation: disabled ? 5 : 12,
    // Gradient effect simulation
    backgroundColor: color,
    borderWidth: 2,
    borderColor: darkerColor,
    borderBottomWidth: 6,
    borderBottomColor: darkerColor,
    opacity: disabled ? 0.6 : 1,
  };

  return (
    <VStack space="md" className="items-center">
      <Animated.View
        style={[
          buttonStyle,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Pressable
          // onPressIn={handlePressIn}
          // onPressOut={handlePressOut}
          onPress={disabled ? undefined : onPress}
          disabled={disabled}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 45,
            justifyContent: "center",
            alignItems: "center",
            // Inner gradient effect
            backgroundColor: color,
            position: "relative",
          }}
        >
          {/* Progress Circle for Read Button */}
          {showProgress && <CircularProgress progress={progress} size={90} />}

          {/* Icon */}
          <View style={{ zIndex: 2 }}>{icon}</View>
        </Pressable>
      </Animated.View>

      {/* Label */}
      <Text
        className=" text-xl font-bold"
        style={{
          color: "#1B4B07",
          fontWeight: "600",
          textShadowColor: "rgba(0, 0, 0, 0.1)",
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 2,
          fontFamily: "Baloo2_700Bold",
          opacity: disabled ? 0.6 : 1,
        }}
      >
        {label}
      </Text>
    </VStack>
  );
};

// Tag Component
// const InfoTag = ({ tag }: { tag: (typeof storyData.tags)[0] }) => {
//   return (
//     <View
//       style={{
//         backgroundColor: tag.color,
//         borderRadius: 20,
//         paddingHorizontal: 12,
//         paddingVertical: 6,
//         marginHorizontal: 4,
//         marginVertical: 4,
//         shadowColor: "#000",
//         shadowOffset: { width: 0, height: 1 },
//         shadowOpacity: 0.1,
//         shadowRadius: 2,
//         elevation: 1,
//       }}
//     >
//       <HStack space="xs" className="items-center">
//         <Text style={{ fontSize: 12 }}>{tag.icon}</Text>
//         <Text
//           style={{
//             color: "#1B4B07",
//             fontSize: 12,
//             fontFamily: "NunitoSans_600SemiBold"
//           }}
//         >
//           {tag.label}
//         </Text>
//       </HStack>
//     </View>
//   );
// };

// Spinning Loader Component
const SpinningLoader = () => {
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View style={{ transform: [{ rotate: spin }] }}>
      <Feather name="loader" size={32} color="white" />
    </Animated.View>
  );
};
// Main Content Component with entrance animations
const StoryContent = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const [readProgress, setReadProgress] = useState(65); // Example progress
  const params = useLocalSearchParams();
  const storyId = params.id as string;
  const { data: story, isLoading } = useQuery(
    getStoryByIdQueryOptions(storyId)
  );
  const networkState = Network.useNetworkState();

  const { status, startDownload } = useOfflineStory(storyId);
  useEffect(() => {
    Animated.stagger(200, [
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const handleReadPress = () => {
    if (!networkState.isConnected && status !== "completed") {
      return;
    }
    router.push(`/stories/${storyId}/read`);
  };

  const handleQuizPress = () => {
    if (!networkState.isConnected) {
      return;
    }
    router.push(`/stories/${storyId}/quiz`);
  };

  const handleDownloadPress = () => {
    startDownload();
  };

  if (isLoading)
    return (
      <LoadingScreen
        message="Đang tải thông tin truyện..."
        isLoaded={!isLoading}
      />
    );
  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <VStack space="2xl" className="px-6">
        {/* Image Block */}
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 24,
            padding: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 16,
            elevation: 10,
            width: screenWidth - 32,
          }}
        >
          <ExpoImage
            source={{
              uri: story!.cover_image_url!,
            }}
            style={{
              width: "100%",
              height: 240,
              borderRadius: 16,
            }}
            alt="Story Cover"
            contentFit="cover"
            cachePolicy={"memory-disk"}
          />
        </View>

        {/* Info Block */}
        <VStack space="lg" className="items-center">
          {/* Story Title */}
          <Text
            size="3xl"
            style={{
              color: "#1B4B07",
              textAlign: "center",
              lineHeight: 42,
              marginBottom: 8,
              fontSize: 36,
            }}
            className="font-heading"
          >
            {story?.title}
          </Text>

          {/* Story Synopsis */}
          <Text
            style={{
              color: "#4A5568",
              fontSize: 16,
              lineHeight: 24,
              textAlign: "center",
              marginBottom: 0,
              paddingHorizontal: 8,
            }}
            className="font-body"
          >
            {story?.description}
          </Text>

          {/* Info Tags */}
          {/* <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
              maxWidth: screenWidth - 40,
            }}
          >
            {story?.tags.map((tag, index) => (
              <InfoTag key={index} tag={tag} />
            ))}
          </View> */}
        </VStack>

        {/* Enhanced 3D Action Buttons */}
        <View style={{ marginTop: 5 }}>
          <HStack space="lg" className="w-full justify-center items-center">
            <Action3DButton
              icon={<Feather name="book-open" size={36} color="white" />}
              label={networkState.isConnected ? "Đọc" : "Đọc offline"}
              onPress={handleReadPress}
              color={theme.palette.primary[400]}
              darkerColor={theme.palette.primary[500]}
              progress={readProgress}
              showProgress={true}
              disabled={!networkState.isConnected && status !== "completed"}
            />

            {status === "idle" && (
              <Action3DButton
                icon={<Feather name="download" size={32} color="white" />}
                label="Tải xuống"
                onPress={handleDownloadPress}
                color="#3B82F6"
                darkerColor="#2563EB"
                disabled={!networkState.isConnected}
              />
            )}

            {status === "downloading" && (
              <Action3DButton
                icon={<SpinningLoader />}
                label="Đang tải..."
                onPress={() => {}}
                color="#9CA3AF"
                darkerColor="#6B7280"
                disabled={true}
              />
            )}

            {status === "completed" && (
              <Action3DButton
                icon={<Feather name="check-circle" size={32} color="white" />}
                label="Đã tải"
                onPress={() => {}}
                color="#10B981"
                darkerColor="#059669"
                disabled={true}
              />
            )}

            {status === "error" && (
              <Action3DButton
                icon={<Feather name="alert-circle" size={32} color="white" />}
                label="Thử lại"
                onPress={handleDownloadPress}
                color="#EF4444"
                darkerColor="#DC2626"
                disabled={!networkState.isConnected}
              />
            )}

            <Action3DButton
              icon={<FontAwesome6 name="brain" size={32} color="white" />}
              label="Quiz"
              onPress={handleQuizPress}
              color={theme.palette.primary[300]}
              darkerColor={theme.palette.primary[400]}
              disabled={!networkState.isConnected}
            />
          </HStack>

          {/* Progress Text for Read Button */}
          {/* <View style={{ marginTop: 12, alignItems: 'center' }}>
            <Text 
              style={{ 
                color: '#6B7280', 
                fontSize: 14,
                fontWeight: '500'
              }}
            >
              Tiến độ đọc: {readProgress}%
            </Text>
          </View> */}
        </View>
      </VStack>
    </Animated.View>
  );
};

export default function StoryDetailsScreen() {
  const params = useLocalSearchParams();
  const storyId = params.id as string;
  const [isFavorite, setIsFavorite] = useState(false);
  React.useEffect(() => {
    async function checkFavorite() {
      const { data, error } = await supabase
        .from("favorite_stories")
        .select("*")
        .eq("story_id", storyId)
        .eq("user_id", user!.id)
        .single();
      if (data) {
        setIsFavorite(true);
      }
    }
    checkFavorite();
  }, [storyId]);

  const handleBack = () => {
    router.back();
  };
  const { user } = useUserStore();
  const handleFavoriteToggle = async () => {
    setIsFavorite(!isFavorite);
    const { data, error } = await supabase
      .from("favorite_stories")
      .select("*")
      .eq("story_id", storyId)
      .eq("user_id", user!.id)
      .single();
    if (data) {
      console.log("Deleted favorite story");
      await supabase
        .from("favorite_stories")
        .delete()
        .eq("story_id", storyId)
        .eq("user_id", user!.id);
    } else {
      await supabase.from("favorite_stories").insert({
        story_id: storyId,
        user_id: user!.id,
      });
    }
  };

  // In a real app, fetch story data based on storyId
  console.log("Story ID:", storyId);

  return (
    <View style={{ flex: 1, backgroundColor: "#F7F8FA" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F8FA" />

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

          <Heading
            size="lg"
            style={{ color: "#1B4B07", fontWeight: "bold" }}
          ></Heading>

          <Pressable
            onPress={handleFavoriteToggle}
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
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={20}
              color={isFavorite ? "#EF4444" : "#1B4B07"}
            />
          </Pressable>
        </HStack>

        {/* Main Content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 20,
            flexGrow: 1,
            paddingTop: 10,
          }}
        >
          <StoryContent />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
