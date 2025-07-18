import { Feather, FontAwesome6, Ionicons, } from "@expo/vector-icons";
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
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { getStoryByIdQueryOptions } from "@/lib/queries/story.query";
import { useQuery } from "@tanstack/react-query";

const { width: screenWidth } = Dimensions.get("window");

// Sample story data (would come from API based on ID)
const storyData = {
  id: "1",
  title: "Cuộc phiêu lưu của chú ong nhỏ",
  synopsis:
    "Hãy cùng chú ong nhỏ khám phá khu vườn đầy màu sắc và học cách làm mật ngọt ngào. Một câu chuyện tuyệt vời về sự chăm chỉ và tình yêu thiên nhiên.",
  image: require("@/assets/images/sample1.jpg"),
  author: "Huu Hoang",
  topic: "Thiên nhiên",
  length: "8 phút",
  difficulty: "Dễ",
  tags: [
    { icon: "✍️", label: "Tác giả: Huu Hoang", color: "#E3F2FD" },
    { icon: "🌳", label: "Chủ đề: Thiên nhiên", color: "#E8F5E8" },
  ],
};

// Circular Progress Component
const CircularProgress = ({ progress, size = 90 }: { progress: number; size?: number }) => {
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
    <View style={{ width: size, height: size, position: 'absolute' }}>
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
  isPrimary = false,
  progress = 0,
  showProgress = false 
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  isPrimary?: boolean;
  progress?: number;
  showProgress?: boolean;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shadowAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
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
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative' as const,
    // 3D Effect with gradient-like shadows
    shadowColor: isPrimary ? '#22C55E' : '#1B4B07',
    shadowOffset: { width: 0, height: shadowOffset },
    shadowOpacity,
    shadowRadius: 15,
    elevation: 12,
    // Gradient effect simulation
    backgroundColor: isPrimary ? '#22C55E' : '#34D399',
    borderWidth: 2,
    borderColor: isPrimary ? '#16A34A' : '#10B981',
    borderBottomWidth: 6,
    borderBottomColor: isPrimary ? '#15803D' : '#059669',
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
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={onPress}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 45,
            justifyContent: 'center',
            alignItems: 'center',
            // Inner gradient effect
            backgroundColor: isPrimary ? '#22C55E' : '#34D399',
            position: 'relative',
          }}
        >
          {/* Progress Circle for Read Button */}
          {showProgress && <CircularProgress progress={progress} size={90} />}
          
          {/* Icon */}
          <View style={{ zIndex: 2 }}>
            {icon}
          </View>
        </Pressable>
      </Animated.View>
      
      {/* Label */}
      <Text 
        className=" text-xl font-bold" 
        style={{ 
          color: '#1B4B07',
          fontWeight: '600',
          textShadowColor: 'rgba(0, 0, 0, 0.1)',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 2,
          fontFamily: 'Baloo2_700Bold',
        }}
      >
        {label}
      </Text>
    </VStack>
  );
};

// Tag Component
const InfoTag = ({ tag }: { tag: (typeof storyData.tags)[0] }) => {
  return (
    <View
      style={{
        backgroundColor: tag.color,
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginHorizontal: 4,
        marginVertical: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
      }}
    >
      <HStack space="xs" className="items-center">
        <Text style={{ fontSize: 12 }}>{tag.icon}</Text>
        <Text
          style={{
            color: "#1B4B07",
            fontSize: 12,
            fontWeight: "600",
          }}
        >
          {tag.label}
        </Text>
      </HStack>
    </View>
  );
};

// Main Content Component with entrance animations
const StoryContent = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const [readProgress, setReadProgress] = useState(65); // Example progress
  const params = useLocalSearchParams();
  const storyId = params.id as string;
  const { data: story } = useQuery(getStoryByIdQueryOptions(storyId))
  
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
    console.log('Read button pressed');
    // Navigate to reading screen
  };

  const handleQuizPress = () => {
    console.log('Quiz button pressed');
    // Navigate to quiz screen
  };

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
              uri: "https://sggniqcffaupphqfevrp.supabase.co/storage/v1/object/public/asset//ChatGPT%20Image%2022_10_30%2016%20thg%207,%202025.png",
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
            {storyData.title}
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
            {storyData.synopsis}
          </Text>

          {/* Info Tags */}
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
              maxWidth: screenWidth - 40,
            }}
          >
            {storyData.tags.map((tag, index) => (
              <InfoTag key={index} tag={tag} />
            ))}
          </View>
        </VStack>

        {/* Enhanced 3D Action Buttons */}
        <View style={{ marginTop: 5 }}>
          <HStack space="xl" className="w-full justify-center items-center">
            <Action3DButton
              icon={<Feather name="book-open" size={36} color="white" />}
              label="Đọc"
              onPress={handleReadPress}
              isPrimary={true}
              progress={readProgress}
              showProgress={true}
            />
            
            {/* Animated Arrow */}
            <View className="justify-center items-center">
              <Animated.View
                style={{
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateX: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-10, 0],
                      }),
                    },
                  ],
                }}
              >
                <Feather name="chevron-right" size={28} color="#1B4B07" />
              </Animated.View>
            </View>
            
            <Action3DButton
              icon={<FontAwesome6 name="brain" size={32} color="white" />}
              label="Quiz"
              onPress={handleQuizPress}
              isPrimary={false}
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

  const handleBack = () => {
    router.back();
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

          <View style={{ width: 40 }} />
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
