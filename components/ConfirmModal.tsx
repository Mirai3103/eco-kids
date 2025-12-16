import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
    Animated,
    Dimensions,
    Modal,
    Pressable,
    View,
} from "react-native";

const { width: screenWidth } = Dimensions.get("window");

interface ConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: string;
  cancelColor?: string;
  icon?: string;
  iconColor?: string;
}

export const ConfirmModal = ({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  confirmColor = "#399918",
  cancelColor = "#E53E3E",
  icon,
  iconColor = "#F59E0B",
}: ConfirmModalProps) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  // Button 3D Component
  const Button3D = ({
    title,
    onPress,
    color,
    shadowColor,
  }: {
    title: string;
    onPress: () => void;
    color: string;
    shadowColor: string;
  }) => {
    const pressAnim = useRef(new Animated.Value(1)).current;

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

    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{ flex: 1 }}
      >
        <Animated.View style={{ transform: [{ scale: pressAnim }] }}>
          <View className="relative">
            {/* Shadow/Bottom layer */}
            <View
              style={{
                backgroundColor: shadowColor,
                height: 48,
                borderRadius: 12,
                position: "absolute",
                top: 3,
                left: 0,
                right: 0,
              }}
            />
            {/* Top layer */}
            <View
              style={{
                backgroundColor: color,
                height: 48,
                borderRadius: 12,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 16,
                  fontFamily: "NunitoSans_700Bold",
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

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "center",
          alignItems: "center",
          opacity: overlayAnim,
        }}
      >
        <Pressable
          style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }}
          onPress={onClose}
        />

        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            width: screenWidth - 64,
            maxWidth: 400,
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 24,
              padding: 24,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.25,
              shadowRadius: 16,
              elevation: 10,
              borderWidth: 3,
              borderColor: "#399918",
            }}
          >
            <VStack space="lg">
              {/* Icon (optional) */}
              {icon && (
                <View style={{ alignItems: "center" }}>
                  <View
                    style={{
                      backgroundColor: `${iconColor}15`,
                      borderRadius: 40,
                      width: 80,
                      height: 80,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons name={icon as any} size={40} color={iconColor} />
                  </View>
                </View>
              )}

              {/* Title */}
              <Text
                style={{
                  color: "#1B4B07",
                  fontSize: 20,
                  fontFamily: "Baloo2_700Bold",
                  textAlign: "center",
                  lineHeight: 28,
                }}
              >
                {title}
              </Text>

              {/* Message (optional) */}
              {message && (
                <Text
                  style={{
                    color: "#6B7280",
                    fontSize: 16,
                    fontFamily: "NunitoSans_600SemiBold",
                    textAlign: "center",
                    lineHeight: 22,
                  }}
                >
                  {message}
                </Text>
              )}

              {/* Buttons */}
              <HStack space="md" className="mt-2">
                <Button3D
                  title={cancelText}
                  onPress={onClose}
                  color={cancelColor}
                  shadowColor={cancelColor === "#E53E3E" ? "#C53030" : "#991B1B"}
                />
                <Button3D
                  title={confirmText}
                  onPress={handleConfirm}
                  color={confirmColor}
                  shadowColor={confirmColor === "#399918" ? "#2a800d" : "#15803d"}
                />
              </HStack>
            </VStack>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

