import React, { useRef } from "react";
import { Animated, Pressable, View } from "react-native";

interface Menu3DButtonProps {
    icon: React.ReactNode;
    onPress: () => void;
    color?: string;
    shadowColor?: string;
    disabled?: boolean;
    size?: number;
}

export const Menu3DButton = React.memo<Menu3DButtonProps>(
    ({
        icon,
        onPress,
        color = "#22C55E",
        shadowColor,
        disabled = false,
        size = 50,
    }) => {
        const scaleAnim = useRef(new Animated.Value(1)).current;

        const handlePressIn = () => {
            Animated.spring(scaleAnim, {
                toValue: 0.95,
                useNativeDriver: true,
            }).start();
        };

        const handlePressOut = () => {
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
                    <View style={{ position: "relative" }}>
                        {/* Shadow/Bottom layer */}
                        <View
                            style={{
                                backgroundColor: disabled ? "#6B7280" : effectiveShadowColor,
                                width: size,
                                height: size,
                                borderRadius: size / 2,
                                position: "absolute",
                                top: 4,
                                left: 0,
                            }}
                        />
                        {/* Top layer */}
                        <View
                            style={{
                                backgroundColor: disabled ? "#9CA3AF" : color,
                                width: size,
                                height: size,
                                borderRadius: size / 2,
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            {icon}
                        </View>
                    </View>
                </Animated.View>
            </Pressable>
        );
    }
);
