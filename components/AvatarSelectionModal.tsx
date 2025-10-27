import { Ionicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import React, { useEffect, useRef } from "react";
import {
    Animated,
    Dimensions,
    Modal,
    Pressable,
    ScrollView,
    View,
} from "react-native";

// GlueStack UI Components
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import theme from "@/lib/theme";
import type { Reward } from "@/types";

const { width: screenWidth } = Dimensions.get("window");
const avatarSize = (screenWidth - 80) / 3; // 3 columns with padding

interface AvatarSelectionModalProps {
  visible: boolean;
  rewards: Reward[];
  currentAvatar: string;
  onClose: () => void;
  onSelect: (imageUrl: string) => void;
  isLoading?: boolean;
}

// Avatar Option Card Component
const AvatarOptionCard = ({
  imageUrl,
  isSelected,
  index,
  onPress,
}: {
  imageUrl: string;
  isSelected: boolean;
  index: number;
  onPress: () => void;
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 50,
      tension: 60,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(pressAnim, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }, { scale: pressAnim }],
        marginBottom: 16,
      }}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={{ position: "relative" }}>
          {/* Shadow layer */}
          <View
            style={{
              backgroundColor: isSelected
                ? theme.palette.primary[500]
                : "#9CA3AF",
              borderRadius: 16,
              position: "absolute",
              top: 4,
              left: 0,
              right: 0,
              height: "100%",
            }}
          />
          {/* Top layer */}
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 16,
              padding: 8,
              width: avatarSize,
              height: avatarSize,
              borderWidth: isSelected ? 3 : 2,
              borderColor: isSelected
                ? theme.palette.primary[400]
                : "#D1D5DB",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            {/* Avatar Image */}
            <View
              style={{
                flex: 1,
                borderRadius: 12,
                overflow: "hidden",
                backgroundColor: "#F3F4F6",
              }}
            >
              <ExpoImage
                source={{ uri: imageUrl }}
                style={{
                  width: "100%",
                  height: "100%",
                }}
                contentFit="cover"
                cachePolicy="memory-disk"
              />

              {/* Selected checkmark */}
              {isSelected && (
                <View
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    backgroundColor: theme.palette.primary[400],
                    borderRadius: 12,
                    width: 28,
                    height: 28,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons name="checkmark" size={18} color="white" />
                </View>
              )}
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

export const AvatarSelectionModal: React.FC<AvatarSelectionModalProps> = ({
  visible,
  rewards,
  currentAvatar,
  onClose,
  onSelect,
  isLoading = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [selectedAvatar, setSelectedAvatar] = React.useState(currentAvatar);

  useEffect(() => {
    if (visible) {
      setSelectedAvatar(currentAvatar);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
    }
  }, [visible, currentAvatar]);

  const handleSelect = () => {
    if (selectedAvatar && selectedAvatar !== currentAvatar) {
      onSelect(selectedAvatar);
    } else {
      onClose();
    }
  };

  return (
    <Modal transparent visible={visible} animationType="none">
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          justifyContent: "center",
          alignItems: "center",
          opacity: fadeAnim,
        }}
      >
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            width: screenWidth - 32,
            maxWidth: 450,
            maxHeight: screenWidth * 1.3,
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 32,
              padding: 24,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 15,
            }}
          >
            {/* Close Button */}
            <Pressable
              onPress={onClose}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                zIndex: 10,
                backgroundColor: "#F3F4F6",
                borderRadius: 24,
                width: 40,
                height: 40,
                justifyContent: "center",
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </Pressable>

            <VStack space="lg" className="mt-4">
              {/* Header */}
              

              {/* Avatar Grid */}
              <ScrollView
                style={{
                  maxHeight: screenWidth * 0.8,
                  marginTop: 24,
                }}
                showsVerticalScrollIndicator={false}
              >
                {rewards.length === 0 ? (
                  <View
                    style={{
                      padding: 32,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontSize: 48, lineHeight: 56 }}>🔒</Text>
                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily: "NunitoSans_600SemiBold",
                        color: "#6B7280",
                        textAlign: "center",
                        marginTop: 16,
                      }}
                    >
                      Chưa có sticker nào được mở khóa.{"\n"}
                      Hãy mở khóa sticker để chọn avatar nhé!
                    </Text>
                  </View>
                ) : (
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      justifyContent: "space-between",
                    }}
                  >
                    {rewards.map((reward, index) => (
                      <AvatarOptionCard
                        key={reward.id}
                        imageUrl={reward.image_url!}
                        isSelected={selectedAvatar === reward.image_url}
                        index={index}
                        onPress={() => setSelectedAvatar(reward.image_url!)}
                      />
                    ))}
                  </View>
                )}
              </ScrollView>

              {/* Action Buttons */}
              {rewards.length > 0 && (
                <VStack space="sm" className="w-full">
                  {/* Confirm Button */}
                  <Pressable
                    onPress={handleSelect}
                    disabled={isLoading}
                    style={{ width: "100%" }}
                  >
                    <View style={{ position: "relative" }}>
                      {/* Shadow layer */}
                      <View
                        style={{
                          backgroundColor: theme.palette.primary[500],
                          borderRadius: 20,
                          position: "absolute",
                          top: 4,
                          left: 0,
                          right: 0,
                          height: "100%",
                        }}
                      />
                      {/* Top layer */}
                      <View
                        style={{
                          backgroundColor: theme.palette.primary[400],
                          borderRadius: 20,
                          paddingVertical: 16,
                          alignItems: "center",
                          opacity: isLoading ? 0.6 : 1,
                        }}
                      >
                        <HStack space="sm" className="items-center">
                          <Ionicons
                            name={
                              isLoading
                                ? "hourglass"
                                : selectedAvatar === currentAvatar
                                  ? "close"
                                  : "checkmark-circle"
                            }
                            size={20}
                            color="white"
                          />
                          <Text
                            style={{
                              color: "white",
                              fontSize: 16,
                              fontFamily: "Baloo2_700Bold",
                            }}
                          >
                            {isLoading
                              ? "Đang lưu..."
                              : selectedAvatar === currentAvatar
                                ? "Đóng"
                                : "Xác nhận"}
                          </Text>
                        </HStack>
                      </View>
                    </View>
                  </Pressable>
                </VStack>
              )}
            </VStack>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

