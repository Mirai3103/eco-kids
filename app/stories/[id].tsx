import { Feather, FontAwesome6, Ionicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
// GlueStack UI Components
import LoadingScreen from "@/components/LoadingScreen";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import useSession from "@/hooks/useSession";
import { recalculateVector } from "@/lib/egde";
import useOfflineStory from "@/lib/offline";
import { getStoryByIdQueryOptions } from "@/lib/queries/story.query";
import { supabase } from "@/lib/supabase";
import theme from "@/lib/theme";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as Network from "expo-network";

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

// Enhanced 3D Button Component with Floating Animation
const Action3DButton = ({
  icon,
  label,
  onPress,
  color = "#22C55E",
  darkerColor = "#16A34A",
  progress = 0,
  showProgress = false,
  disabled = false,
  delay = 0,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  color?: string;
  darkerColor?: string;
  progress?: number;
  showProgress?: boolean;
  disabled?: boolean;
  delay?: number;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Floating animation
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 2000,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const handlePressIn = () => {
    if (disabled) return;
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.9,
        useNativeDriver: true,
      }),
      Animated.spring(rotateAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(rotateAnim, {
        toValue: 0,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "5deg"],
  });

  return (
    <VStack space="md" className="items-center">
      <Animated.View
        style={{
          transform: [
            { translateY: floatAnim },
            { scale: scaleAnim },
            { rotate },
          ],
        }}
      >
        <View style={{ position: "relative" }}>
          {/* Shadow/Bottom layer */}
          <View
            style={{
              position: "absolute",
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: darkerColor,
              top: 6,
              left: 0,
              opacity: disabled ? 0.4 : 0.8,
            }}
          />

          {/* Main Button */}
          <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={disabled ? undefined : onPress}
            disabled={disabled}
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: color,
              justifyContent: "center",
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: disabled ? 0.1 : 0.3,
              shadowRadius: 12,
              elevation: disabled ? 3 : 10,
              borderWidth: 3,
              borderColor: "#fff",
              opacity: disabled ? 0.6 : 1,
            }}
          >
            {/* Progress Circle for Read Button */}
            {showProgress && (
              <CircularProgress progress={progress} size={100} />
            )}

            {/* Icon */}
            <View style={{ zIndex: 2 }}>{icon}</View>
          </Pressable>
        </View>
      </Animated.View>

      {/* Label */}
      <Text
        style={{
          color: "#1B4B07",
          fontSize: 18,
          fontWeight: "600",
          textShadowColor: "rgba(255, 255, 255, 0.8)",
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 4,
          fontFamily: "Baloo2_700Bold",
          opacity: disabled ? 0.6 : 1,
        }}
      >
        {label}
      </Text>
    </VStack>
  );
};

// Info Tag Component
const InfoTag = ({
  icon,
  label,
  color = "#E8F5E8",
}: {
  icon: string;
  label: string;
  color?: string;
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
      }}
    >
      <View
        style={{
          backgroundColor: color,
          borderRadius: 16,
          paddingHorizontal: 14,
          paddingVertical: 8,
          marginHorizontal: 4,
          marginVertical: 4,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
          borderWidth: 2,
          borderColor: "#fff",
        }}
      >
        <HStack space="xs" className="items-center">
          <Text style={{ fontSize: 16 }}>{icon}</Text>
          <Text
            style={{
              color: "#1B4B07",
              fontSize: 14,
              fontFamily: "NunitoSans_700Bold",
            }}
          >
            {label}
          </Text>
        </HStack>
      </View>
    </Animated.View>
  );
};

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
// Decorative Circle Component
const DecorativeCircle = ({
  size,
  color,
  top,
  left,
  right,
  delay = 0,
}: {
  size: number;
  color: string;
  top?: number;
  left?: number;
  right?: number;
  delay?: number;
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // Floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        top,
        left,
        right,
        opacity: 0.15,
        transform: [{ scale: scaleAnim }, { translateY: floatAnim }],
      }}
    />
  );
};

