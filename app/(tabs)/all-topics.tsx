import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// GlueStack UI Components
import { Header } from "@/components/Header";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { getAllTopicsQueryOptions } from "@/lib/queries/topic.query";
import { Topic } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";

const { width: screenWidth } = Dimensions.get("window");

// Sample topics data

// 3D Action Button Component
const ActionButton = ({
  color,
  onPress,
}: {
  color: string;
  onPress: () => void;
}) => {
  const pressAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(pressAnim, {
      toValue: 0.9,
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

  // Calculate darker shade for 3D effect
  const darkerColor =
    color === "#2196F3"
      ? "#1976D2"
      : color === "#4CAF50"
        ? "#388E3C"
        : color === "#FF9800"
          ? "#F57C00"
          : color === "#E91E63"
            ? "#C2185B"
            : color === "#FFC107"
              ? "#F57F17"
              : color === "#9C27B0"
                ? "#7B1FA2"
                : color === "#009688"
                  ? "#00796B"
                  : "#303F9F"; // default for energy

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={{ transform: [{ scale: pressAnim }] }}>
        <View style={{ position: "relative" }}>
          {/* Shadow/Bottom layer */}
          <View
            style={{
              backgroundColor: darkerColor,
              width: 56,
              height: 56,
              borderRadius: 28,
              position: "absolute",
              top: 4,
              left: 0,
            }}
          />
          {/* Top layer */}
          <View
            style={{
              backgroundColor: color,
              width: 56,
              height: 56,
              borderRadius: 28,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="chevron-forward" size={24} color="white" />
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
};

// Topic Card Component
const TopicCard = ({
  topic,
  index,
  onPress,
}: {
  topic: Topic;
  index: number;
  onPress: () => void;
}) => {
  const translateY = useRef(new Animated.Value(50)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Staggered entrance animation
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 600,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 600,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
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
    <Animated.View
      style={{
        opacity,
        transform: [{ translateY }, { scale: scaleAnim }],
        marginBottom: 16,
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
            borderRadius: 20,
            marginHorizontal: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 8,
            overflow: "hidden",
          }}
        >
          <HStack className="items-center">
            {/* Left Part - Colored section with illustration */}
            <HStack
              style={{
                backgroundColor: topic.meta_data.bgColor,
                height: 120,
                justifyContent: "flex-start",
                alignItems: "center",
                position: "relative",
                width: "100%",
              }}
            >
              {/* Large 3D-style illustration */}
              <HStack
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 2, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  height: "100%",
                }}
                className="items-center"
              >
                <Text
                  style={{ fontSize: 52 }}
                  className="pl-2 leading-loose font-heading"
                >
                  {topic.meta_data.icon}
                </Text>
              </HStack>
              <HStack
                style={{
                  flex: 1,
                  paddingHorizontal: 20,
                  paddingVertical: 24,
                  justifyContent: "space-between",
                  minHeight: 120,
                }}
              >
                <VStack space="xs" className="flex-1">
                  <Heading
                    size="lg"
                    style={{
                      color: "#1B4B07",
                      fontWeight: "bold",
                      marginBottom: 4,
                    }}
                  >
                    {topic.name}
                  </Heading>
                  <Text
                    style={{
                      color: "#666",
                      fontSize: 14,
                      fontWeight: "500",
                    }}
                    className="pr-4"
                  >
                    {topic.description}
                  </Text>
                </VStack>

                {/* Action Button positioned on the right */}
                <HStack className="flex-0 justify-end items-center">
                  <ActionButton
                    color={topic.meta_data.color}
                    onPress={() => onPress()}
                  />
                </HStack>
              </HStack>
            </HStack>

            {/* Right Part - White section with text and button */}
          </HStack>
        </View>
      </Pressable>
    </Animated.View>
  );
};

export default function AllTopicsScreen() {
  const handleBack = () => {
    router.back();
  };
  const {
    data: topics = [],
    isLoading,
    error,
  } = useQuery(getAllTopicsQueryOptions());
  const router = useRouter();
  const handleTopicPress = (topic: Topic) => {
    console.log("Topic pressed:", topic.name);
    router.push(`/topics/${topic.id}`);
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#EEF0FE", "#CAFEC3"]}
        style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      <SafeAreaView className="flex-1 pb-16">
        {/* Header */}
        <Header />

        {/* Topics List */}
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 40,
            marginTop: 30,
          }}
        >
          {topics?.map((topic, index) => (
            <TopicCard
              key={topic.id}
              topic={topic as Topic}
              index={index}
              onPress={() => handleTopicPress(topic)}
            />
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
