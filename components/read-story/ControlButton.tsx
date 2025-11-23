import React, { useMemo } from "react";
import { Pressable, View, ViewStyle } from "react-native";

interface ControlButtonProps {
    icon: React.ReactNode;
    onPress: () => void;
    disabled?: boolean;
    color?: string;
    size?: number;
    shadowColor?: string;
}

export const ControlButton = React.memo<ControlButtonProps>(
    ({
        icon,
        onPress,
        disabled = false,
        color = "#22C55E",
        size = 48,
        shadowColor = "#22C55E",
    }) => {
        const shadowStyle: ViewStyle = useMemo(
            () => ({
                backgroundColor: disabled ? "#9CA3AF" : shadowColor,
                width: size,
                height: size,
                borderRadius: size / 2,
                position: "absolute",
                top: 3,
                left: 0,
            }),
            [disabled, shadowColor, size]
        );

        const topLayerStyle: ViewStyle = useMemo(
            () => ({
                backgroundColor: disabled ? "#D1D5DB" : color,
                width: size,
                height: size,
                borderRadius: size / 2,
                justifyContent: "center",
                alignItems: "center",
            }),
            [disabled, color, size]
        );

        return (
            <Pressable
                onPress={disabled ? undefined : onPress}
                disabled={disabled}
                style={({ pressed }) => ({
                    opacity: pressed ? 0.8 : 1,
                    transform: [{ scale: pressed ? 0.95 : 1 }],
                })}
            >
                <View style={{ position: "relative" }}>
                    <View style={shadowStyle} />
                    <View style={topLayerStyle}>{icon}</View>
                </View>
            </Pressable>
        );
    }
);
