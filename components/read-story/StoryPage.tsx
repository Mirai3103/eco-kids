import { Center } from "@/components/ui/center";
import { Text } from "@/components/ui/text";
import { StorySegment } from "@/types";
import { Image as ExpoImage } from "expo-image";
import React, { useMemo } from "react";
import { Dimensions, ImageStyle, TextStyle, View, ViewStyle } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface StoryPageProps {
    segment: StorySegment;
    isVietnamese?: boolean;
}

export const StoryPage = React.memo<StoryPageProps>(
    ({ segment, isVietnamese = true }) => {
        const containerStyle: ViewStyle = useMemo(
            () => ({
                flex: 1,
                backgroundColor: "white",
                borderRadius: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 5,
                margin: 0,
            }),
            []
        );

        const imageStyle: ImageStyle = useMemo(
            () => ({
                width: screenWidth - 40,
                height: screenHeight * 0.55,
                borderRadius: 12,
            }),
            []
        );

        const textStyle: TextStyle = useMemo(
            () => ({
                color: "#1B4B07",
                fontSize: 18,
                lineHeight: 28,
                textAlign: "center" as const,
                fontFamily: "NunitoSans_600SemiBold",
                marginBottom: 16,
            }),
            []
        );

        const displayText = useMemo(() => {
            return isVietnamese ? segment?.vi_text : segment?.en_text || "";
        }, [isVietnamese, segment?.vi_text, segment?.en_text]);

        if (!segment) return null;

        return (
            <View style={containerStyle}>
                <View style={{ flex: 1, padding: 20, justifyContent: "space-between" }}>
                    {/* Image Section */}
                    {segment.image_url && (
                        <Center style={{ flex: 1, marginBottom: 20 }}>
                            <ExpoImage
                                source={{ uri: segment.image_url }}
                                style={imageStyle}
                                alt={`Story page ${(segment.segment_index || 0) + 1}`}
                                contentFit="cover"
                                cachePolicy="memory-disk"
                            />
                        </Center>
                    )}

                    {/* Text Content Section */}
                    <View style={{ paddingBottom: 40 }}>
                        <Text style={textStyle}>{displayText}</Text>
                    </View>
                </View>
            </View>
        );
    }
);