// Gender Selection Modal Component
const GenderSelectionModal = ({
  visible,
  onClose,
  onSelectGender,
}: {
  visible: boolean;
  onClose: () => void;
  onSelectGender: (gender: "male" | "female") => void;
}) => {
  const [selectedGender, setSelectedGender] = useState<"male" | "female" | null>(null);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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

  const handleConfirm = () => {
    if (selectedGender) {
      onSelectGender(selectedGender);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable 
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={onClose}
      >
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
          }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "white",
              borderRadius: 24,
              padding: 32,
              width: 340,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 10,
            }}
          >
            {/* Close button */}
            <Pressable
              onPress={onClose}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: "#F3F4F6",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 10,
              }}
            >
              <Ionicons name="close" size={20} color="#6B7280" />
            </Pressable>

            {/* Title */}
            <Text
              style={{
                fontSize: 22,
                fontWeight: "bold",
                color: "#1B4B07",
                textAlign: "center",
                marginBottom: 32,
                fontFamily: "Baloo2_700Bold",
              }}
            >
              Bắt đầu với giọng đọc...
            </Text>

            {/* Gender Options */}
            <HStack space="md" className="justify-center mb-6">
              {/* Female Option */}
              <Pressable
                onPress={() => setSelectedGender("female")}
                style={{
                  width: 130,
                  padding: 16,
                  borderRadius: 16,
                  backgroundColor: selectedGender === "female" ? "#E8F5E8" : "#F9FAFB",
                  borderWidth: 3,
                  borderColor: selectedGender === "female" ? theme.palette.primary[400] : "#E5E7EB",
                  alignItems: "center",
                }}
              >
                <ExpoImage
                  source={require("@/assets/images/girl.png")}
                  style={{ width: 80, height: 80, marginBottom: 12 }}
                  contentFit="contain"
                />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#1B4B07",
                    fontFamily: "NunitoSans_700Bold",
                  }}
                >
                  Giọng nữ
                </Text>
              </Pressable>

              {/* Male Option */}
              <Pressable
                onPress={() => setSelectedGender("male")}
                style={{
                  width: 130,
                  padding: 16,
                  borderRadius: 16,
                  backgroundColor: selectedGender === "male" ? "#E8F5E8" : "#F9FAFB",
                  borderWidth: 3,
                  borderColor: selectedGender === "male" ? theme.palette.primary[400] : "#E5E7EB",
                  alignItems: "center",
                }}
              >
                <ExpoImage
                  source={require("@/assets/images/boy.png")}
                  style={{ width: 80, height: 80, marginBottom: 12 }}
                  contentFit="contain"
                />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#1B4B07",
                    fontFamily: "NunitoSans_700Bold",
                  }}
                >
                  Giọng nam
                </Text>
              </Pressable>
            </HStack>

            {/* Start Button */}
            <Pressable
              onPress={handleConfirm}
              disabled={!selectedGender}
              style={{
                backgroundColor: selectedGender ? theme.palette.primary[400] : "#D1D5DB",
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: selectedGender ? 0.2 : 0.1,
                shadowRadius: 8,
                elevation: selectedGender ? 4 : 2,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "white",
                  fontFamily: "Baloo2_700Bold",
                }}
              >
                Bắt đầu
              </Text>
            </Pressable>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

