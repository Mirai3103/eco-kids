import { Ionicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  View,
} from "react-native";

// GlueStack UI Components
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import theme from "@/lib/theme";
import type { Reward } from "@/types";

const { width: screenWidth } = Dimensions.get("window");

interface CongratulationsModalProps {
  visible: boolean;
  sticker: Reward | null;
  onClose: () => void;
}

export const CongratulationsModal: React.FC<CongratulationsModalProps> = ({
  visible,
  sticker,
  onClose,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Bounce animation for sticker
      Animated.sequence([
        Animated.delay(200),
        Animated.spring(bounceAnim, {
          toValue: 1,
          tension: 50,
          friction: 5,
          useNativeDriver: true,
        }),
      ]).start();

      // Continuous rotation for stars
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
      bounceAnim.setValue(0);
      rotateAnim.setValue(0);
    }
  }, [visible]);

  if (!sticker) return null;

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Modal transparent visible={visible} animationType="none">
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          justifyContent: "center",
          alignItems: "center",
          opacity: fadeAnim,
        }}
      >
        {/* Floating stars animation */}
        <Animated.View
          style={{
            position: "absolute",
            top: 100,
            left: 50,
            transform: [{ rotate: rotation }],
          }}
        >
          <Text style={{ fontSize: 30, lineHeight: 40 }}>⭐</Text>
        </Animated.View>
        <Animated.View
          style={{
            position: "absolute",
            top: 150,
            right: 60,
            transform: [{ rotate: rotation }],
          }}
        >
          <Text style={{ fontSize: 24, lineHeight: 32 }}>✨</Text>
        </Animated.View>
        <Animated.View
          style={{
            position: "absolute",
            bottom: 200,
            left: 40,
            transform: [{ rotate: rotation }],
          }}
        >
          <Text style={{ fontSize: 28, lineHeight: 36 }}>🌟</Text>
        </Animated.View>
        <Animated.View
          style={{
            position: "absolute",
            bottom: 180,
            right: 50,
            transform: [{ rotate: rotation }],
          }}
        >
          <Text style={{ fontSize: 26, lineHeight: 34 }}>💫</Text>
        </Animated.View>

        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            width: screenWidth - 48,
            maxWidth: 400,
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 32,
              padding: 32,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 15,
            }}
          >
            <VStack space="xl" className="items-center">
              {/* Celebration emoji */}
              <View
                style={{
                  backgroundColor: theme.palette.primary[100],
                  borderRadius: 60,
                  width: 120,
                  height: 120,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 4,
                  borderColor: theme.palette.primary[400],
                }}
              >
                <Text style={{ fontSize: 60, lineHeight: 70 }}>🎉</Text>
              </View>

              {/* Congratulations text */}
              <VStack space="sm" className="items-center">
                <Text
                  style={{
                    fontSize: 32,
                    fontFamily: "Baloo2_700Bold",
                    color: theme.palette.primary[500],
                    textAlign: "center",
                  }}
                >
                  Chúc mừng!
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: "NunitoSans_600SemiBold",
                    color: "#4A5568",
                    textAlign: "center",
                  }}
                >
                  Bé đã mở khóa sticker mới
                </Text>
              </VStack>

              {/* Sticker Preview with bounce animation */}
              <Animated.View
                style={{
                  transform: [{ scale: bounceAnim }],
                }}
              >
                <View
                  style={{
                    width: 160,
                    height: 160,
                    borderRadius: 24,
                    overflow: "hidden",
                    borderWidth: 4,
                    borderColor: theme.palette.primary[400],
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.2,
                    shadowRadius: 12,
                    elevation: 10,
                    backgroundColor: "white",
                  }}
                >
                  <ExpoImage
                    source={{
                      uri: sticker.image_url!,
                    }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                  />
                </View>
              </Animated.View>

              {/* Sticker Name */}
              <Text
                style={{
                  fontSize: 24,
                  fontFamily: "Baloo2_700Bold",
                  color: "#1B4B07",
                  textAlign: "center",
                }}
              >
                {sticker.name}
              </Text>

              {/* Success message */}
              <View
                style={{
                  backgroundColor: theme.palette.primary[100],
                  borderRadius: 16,
                  paddingVertical: 12,
                  paddingHorizontal: 20,
                  borderWidth: 2,
                  borderColor: theme.palette.primary[200],
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "NunitoSans_600SemiBold",
                    color: theme.palette.primary[700],
                    textAlign: "center",
                  }}
                >
                  Sticker đã được thêm vào bộ sưu tập! ✨
                </Text>
              </View>

              {/* Close Button */}
              <Pressable onPress={onClose} style={{ width: "100%" }}>
                <View style={{ position: "relative" }}>
                  {/* Shadow layer */}
                  <View
                    style={{
                      backgroundColor: theme.palette.primary[500],
                      borderRadius: 24,
                      position: "absolute",
                      top: 4,
                      left: 0,
                      right: 0,
                      height: "100%",
                    }}
                  />
                  {/* Top layer */}
                  <View
                    style={{
                      backgroundColor: theme.palette.primary[400],
                      borderRadius: 24,
                      paddingVertical: 16,
                      alignItems: "center",
                    }}
                  >
                    <HStack space="sm" className="items-center">
                      <Ionicons name="checkmark-circle" size={24} color="white" />
                      <Text
                        style={{
                          color: "white",
                          fontSize: 18,
                          fontFamily: "Baloo2_700Bold",
                        }}
                      >
                        Tuyệt vời!
                      </Text>
                    </HStack>
                  </View>
                </View>
              </Pressable>
            </VStack>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

