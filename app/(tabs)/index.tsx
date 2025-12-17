import { LinearGradient } from "expo-linear-gradient";
import React, { useRef } from "react";
import {
  Animated,
  ScrollView,
  StatusBar,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// GlueStack UI Components
import { Header } from "@/components/Header";
import { Center } from "@/components/ui/center";
import { HStack } from "@/components/ui/hstack";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import useSession from "@/hooks/useSession";
import { getAllRecommendedStoriesQueryOptions } from "@/lib/queries/story.query";
import { getAllTopicsQueryOptions } from "@/lib/queries/topic.query";
import { useReadStore } from "@/stores/read.store";
import { Story, Topic } from "@/types";
import * as Sentry from "@sentry/react-native";
import { useQuery } from "@tanstack/react-query";
import { Image as ExpoImage } from "expo-image";
import { SplashScreen, useRouter } from "expo-router";
// 3D Button Component
const Button3D = ({
  title,
  onPress,
  size = "large",
  color = "#2857E0",
  shadowColor = "#2857E0",
}: {
  title: string;
  onPress: () => void;
  size?: "small" | "large";
  color?: string;
  shadowColor?: string;
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

  const buttonHeight = size === "large" ? 44 : 28;
  const fontSize = size === "large" ? 18 : 14;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <View className="relative">
          {/* Shadow/Bottom layer */}
          <View
            style={{
              backgroundColor: shadowColor,
              height: buttonHeight,
              borderRadius: 16,
              position: "absolute",
              top: 5,
              left: 0,
              right: 0,
            }}
          />
          {/* Top layer */}
          <View
            style={{
              backgroundColor: color,
              height: buttonHeight,
              borderRadius: 16,
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: size === "large" ? 28 : 16,
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize,
                fontFamily: "Baloo2_700Bold",
              }}
            >
              {title}
            </Text>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
};

// Topic Island Component
const TopicIsland = ({
  topic,
  onPress,
}: {
  topic: Topic;
  onPress: () => void;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
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

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <View className="items-center mx-3">
          <HStack
            style={{
              backgroundColor: topic.meta_data.bgColor,
              borderColor: topic.meta_data.color,
              borderWidth: 3,
            }}
            className="w-20 h-20 rounded-full items-center justify-center mb-2 shadow-lg"
          >
            {/* <Text style={{ fontSize: 32 }} className="leading-loose">
                {topic.meta_data.icon}
              </Text> */}
            <ExpoImage
              cachePolicy={"memory-disk"}
              source={{ uri: topic.meta_data.icon }}
              style={{ width: 56, height: 56 }}
            />
          </HStack>
          <Text
            style={{
              color: "#1B4B07",
              fontSize: 15,
              fontFamily: "NunitoSans_600SemiBold",
            }}
            className="text-center"
          >
            {topic.name}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
};

// Story Card Component
const StoryCard = ({
  story,
  size = "small",
  withButton = false,
  onPress,
  width,
}: {
  story: Story;
  size?: "small" | "large";
  withButton?: boolean;
  onPress?: () => void;
  width?: number;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }),
      Animated.spring(rotateAnim, {
        toValue: size === "small" ? 2 : 0,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
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

  const cardWidth = width || (size === "large" ? 300 : 140);
  const cardHeight = size === "large" ? 300 : 160;

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "2deg"],
  });

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }, { rotate }],
          width: cardWidth,
          marginRight: size === "small" ? 12 : 0,
        }}
      >
        <View
          style={{
            backgroundColor: "#CAFEC3",
            borderRadius: 20,
            padding: 16,
            height: cardHeight,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <Center className="flex-1">
            <ExpoImage
              source={{ uri: story.cover_image_url! }}
              cachePolicy={"memory-disk"}
              alt="story-image"
              style={{ width: "100%", height: "100%", borderRadius: 20 }}
            />
          </Center>
          <Text
            style={{
              color: "#1B4B07",
              fontSize: size === "large" ? 18 : 14,
              textAlign: "center",
              marginTop: 12,
              fontFamily: "NunitoSans_600SemiBold",
            }}
          >
            {story.title}
          </Text>
          {withButton && (
            <Center className="mt-4">
              <Button3D
                title="Bắt đầu đọc"
                onPress={() => console.log("Start reading")}
                color="#399918"
                shadowColor="#2a800d"
              />
            </Center>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
};

export default function EcoKidsHomeScreen() {
  const router = useRouter();
  const session = useSession();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const isLandscape = screenWidth > screenHeight;
  
  const {
    data: topics = [],
    isLoading,
    error,
  } = useQuery(getAllTopicsQueryOptions());
  const { lastReadStoryId } = useReadStore();
  const {
    data: stories = [],
    isLoading: isStoriesLoading,
    error: storiesError,
  } = useQuery(
    getAllRecommendedStoriesQueryOptions(
      session.session?.user?.id,
      lastReadStoryId || undefined,
      5
    )
  );
  React.useEffect(() => {
    Sentry.captureException(storiesError);
  }, [error]);

  React.useEffect(() => {
    Sentry.captureMessage("Home screen loaded" + JSON.stringify(stories)+(isLoading ? "loading" : "loaded"));
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  return (
    <View className="flex-1">
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
        <Header />

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          <VStack className="mt-6">
            <Text
              style={{
                color: "#1B4B07",
                fontSize: 24,
                fontWeight: "600",
                marginLeft: 16,
                marginBottom: 12,
                paddingTop: 2,
              }}
              className="font-heading"
            >
              Chủ đề có thể bé thích
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
              className="font-baloo-regular"
            >
              {topics?.map((topic) => (
                <TopicIsland
                  key={topic.id}
                  topic={topic as Topic}
                  onPress={() => {
                    router.push(`/topics/${topic.id}`);
                  }}
                />
              ))}
            </ScrollView>
          </VStack>

          <VStack className="mt-8 px-4 font-baloo-regular" space="lg">
            <Text
              style={{
                color: "#1B4B07",
                fontSize: 24,
                fontWeight: "600",
                paddingTop: 2,
                marginBottom: 12,
              }}
              className="font-heading"
            >
              Đề xuất cho bé
            </Text>
            {isLandscape ? (
              // Layout 2 cột cho màn hình ngang
              <View>
                {Array.from({ length: Math.ceil(stories.length / 2) }).map(
                  (_, rowIndex) => (
                    <HStack key={rowIndex} space="md" className="mb-4">
                      {stories
                        .slice(rowIndex * 2, rowIndex * 2 + 2)
                        .map((story) => (
                          <View key={story.id} style={{ flex: 1 }}>
                            <StoryCard
                              withButton
                              story={story}
                              size="large"
                              width={(screenWidth - 48) / 2}
                              onPress={() => router.push(`/stories/${story.id}`)}
                            />
                          </View>
                        ))}
                    </HStack>
                  )
                )}
              </View>
            ) : (
              // Layout 1 cột cho màn hình dọc
              <>
                {stories.map((story) => (
                  <StoryCard
                    key={story.id}
                    withButton
                    story={story}
                    size="large"
                    width={screenWidth - 32}
                    onPress={() => router.push(`/stories/${story.id}`)}
                  />
                ))}
              </>
            )}
            <Center className="mt-8">
              <Button3D
                title="Khám phá thêm"
                onPress={() => router.push("/search")}
                color="#399918"
                shadowColor="#2a800d"
              />
            </Center>
          </VStack>

          {/* <VStack className="mt-8">
            <Text
              style={{
                color: "#1B4B07",
                fontSize: 18,
                fontWeight: "600",
                marginLeft: 16,
                marginBottom: 12,
              }}
            >
              Truyện mới nhất nè
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
              className="py-2"
            >
              {newStories.map((story) => (
                <StoryCard key={story.id} story={story} size="small" />
              ))}
            </ScrollView>
          </VStack>

          <VStack className="mt-6">
            <Text
              style={{
                color: "#1B4B07",
                fontSize: 18,
                fontWeight: "600",
                marginLeft: 16,
                marginBottom: 12,
              }}
            >
              Đọc lại nhé!
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
              className="py-2"
            >
              {recentStories.map((story) => (
                <StoryCard key={story.id} story={story} size="small" />
              ))}
            </ScrollView>
          </VStack> */}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
