import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import React, { useRef } from "react";
import { Animated, Pressable, View } from "react-native";

interface Button3DProps {
  title: string;
  onPress: () => void;
  icon?: React.ReactNode;
  size?: "small" | "medium" | "large";
  color?: string;
  shadowColor?: string;
  disabled?: boolean;
  showLabel?: boolean;
}

export const Button3D: React.FC<Button3DProps> = ({
  title,
  onPress,
  icon,
  size = "large",
  color = "#2857E0",
  shadowColor,
  disabled = false,
  showLabel = true,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  // Size configurations
  const sizeConfig = {
    small: { height: 28, fontSize: 14, paddingHorizontal: 16 },
    medium: { height: 36, fontSize: 16, paddingHorizontal: 20 },
    large: { height: 44, fontSize: 18, paddingHorizontal: 28 },
  };

  const config = sizeConfig[size];
  const effectiveShadowColor = shadowColor || color;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <View style={{ position: "relative" }}>
          {/* Shadow/Bottom layer */}
          <View
            style={{
              backgroundColor: effectiveShadowColor,
              height: config.height,
              borderRadius: 16,
              position: "absolute",
              top: 5,
              left: 0,
              right: 0,
              opacity: disabled ? 0.4 : 0.8,
            }}
          />
          {/* Top layer */}
          <View
            style={{
              backgroundColor: color,
              height: config.height,
              borderRadius: 16,
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: config.paddingHorizontal,
              flexDirection: "row",
              gap: icon ? 8 : 0,
            }}
          >
            {icon && <View>{icon}</View>}
            {showLabel && (
              <Text
                style={{
                  color: "white",
                  fontSize: config.fontSize,
                  fontFamily: "Baloo2_700Bold",
                }}
              >
                {title}
              </Text>
            )}
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
};

// Icon Button variant (circular button with icon only)
interface IconButton3DProps {
  icon: React.ReactNode;
  label?: string;
  onPress: () => void;
  size?: number;
  color?: string;
  shadowColor?: string;
  disabled?: boolean;
  showLabel?: boolean;
}

export const IconButton3D: React.FC<IconButton3DProps> = ({
  icon,
  label,
  onPress,
  size = 100,
  color = "#2857E0",
  shadowColor,
  disabled = false,
  showLabel = true,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const effectiveShadowColor = shadowColor || color;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <VStack space="sm" className="items-center">
          {/* Circular Button */}
          <View style={{ position: "relative" }}>
            {/* Shadow/Bottom layer */}
            <View
              style={{
                position: "absolute",
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: effectiveShadowColor,
                top: 6,
                left: 0,
                opacity: disabled ? 0.4 : 0.8,
              }}
            />

            {/* Main Button */}
            <View
              style={{
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: color,
                justifyContent: "center",
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: disabled ? 0.1 : 0.3,
                shadowRadius: 12,
                elevation: disabled ? 3 : 10,
                borderWidth: 3,
                borderColor: "#fff",
                opacity: disabled ? 0.6 : 1,
              }}
            >
              {icon}
            </View>
          </View>

          {/* Label */}
          {showLabel && label && (
            <Text
              style={{
                color: "#1B4B07",
                fontSize: 18,
                fontWeight: "700",
                fontFamily: "Baloo2_700Bold",
                textAlign: "center",
                opacity: disabled ? 0.6 : 1,
              }}
            >
              {label}
            </Text>
          )}
        </VStack>
      </Animated.View>
    </Pressable>
  );
};
