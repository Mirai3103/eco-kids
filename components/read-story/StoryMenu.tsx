import { Text } from "@/components/ui/text";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Animated, Pressable, View } from "react-native";
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
    }) => {
        if (!isMenuVisible) return null;

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
                        top: 110,
                        right: 20,
                        backgroundColor: "white",
                        borderRadius: 24,
                        paddingVertical: 16,
                        paddingHorizontal: 20,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.2,
                        shadowRadius: 16,
                        elevation: 16,
                        zIndex: 1001,
                        opacity: menuAnimation,
                        gap: 6,
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
                    {/* Home Button */}
                    <View
                        style={{
                            paddingVertical: 4,
                            paddingHorizontal: 8,
                            alignItems: "center",
                        }}
                    >
                        <Menu3DButton
                            icon={<Ionicons name="home" size={28} color="white" />}
                            onPress={handleMenuBack}
                            color="#EF4444"
                            shadowColor="#DC2626"
                            size={50}
                        />
                    </View>

                    {/* Language Toggle */}
                    <View
                        style={{
                            paddingVertical: 4,
                            paddingHorizontal: 8,
                            alignItems: "center",
                        }}
                    >
                        <Menu3DButton
                            icon={
                                <Text style={{ fontSize: 24 }}>
                                    {isVietnamese ? "🇻🇳" : "🇬🇧"}
                                </Text>
                            }
                            onPress={handleToggleLanguage}
                            color="#3B82F6"
                            shadowColor="#2563EB"
                            size={50}
                        />
                    </View>

                    {/* Mute Toggle */}
                    <View
                        style={{
                            paddingVertical: 4,
                            paddingHorizontal: 8,
                            alignItems: "center",
                        }}
                    >
                        <Menu3DButton
                            icon={
                                <Ionicons
                                    name={isMuted ? "volume-mute" : "volume-high"}
                                    size={28}
                                    color="white"
                                />
                            }
                            onPress={toggleMute}
                            color={isMuted ? "#F59E0B" : "#10B981"}
                            shadowColor={isMuted ? "#D97706" : "#059669"}
                            size={50}
                        />
                    </View>

                    {/* Auto Play Toggle */}
                    <View
                        style={{
                            paddingVertical: 4,
                            paddingHorizontal: 8,
                            alignItems: "center",
                        }}
                    >
                        <Menu3DButton
                            icon={
                                <Ionicons
                                    name={isAutoPlay ? "pause" : "play"}
                                    size={28}
                                    color="white"
                                />
                            }
                            onPress={handleToggleAutoPlay}
                            color={isAutoPlay ? "#EF4444" : "#22C55E"}
                            shadowColor={isAutoPlay ? "#DC2626" : "#16A34A"}
                            size={50}
                        />
                    </View>

                    {/* Restart Button */}
                    <View
                        style={{
                            paddingVertical: 4,
                            paddingHorizontal: 8,
                            alignItems: "center",
                        }}
                    >
                        <Menu3DButton
                            icon={<Ionicons name="refresh" size={28} color="white" />}
                            onPress={handleRestart}
                            color="#8B5CF6"
                            shadowColor="#7C3AED"
                            size={50}
                        />
                    </View>
                </Animated.View>
            </>
        );
    }
);
