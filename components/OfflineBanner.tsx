import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { useUserStore } from "@/stores/user.store";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, Pressable } from "react-native";

/**
 * OfflineBanner - Shows a small banner when app is in offline mode
 * Can be placed at the top of any screen to indicate offline status
 */
export const OfflineBanner = () => {
  const isOfflineMode = useUserStore((state) => state.isOfflineMode);
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const [isVisible, setIsVisible] = React.useState(false);

  useEffect(() => {
    if (isOfflineMode) {
      setIsVisible(true);
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setIsVisible(false);
      });
    }
  }, [isOfflineMode]);

  if (!isVisible && !isOfflineMode) return null;

  return (
    <Animated.View
      style={{
        transform: [{ translateY: slideAnim }],
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
      }}
    >
      <Pressable
        style={{
          backgroundColor: "#FF6B6B",
          paddingVertical: 8,
          paddingHorizontal: 16,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        <HStack space="sm" className="items-center justify-center">
          <Ionicons name="cloud-offline" size={16} color="white" />
          <Text
            style={{
              color: "white",
              fontSize: 13,
              fontWeight: "600",
            }}
          >
            📴 Chế độ offline - Một số tính năng có thể bị giới hạn
          </Text>
        </HStack>
      </Pressable>
    </Animated.View>
  );
};

