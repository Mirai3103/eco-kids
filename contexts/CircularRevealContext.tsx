import React, { createContext, ReactNode, useContext, useState } from "react";
import { Dimensions } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface CircularRevealContextType {
  isAnimating: boolean;
  buttonPosition: { x: number; y: number };
  triggerReveal: (x: number, y: number) => void;
  completeReveal: () => void;
}

const CircularRevealContext = createContext<
  CircularRevealContextType | undefined
>(undefined);

export const CircularRevealProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });

  const triggerReveal = (x: number, y: number) => {
    setButtonPosition({ x, y });
    setIsAnimating(true);
  };

  const completeReveal = () => {
    setIsAnimating(false);
  };

  return (
    <CircularRevealContext.Provider
      value={{ isAnimating, buttonPosition, triggerReveal, completeReveal }}
    >
      {children}
    </CircularRevealContext.Provider>
  );
};

export const useCircularReveal = () => {
  const context = useContext(CircularRevealContext);
  if (!context) {
    throw new Error(
      "useCircularReveal must be used within CircularRevealProvider"
    );
  }
  return context;
};
