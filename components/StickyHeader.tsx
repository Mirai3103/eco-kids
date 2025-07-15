// components/AnimatedHeader.tsx
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import React from "react";
import { SafeAreaView, View } from "react-native";
import { Image } from "./ui/image";

// --- Helper Function: Lấy lời chào theo thời gian ---
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Chào buổi sáng";
  if (hour < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
};

// --- Props của component ---
type StickyHeaderProps = {};

export const StickyHeader = () => {
  return (
    <View
      style={{
        position: "absolute",
        top: 13,
        left: 0,
        right: 0,
        zIndex: 10,
        backgroundColor: "rgba(238, 240, 254, 0.8)",
        backdropFilter: "blur(20px)",
      }}
      className="rounded-b-3xl"
    >
      <SafeAreaView>
        <HStack className="justify-between items-center px-4 py-0">
          <Image
            source={require("@/assets/images/logo.png")}
            alt="logo"
            className="w-32 h-auto "
            resizeMode="contain"
          />

          <HStack className="items-center space-x-3">
            <HStack className="items-center bg-white rounded-full px-3 py-2 shadow-sm">
              <Image
                source={require("@/assets/images/cup.png")}
                alt="logo"
                className="w-10 h-8"
                resizeMode="contain"
              />
              <Text
                style={{
                  color: "#1B4B07",
                  fontWeight: "600",
                  marginLeft: 4,
                }}
              >
                125
              </Text>
            </HStack>
          </HStack>
        </HStack>
      </SafeAreaView>
    </View>
  );
};
