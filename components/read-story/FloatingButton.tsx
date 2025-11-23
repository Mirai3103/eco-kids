import React from "react";
import { Pressable } from "react-native";

interface FloatingButtonProps {
    icon: React.ReactNode;
    onPress: () => void;
    color?: string;
    disabled?: boolean;
    size?: number;
}

export const FloatingButton = React.memo<FloatingButtonProps>(
    ({ icon, onPress, color = "#22C55E", disabled = false, size = 50 }) => {
        return (
            <Pressable
                onPress={disabled ? undefined : onPress}
                disabled={disabled}
                style={({ pressed }) => ({
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: disabled ? "#9CA3AF" : color,
                    justifyContent: "center",
                    alignItems: "center",
                    shadowColor: color,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.4,
                    shadowRadius: 8,
                    elevation: 8,
                    borderWidth: 2,
                    borderColor: "#FFF",
                    opacity: pressed ? 0.8 : 1,
                    transform: [{ scale: pressed ? 0.95 : 1 }],
                })}
            >
                {icon}
            </Pressable>
        );
    }
);
