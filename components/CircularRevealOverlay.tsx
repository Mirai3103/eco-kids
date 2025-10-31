import { useCircularReveal } from "@/contexts/CircularRevealContext";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import React from "react";
import { Dimensions, StyleSheet } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Calculate the maximum radius needed to cover the entire screen from any point
const getMaxRadius = (x: number, y: number) => {
  const corners = [
    Math.hypot(x, y), // top-left
    Math.hypot(SCREEN_WIDTH - x, y), // top-right
    Math.hypot(x, SCREEN_HEIGHT - y), // bottom-left
    Math.hypot(SCREEN_WIDTH - x, SCREEN_HEIGHT - y), // bottom-right
  ];
  return Math.max(...corners);
};

export const CircularRevealOverlay = () => {
  const { isAnimating, buttonPosition } = useCircularReveal();

  if (!isAnimating) {
    return null;
  }
  console.log(buttonPosition);
  const maxRadius = getMaxRadius(buttonPosition.x, buttonPosition.y);

  return (
    <MotiView
      style={StyleSheet.absoluteFillObject}
      pointerEvents="none"
      from={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
      transition={{
        type: "timing",
        duration: 150,
      }}
    >
      <MotiView
        from={{
          width: 0,
          height: 0,
          left: buttonPosition.x,
          top: buttonPosition.y,
        }}
        animate={{
          width: maxRadius * 2,
          height: maxRadius * 2,
          left: buttonPosition.x - maxRadius,
          top: buttonPosition.y - maxRadius,
        }}
        transition={{
          type: "timing",
          duration: 600,
        }}
        style={styles.circle}
      >
        <LinearGradient
          colors={["#EEF0FE", "#CAFEC3"]}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </MotiView>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  circle: {
    position: "absolute",
    borderRadius: 999999, // Very large number to ensure circular shape
    overflow: "hidden",
  },
});
