import { Text } from "@/components/ui/text";
import { StorySegment } from "@/types";
import { Image as ExpoImage } from "expo-image";
import React, { useMemo } from "react";
import {
  ImageStyle,
  TextStyle,
  useWindowDimensions,
  View,
  ViewStyle,
} from "react-native";

interface StoryPageProps {
  segment: StorySegment;
  isVietnamese?: boolean;
  gender: "female" | "male";
}

export const StoryPage = React.memo<StoryPageProps>(
  ({ segment, isVietnamese = true, gender }) => {
    const { width: screenWidth, height: screenHeight } = useWindowDimensions();
   
    const isLandscape = screenWidth > screenHeight;

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
        width: isLandscape ? screenWidth * 0.45 : screenWidth - 40,
        height: isLandscape ? screenHeight * 0.7 : screenHeight * 0.55,
        borderRadius: 12,
      }),
      [isLandscape, screenWidth, screenHeight]
    );

    const textStyle: TextStyle = useMemo(
      () => ({
        color: "#1B4B07",
        fontSize: isLandscape ? 16 : 18,
        lineHeight: isLandscape ? 24 : 28,
        textAlign: "center" as const,
        fontFamily: "NunitoSans_600SemiBold",
        marginBottom: 16,
      }),
      [isLandscape]
    );

    const tokens = useMemo(() => {
      const text = isVietnamese ? segment?.vi_text : segment?.en_text || "";
      return text?.split(" ") || [];
    }, [isVietnamese, segment?.vi_text, segment?.en_text]);

    if (!segment) return null;

    return (
      <View style={containerStyle}>
        <View
          style={{
            flex: 1,
            padding: 20,
            flexDirection: isLandscape ? "row" : "column",
            justifyContent: "space-between",
            alignItems: isLandscape ? "center" : "stretch",
          }}
        >
          {/* Image Section */}
          {segment.image_url && (
            <View
              style={{
                flex: isLandscape ? 1 : undefined,
                marginTop: isLandscape ? 0 : 70,
                marginBottom: isLandscape ? 0 : 0,
                marginRight: isLandscape ? 20 : 0,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ExpoImage
                source={{ uri: segment.image_url }}
                style={imageStyle}
                alt={`Story page ${(segment.segment_index || 0) + 1}`}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
            </View>
          )}

          {/* Text Content Section */}
          <View
            style={{
              flex: isLandscape ? 1 : undefined,
              paddingBottom: isLandscape ? 0 : 40,
              justifyContent: "center",
            }}
          >
            <Text style={textStyle}>
              {tokens.map((word, index) => (
                <Word
                  key={index}
                  i={index}
                  text={word}
                  isLandscape={isLandscape}
                  segmentId={segment.id}
                />
              ))}
            </Text>
          </View>
        </View>
      </View>
    );
  }
);
StoryPage.displayName = "StoryPage";

const Word = React.memo(function Word({
  i,
  text,
  isLandscape,
  segmentId,
}: {
  i: number;
  text: string;
  isLandscape: boolean;
  segmentId: string;
}) {
  // const isActive = useAudioTimeStore((s) => s.activeWordIndex == i && s.segmentId == segmentId);
  const wordTextStyle: TextStyle = useMemo(
    () => ({
      fontSize: isLandscape ? 18 : 20,
      lineHeight: isLandscape ? 24 : 28,
      textAlign: "center" as const,
      fontFamily: "NunitoSans_600SemiBold",
      marginBottom: 16,
      color:  "#1B4B07",
    }),
    [isLandscape]
  );
  return <Text style={wordTextStyle}>{text + " "}</Text>;
});

Word.displayName = "Word";