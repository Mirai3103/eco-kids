import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
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

// GlueStack UI Components
import { StickyHeader } from "@/components/StickyHeader";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Image } from "@/components/ui/image";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const cardWidth = (screenWidth - 48) / 2; // 2 columns with padding

// Sample topic data - this would come from route params or API
const topicData = {
  id: "forest",
  name: "Rừng Cây",
  emoji: "🌳",
  color: "#399018",
  bgColor: "#E8F5E8",
};

// Sample stories for the topic
const stories = [
  {
    id: 1,
    title: "Chú gấu trong rừng",
    image: "🐻",
    bgColor: "#E8F5E8",
    height: 200,
    liked: false,
  },
  {
    id: 2,
    title: "Cây sồi cổ thụ",
    image: "🌲",
    bgColor: "#E3F2FD",
    height: 240,
    liked: true,
  },
  {
    id: 3,
    title: "Những chú chim nhỏ",
    image: "🐦",
    bgColor: "#FCE4EC",
    height: 180,
    liked: false,
  },
  {
    id: 4,
    title: "Khu rừng ma thuật",
    image: "🍄",
    bgColor: "#FFF3E0",
    height: 220,
    liked: false,
  },
  {
    id: 5,
    title: "Thỏ con và rừng",
    image: "🐰",
    bgColor: "#F3E5F5",
    height: 190,
    liked: true,
  },
  {
    id: 6,
    title: "Búp bê lá xanh",
    image: "🍃",
    bgColor: "#E8F5E8",
    height: 210,
    liked: false,
  },
  {
    id: 7,
    title: "Tổ chim trên cây",
    image: "🪺",
    bgColor: "#FFF8E1",
    height: 230,
    liked: false,
  },
  {
    id: 8,
    title: "Rừng bốn mùa",
    image: "🍂",
    bgColor: "#FFE8D6",
    height: 200,
    liked: true,
  },
];

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
  story: (typeof stories)[0];
  index: number;
  onPress: () => void;
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;
  const [liked, setLiked] = useState(story.liked);
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
                backgroundColor: story.bgColor,
                height: story.height,
                borderRadius: 12,
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
              }}
            >
              <Image
                source={require("@/assets/images/sample1.jpg")}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 12,
                }}
                alt="story-image"
              />

              {/* Play Button Overlay */}
              <View
                style={{
                  position: "absolute",
                  bottom: 12,
                  right: 12,
                  backgroundColor: "rgba(0, 0, 0, 0.7)",
                  borderRadius: 25,
                  width: 50,
                  height: 50,
                  justifyContent: "center",
                  alignItems: "center",
                }}
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
  data: typeof stories;
  onStoryPress: (story: (typeof stories)[0]) => void;
}) => {
  const [leftColumn, setLeftColumn] = useState<typeof stories>([]);
  const [rightColumn, setRightColumn] = useState<typeof stories>([]);

  useEffect(() => {
    // Distribute items across columns for masonry effect
    const left: typeof stories = [];
    const right: typeof stories = [];
    let leftHeight = 0;
    let rightHeight = 0;

    data.forEach((story) => {
      if (leftHeight <= rightHeight) {
        left.push(story);
        leftHeight += story.height + 32; // height + margin
      } else {
        right.push(story);
        rightHeight += story.height + 32;
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

  const handleStoryPress = (story: (typeof stories)[0]) => {
    console.log("Story pressed:", story.title);
    // Navigate to story detail screen
  };

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

      {/* Decorative Vines and Elements */}
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
          🌿
        </Text>
        <Text
          style={{
            fontSize: 16,
            transform: [{ rotate: "-10deg" }],
            marginTop: 80,
          }}
        >
          🌱
        </Text>
        <Text
          style={{
            fontSize: 18,
            transform: [{ rotate: "20deg" }],
            marginTop: 100,
          }}
        >
          🌿
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
          🌿
        </Text>
        <Text
          style={{
            fontSize: 14,
            transform: [{ rotate: "25deg" }],
            marginTop: 90,
          }}
        >
          🌱
        </Text>
        <Text
          style={{
            fontSize: 16,
            transform: [{ rotate: "-20deg" }],
            marginTop: 110,
          }}
        >
          🌿
        </Text>
      </View>

      {/* Bottom decorative elements */}
      <View style={{ position: "absolute", bottom: 100, left: 20, zIndex: 0}}>
        <Text style={{ fontSize: 16 }}>🌸</Text>
      </View>
      <View style={{ position: "absolute", bottom: 110, right: 40, zIndex: 0}}>
        <Text style={{ fontSize: 14 }}>🍄</Text>
      </View>

      <SafeAreaView className="flex-1">
        {/* Header */}
        <StickyHeader />

        {/* Story Grid */}
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120, paddingTop: 30 }}
        >
          <VStack>
            <HStack className="justify-between rounded-full items-center mb-4 px-4 py-2 bg-white/80 backdrop-blur-lg">
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
                <Text style={{ fontSize: 32, marginRight: 8 }}>
                  {topicData.emoji}
                </Text>
                <Heading
                  size="xl"
                  style={{ color: "#1B4B07", fontWeight: "bold" }}
                >
                  {topicData.name}
                </Heading>
              </HStack>

              <HStack style={{width:50}}></HStack>
            </HStack>
            <MasonryGrid data={stories} onStoryPress={handleStoryPress} />
          </VStack>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
