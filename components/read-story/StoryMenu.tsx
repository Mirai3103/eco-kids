import { Text } from "@/components/ui/text";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Animated, Pressable, View, useWindowDimensions } from "react-native";
import { Menu3DButton } from "./Menu3DButton";

interface StoryMenuProps {
    isMenuVisible: boolean;
    closeMenu: () => void;
    menuAnimation: Animated.Value;
    handleMenuBack: () => void;
    handleToggleLanguage: () => void;
    isVietnamese: boolean;
    toggleMute: () => void;
    isMuted: boolean;
    handleToggleAutoPlay: () => void;
    isAutoPlay: boolean;
    handleRestart: () => void;
    onPressMic: () => void;
    isRecording: boolean;
    stopRecording: () => void;
}

export const StoryMenu = React.memo<StoryMenuProps>(
    ({
        isMenuVisible,
        closeMenu,
        menuAnimation,
        handleMenuBack,
        handleToggleLanguage,
        isVietnamese,
        toggleMute,
        isMuted,
        handleToggleAutoPlay,
        isAutoPlay,
        handleRestart,
        onPressMic,
        isRecording,
        stopRecording,
    }) => {
        const { width: screenWidth, height: screenHeight } = useWindowDimensions();
        const isLandscape = screenWidth > screenHeight;

        if (!isMenuVisible) return null;

        const menuButtons = [
            {
                key: 'home',
                icon: <Ionicons name="home" size={28} color="white" />,
                onPress: handleMenuBack,
                color: "#EF4444",
                shadowColor: "#DC2626",
            },
            {
                key: 'language',
                icon: <Text style={{ fontSize: 24 }}>{isVietnamese ? "🇻🇳" : "🇬🇧"}</Text>,
                onPress: handleToggleLanguage,
                color: "#3B82F6",
                shadowColor: "#2563EB",
            },
            {
                key: 'mute',
                icon: <Ionicons name={isMuted ? "volume-mute" : "volume-high"} size={28} color="white" />,
                onPress: toggleMute,
                color: isMuted ? "#F59E0B" : "#10B981",
                shadowColor: isMuted ? "#D97706" : "#059669",
            },
            {
                key: 'autoplay',
                icon: <Ionicons name={isAutoPlay ? "pause" : "play"} size={28} color="white" />,
                onPress: handleToggleAutoPlay,
                color: isAutoPlay ? "#EF4444" : "#22C55E",
                shadowColor: isAutoPlay ? "#DC2626" : "#16A34A",
            },
            {
                key: 'restart',
                icon: <Ionicons name="refresh" size={28} color="white" />,
                onPress: handleRestart,
                color: "#8B5CF6",
                shadowColor: "#7C3AED",
            },
            {
                key: 'mic',
                icon: <Ionicons name={isRecording ? "mic-off" : "mic"} size={28} color="white" />,
                onPress: isRecording ? stopRecording : onPressMic,
                color: isRecording ? "#D72654" : "#399918",
                shadowColor: isRecording ? "#a01a3f" : "#2a800d",
            }
        ];

        return (
            <>
                {/* Overlay */}
                <Pressable
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.3)",
                        zIndex: 999,
                    }}
                    onPress={closeMenu}
                />

                {/* Menu Content */}
                <Animated.View
                    style={{
                        position: "absolute",
                        top: isLandscape ? 20 : 110,
                        ...(isLandscape ? { left: 20, right: 20 } : { right: 20 }),
                        backgroundColor: "white",
                        borderRadius: 24,
                        paddingVertical: isLandscape ? 12 : 16,
                        paddingHorizontal: isLandscape ? 16 : 20,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.2,
                        shadowRadius: 16,
                        elevation: 16,
                        zIndex: 1001,
                        opacity: menuAnimation,
                        flexDirection: isLandscape ? 'row' : 'column',
                        gap: isLandscape ? 12 : 6,
                        alignItems: 'center',
                        justifyContent: isLandscape ? 'center' : undefined,
                        transform: [
                            {
                                translateY: menuAnimation.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [-20, 0],
                                }),
                            },
                            {
                                scale: menuAnimation.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.8, 1],
                                }),
                            },
                        ],
                    }}
                >
                    {menuButtons.map((button) => (
                        <View
                            key={button.key}
                            style={{
                                paddingVertical: isLandscape ? 0 : 4,
                                paddingHorizontal: isLandscape ? 4 : 8,
                                alignItems: "center",
                            }}
                        >
                            <Menu3DButton
                                icon={button.icon}
                                onPress={button.onPress}
                                color={button.color}
                                shadowColor={button.shadowColor}
                                size={50}
                            />
                        </View>
                    ))}
                </Animated.View>
            </>
        );
    }
);
