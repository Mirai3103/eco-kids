import { getAllOfflineStories } from "@/lib/offline";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Animated, Pressable, View } from "react-native";
import { HStack } from "./ui/hstack";
import { Text } from "./ui/text";
import { VStack } from "./ui/vstack";

export const ManageDownloadsCard = () => {
  const [scaleAnim] = useState(new Animated.Value(1));
  const [storiesCount, setStoriesCount] = useState(0);

  useEffect(() => {
    loadCount();
  }, []);

  const loadCount = async () => {
    const stories = await getAllOfflineStories();
    setStoriesCount(stories?.length || 0);
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    router.push("/manage-downloads");
  };

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
      }}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 20,
            padding: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          <HStack className="justify-between items-center">
            <HStack space="md" className="items-center flex-1">
              {/* Icon */}
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: "#DBEAFE",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Feather name="download" size={28} color="#3B82F6" />
              </View>

              {/* Info */}
              <VStack className="flex-1" space="xs">
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "600",
                    color: "#1B4B07",
                    fontFamily: "Baloo2_700Bold",
                  }}
                >
                  Quản lý tải xuống
                </Text>

                <Text
                  style={{
                    fontSize: 14,
                    color: "#6B7280",
                    fontFamily: "NunitoSans_400Regular",
                  }}
                >
                  {storiesCount > 0
                    ? `${storiesCount} truyện đã tải`
                    : "Chưa có truyện nào"}
                </Text>
              </VStack>
            </HStack>

            {/* Arrow */}
            <Feather name="chevron-right" size={24} color="#9CA3AF" />
          </HStack>
        </View>
      </Pressable>
    </Animated.View>
  );
};

