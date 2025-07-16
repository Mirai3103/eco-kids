import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  StatusBar,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// GlueStack UI Components
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { getAllStoriesQueryByTopicIdOptions } from "@/lib/queries/story.query";
import { getTopicByIdQueryOptions } from "@/lib/queries/topic.query";
import { Story } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const cardWidth = (screenWidth - 48) / 2; // 2 columns with padding

// Sample topic data - this would come from route params or API

// Sample stories for the topic

// Generate random tilt angles for Polaroid effect
const getRandomTilt = () => {
  const tilts = [-3, -2, -1, 0, 1, 2, 3];
  return tilts[Math.floor(Math.random() * tilts.length)];
};

// Story Card Component with Polaroid style
const StoryCard = ({
  story,
  index,
  onPress,
}: {
  story: Story
  index: number;
  onPress: () => void;
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;
  const [liked, setLiked] = useState(false);
  const [tiltAngle] = useState(getRandomTilt());

  useEffect(() => {
    // Staggered entrance animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 100,
      tension: 60,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(pressAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleLikePress = () => {
    setLiked(!liked);
    // Bounce animation for heart
    Animated.sequence([
      Animated.spring(pressAnim, {
        toValue: 1.1,
        useNativeDriver: true,
      }),
      Animated.spring(pressAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  };
  console.log(story.cover_image_url);

  return (
    <Animated.View
      style={{
        transform: [
          { scale: scaleAnim },
          { scale: pressAnim },
          { rotate: `${tiltAngle}deg` },
        ],
        marginBottom: 20,
        marginHorizontal: 4,
      }}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 16,
            padding: 12,
            width: cardWidth,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          {/* Story Image with Play Button Overlay */}
          <View style={{ position: "relative" }}>
            <View
              style={{
                backgroundColor: "red",
                height: 200,
                borderRadius: 12,
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
              }}
            >
              <Image
                source={{uri: story.cover_image_url || "https://picsum.photos/200/300"}}
                className="w-full h-full rounded-lg"
                contentFit="cover"
                alt="story-image"
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 12,
                }}
                onError={(error) => {
                  console.log(error);
                }}
                cachePolicy="memory-disk"
              />

              {/* Play Button Overlay */}
              <View
                style={{
                  position: "absolute",
                  bottom: 12,
                  right: 12,
                  borderRadius: 25,
                  width: 50,
                  height: 50,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                className="bg-green-400"
              >
                <Ionicons name="play" size={24} color="white" />
              </View>

              {/* Heart Icon */}
              <Pressable
                onPress={handleLikePress}
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  borderRadius: 20,
                  width: 40,
                  height: 40,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons
                  name={liked ? "heart" : "heart-outline"}
                  size={20}
                  color={liked ? "#D72654" : "#666"}
                />
              </Pressable>
            </View>
          </View>

          {/* Story Title */}
          <Text
            style={{
              color: "#1B4B07",
              fontSize: 14,
              fontWeight: "600",
              textAlign: "center",
              marginTop: 12,
              lineHeight: 18,
            }}
            className="font-body"
          >
            {story.title}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
};

// Masonry Grid Component
const MasonryGrid = ({
  data,
  onStoryPress,
}: {
  data: Story[];
  onStoryPress: (story: Story) => void;
}) => {
  const [leftColumn, setLeftColumn] = useState<Story[]>([]);
  const [rightColumn, setRightColumn] = useState<Story[]>([]);

  useEffect(() => {
    // Distribute items across columns for masonry effect
    const left: Story[] = [];
    const right: Story[] = [];
    let leftHeight = 0;
    let rightHeight = 0;

    data.forEach((story) => {
      if (leftHeight <= rightHeight) {
        left.push(story);
        leftHeight += 200 + 32; // height + margin
      } else {
        right.push(story);
        rightHeight += 200 + 32;
      }
    });

    setLeftColumn(left);
    setRightColumn(right);
  }, [data]);

  return (
    <HStack className="px-4 items-start" space="sm">
      <VStack className="flex-1">
        {leftColumn.map((story, index) => (
          <StoryCard
            key={story.id}
            story={story}
            index={index * 2}
            onPress={() => onStoryPress(story)}
          />
        ))}
      </VStack>
      <VStack className="flex-1">
        {rightColumn.map((story, index) => (
          <StoryCard
            key={story.id}
            story={story}
            index={index * 2 + 1}
            onPress={() => onStoryPress(story)}
          />
        ))}
      </VStack>
    </HStack>
  );
};
export default function TopicStoryScreen() {
  const handleBack = () => {
    router.back();
  };

  const handleStoryPress = (story: Story) => {
    console.log("Story pressed:", story.title);
    // Navigate to story detail screen
  };
  
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: topic } = useQuery(getTopicByIdQueryOptions(id));
  const { data: stories } = useQuery(getAllStoriesQueryByTopicIdOptions(id));
  const decorationEmojis = topic?.meta_data.decorationEmojis || [];
  const randomDecorationEmoji = useCallback(() => {
    return decorationEmojis[
      Math.floor(Math.random() * decorationEmojis.length)
    ];
  }, [decorationEmojis]);

  return (
    <View className="flex-1">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Background Gradient */}
      <LinearGradient
        colors={[
          topic?.meta_data.bgColor || "#EEF0FE",
          topic?.meta_data.color || "#CAFEC3",
        ]}
        style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      {/* Decorative elements - giữ nguyên */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: 30,
          zIndex: 0,
        }}
      >
        <Text
          style={{
            fontSize: 20,
            transform: [{ rotate: "15deg" }],
            marginTop: 100,
          }}
        >
          {randomDecorationEmoji()}
        </Text>
        <Text
          style={{
            fontSize: 16,
            transform: [{ rotate: "-10deg" }],
            marginTop: 80,
          }}
        >
          {randomDecorationEmoji()}
        </Text>
        <Text
          style={{
            fontSize: 18,
            transform: [{ rotate: "20deg" }],
            marginTop: 100,
          }}
        >
          {randomDecorationEmoji()}
        </Text>
      </View>

      <View
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: 30,
          zIndex: 0,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            transform: [{ rotate: "-15deg" }],
            marginTop: 120,
          }}
        >
          {randomDecorationEmoji()}
        </Text>
        <Text
          style={{
            fontSize: 14,
            transform: [{ rotate: "25deg" }],
            marginTop: 90,
          }}
        >
          {randomDecorationEmoji()}
        </Text>
        <Text
          style={{
            fontSize: 16,
            transform: [{ rotate: "-20deg" }],
            marginTop: 110,
          }}
        >
          {randomDecorationEmoji()}
        </Text>
      </View>

      {/* Bottom decorative elements */}
      <View style={{ position: "absolute", bottom: 100, left: 20, zIndex: 0 }}>
        <Text style={{ fontSize: 16 }}>{randomDecorationEmoji()}</Text>
      </View>
      <View style={{ position: "absolute", bottom: 110, right: 40, zIndex: 0 }}>
        <Text style={{ fontSize: 14 }}>{randomDecorationEmoji()}</Text>
      </View>

      <SafeAreaView className="flex-1">
        {/* Sticky Title - Cố định ở top */}
        <VStack 
          style={{ 
            zIndex: 10, 
            backgroundColor: 'transparent',
            paddingHorizontal: 16 
          }}
        >
          <HStack className="justify-between rounded-full items-center mb-4 px-2 mt-6 py-0 bg-white/80 backdrop-blur-lg">
            <Pressable
              onPress={handleBack}
              style={{
                backgroundColor: "white",
                borderRadius: 25,
                width: 50,
                height: 50,
                justifyContent: "center",
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Ionicons name="arrow-back" size={24} color="#1B4B07" />
            </Pressable>

            <HStack className="items-center">
              <Text
                style={{ fontSize: 32, marginRight: 8 }}
                className="leading-loose"
              >
                {topic?.meta_data?.icon}
              </Text>
              <Heading
                size="xl"
                style={{ color: "#1B4B07", fontWeight: "bold" }}
              >
                {topic?.name}
              </Heading>
            </HStack>

            <HStack style={{ width: 50 }}></HStack>
          </HStack>
        </VStack>

        {/* ScrollView với Header và MasonryGrid */}
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          <VStack>
            <MasonryGrid data={stories || []} onStoryPress={handleStoryPress} />
          </VStack>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}