// Main Content Component with entrance animations
const StoryContent = () => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const isLandscape = screenWidth > screenHeight;
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const imageScaleAnim = useRef(new Animated.Value(0.8)).current;
  const [readProgress, setReadProgress] = useState(65); // Example progress
  const [showGenderModal, setShowGenderModal] = useState(false);
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
        Animated.spring(imageScaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const handleReadPress = () => {
    if (!networkState.isConnected && status !== "completed") {
      return;
    }
    setShowGenderModal(true);
  };

  const handleGenderSelect = (gender: "male" | "female") => {
    router.push(`/stories/${storyId}/read?gender=${gender}`);
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

  // Image Block Component
  const ImageBlock = (
    <Animated.View
      style={{
        transform: [{ scale: imageScaleAnim }],
        flex: isLandscape ? 1 : undefined,
      }}
    >
      <View
        style={{
          backgroundColor: "white",
          borderRadius: 24,
          padding: 12,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.25,
          shadowRadius: 20,
          elevation: 15,
          width: isLandscape ? "100%" : screenWidth - 48,
          alignSelf: "center",
        }}
      >
        <ExpoImage
          source={{
            uri: story!.cover_image_url!,
          }}
          style={{
            width: "100%",
            height: isLandscape ? 300 : 280,
            borderRadius: 16,
          }}
          alt="Story Cover"
          contentFit="cover"
          cachePolicy={"memory-disk"}
        />
      </View>
    </Animated.View>
  );

  // Content Block Component
  const ContentBlock = (
    <VStack 
      space="lg" 
      className="items-center" 
      style={{ 
        flex: isLandscape ? 1 : undefined,
        justifyContent: isLandscape ? "center" : undefined,
      }}
    >
      {/* Story Title */}
      <Text
        size="3xl"
        style={{
          color: "#1B4B07",
          textAlign: "center",
          lineHeight: isLandscape ? 36 : 44,
          marginBottom: 12,
          fontSize: isLandscape ? 28 : 32,
          textShadowColor: "rgba(255, 255, 255, 0.8)",
          textShadowOffset: { width: 0, height: 2 },
          textShadowRadius: 4,
          paddingHorizontal: 16,
        }}
        className="font-heading"
      >
        {story?.title}
      </Text>

      {/* Enhanced 3D Action Buttons */}
      <View style={{ marginTop: isLandscape ? 12 : 20 }}>
        <HStack 
          space={isLandscape ? "md" : "xl"} 
          className="w-full justify-start flex items-center "
          style={{ flexWrap: isLandscape ? "wrap" : "nowrap" }}
        >
          <Action3DButton
            icon={<Feather name="book-open" size={isLandscape ? 32 : 40} color="white" />}
            label={networkState.isConnected ? "Đọc" : "Đọc offline"}
            onPress={handleReadPress}
            color={theme.palette.primary[400]}
            darkerColor={theme.palette.primary[600]}
            progress={readProgress}
            showProgress={true}
            disabled={!networkState.isConnected && status !== "completed"}
            delay={0}
          />

          {status === "idle" && (
            <Action3DButton
              icon={<Feather name="download" size={isLandscape ? 28 : 36} color="white" />}
              label="Tải xuống"
              onPress={handleDownloadPress}
              color="#3B82F6"
              darkerColor="#1E40AF"
              disabled={!networkState.isConnected}
              delay={300}
            />
          )}

          {status === "downloading" && (
            <Action3DButton
              icon={<SpinningLoader />}
              label="Đang tải..."
              onPress={() => { }}
              color="#9CA3AF"
              darkerColor="#6B7280"
              disabled={true}
              delay={300}
            />
          )}

          {status === "completed" && (
            <Action3DButton
              icon={<Feather name="check-circle" size={isLandscape ? 28 : 36} color="white" />}
              label="Đã tải"
              onPress={() => router.push("/manage-downloads")}
              color="#10B981"
              darkerColor="#047857"
              disabled={false}
              delay={300}
            />
          )}

          {status === "error" && (
            <Action3DButton
              icon={<Feather name="alert-circle" size={isLandscape ? 28 : 36} color="white" />}
              label="Thử lại"
              onPress={handleDownloadPress}
              color="#EF4444"
              darkerColor="#B91C1C"
              disabled={!networkState.isConnected}
              delay={300}
            />
          )}

          <Action3DButton
            icon={<FontAwesome6 name="brain" size={isLandscape ? 28 : 36} color="white" />}
            label="Quiz"
            onPress={handleQuizPress}
            color={theme.palette.secondary[500]}
            darkerColor={theme.palette.secondary[700]}
            disabled={!networkState.isConnected}
            delay={600}
          />
        </HStack>
      </View>
    </VStack>
  );

  return (
    <>
      <GenderSelectionModal
        visible={showGenderModal}
        onClose={() => setShowGenderModal(false)}
        onSelectGender={handleGenderSelect}
      />
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        {isLandscape ? (
          // Layout 2 cột cho màn hình ngang
          <HStack space="xl" className="px-6" style={{ alignItems: "center" }}>
            {ImageBlock}
            {ContentBlock}
          </HStack>
        ) : (
          // Layout dọc cho màn hình dọc
          <VStack space="2xl" className="px-6">
            {ImageBlock}
            {ContentBlock}
          </VStack>
        )}
      </Animated.View>
    </>
  );
};

export default function StoryDetailsScreen() {
  const params = useLocalSearchParams();
  const storyId = params.id as string;
  const [isFavorite, setIsFavorite] = useState(false);
  const { session } = useSession();
  const userId = session?.user.id;
  async function checkFavorite() {

    const { data, error } = await supabase
      .from("favorite_stories")
      .select("*")
      .eq("story_id", storyId)
      .eq("user_id", userId!)
    if (data?.[0]) {
      setIsFavorite(true);
    } else {
      setIsFavorite(false);
    }
  }
  React.useEffect(() => {
    if (!userId || !storyId) return;
    checkFavorite();
  }, [storyId, userId]);

  const handleBack = () => {
    router.back();
  };

  const  queryClient = useQueryClient();
  const handleFavoriteToggle = async () => {
    setIsFavorite(!isFavorite);
    const { data: datas, error } = await supabase
      .from("favorite_stories")
      .select("*")
      .eq("story_id", storyId)
      .eq("user_id", userId!)
    const data = datas?.[0];
    if (data) {
      console.log("Deleted favorite story");
      await supabase
        .from("favorite_stories")
        .delete()
        .eq("story_id", storyId)
        .eq("user_id", userId!);
    } else {
       const { data: data, error: error } = await supabase.from("favorite_stories").insert({
          story_id: storyId,
          user_id: userId!,
          created_at: new Date().toISOString(),
        })
     
    }
    queryClient.invalidateQueries({ queryKey: ["favoriteStories"] });
    checkFavorite();
    recalculateVector({ userId: userId! });
  };

  // In a real app, fetch story data based on storyId
  console.log("Story ID:", storyId);

  return (
    <View style={{ flex: 1 }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Gradient Background */}
      <LinearGradient
        colors={["#C7F9CC", "#80ED99"]}
        style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      {/* Decorative Circles */}
      <DecorativeCircle
        size={120}
        color="#667FF3"
        top={50}
        right={-30}
        delay={200}
      />
      <DecorativeCircle
        size={80}
        color="#5EF02C"
        top={200}
        left={-20}
        delay={400}
      />
      <DecorativeCircle
        size={100}
        color="#2857E0"
        top={450}
        right={20}
        delay={600}
      />
      <DecorativeCircle
        size={60}
        color="#399918"
        top={600}
        left={30}
        delay={800}
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
