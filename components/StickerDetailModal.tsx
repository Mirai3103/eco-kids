import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import { Image as ExpoImage } from "expo-image";
import * as MediaLibrary from "expo-media-library";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  Pressable,
  View,
} from "react-native";

// GlueStack UI Components
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import theme from "@/lib/theme";
import type { Reward } from "@/types";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface StickerDetailModalProps {
  visible: boolean;
  sticker: Reward | null;
  onClose: () => void;
}

export const StickerDetailModal: React.FC<StickerDetailModalProps> = ({
  visible,
  sticker,
  onClose,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const imageScaleAnim = useRef(new Animated.Value(1)).current;
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (visible) {
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
  }, [visible]);

  if (!sticker) return null;

  
const handleSaveToGallery = async () => {
  try {
    setIsSaving(true);

    // ✅ Kiểm tra quyền trước
    const { status, canAskAgain, accessPrivileges } =
      await MediaLibrary.getPermissionsAsync();

    if (status !== "granted") {
      const req = await MediaLibrary.requestPermissionsAsync();

      if (req.status !== "granted") {
        Alert.alert(
          "Cần quyền truy cập",
          "Vui lòng cấp quyền truy cập thư viện ảnh để lưu sticker."
        );
        setIsSaving(false);
        return;
      }
    }

    // ✅ iOS Limited access — mở UI cho user chọn thêm ảnh nếu cần
    if (accessPrivileges === "limited" && canAskAgain) {
      await MediaLibrary.presentPermissionsPickerAsync();
    }

    // ✅ download ảnh → cache (không deprecated)
    const fileUri = `${FileSystem.cacheDirectory}sticker_${sticker.id}.png`;
    const result = await FileSystem.downloadAsync(sticker.image_url!,fileUri) ;

    if (result.status !== 200) {
      throw new Error("Failed to download image");
    }

    // ✅ API mới khuyến nghị — đơn giản, an toàn, không deprecated
    await MediaLibrary.saveToLibraryAsync(result.uri);

    // ✅ hiệu ứng thành công giữ nguyên
    Animated.sequence([
      Animated.timing(imageScaleAnim, {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(imageScaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    Alert.alert("Thành công! 🎉", "Sticker đã được lưu vào thư viện ảnh của bé.");
  } catch (error) {
    console.error("Error saving image:", error);
    Alert.alert("Lỗi", "Không thể lưu sticker. Vui lòng thử lại sau.");
  } finally {
    setIsSaving(false);
  }
};

  return (
    <Modal transparent visible={visible} animationType="none">
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.85)",
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

            <VStack space="lg" className="items-center mt-4">
              {/* Sticker Name */}
              <Text
                style={{
                  fontSize: 26,
                  fontFamily: "Baloo2_700Bold",
                  color: "#1B4B07",
                  textAlign: "center",
                }}
              >
                {sticker.name}
              </Text>

              {/* Large Sticker Image */}
              <Animated.View
                style={{
                  transform: [{ scale: imageScaleAnim }],
                }}
              >
                <View
                  style={{
                    width: screenWidth - 120,
                    height: screenWidth - 120,
                    maxWidth: 300,
                    maxHeight: 300,
                    borderRadius: 24,
                    overflow: "hidden",
                    borderWidth: 4,
                    borderColor: theme.palette.primary[400],
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.2,
                    shadowRadius: 12,
                    elevation: 10,
                    backgroundColor: "white",
                  }}
                >
                  <ExpoImage
                    source={{
                      uri: sticker.image_url!,
                    }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="contain"
                    cachePolicy="memory-disk"
                  />
                </View>
              </Animated.View>

              {/* Sticker Info */}
              <View
                style={{
                  backgroundColor: theme.palette.primary[100],
                  borderRadius: 16,
                  paddingVertical: 12,
                  paddingHorizontal: 20,
                  borderWidth: 2,
                  borderColor: theme.palette.primary[200],
                  width: "100%",
                }}
              >
                <HStack className="items-center justify-center" space="sm">
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={theme.palette.primary[600]}
                  />
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "NunitoSans_600SemiBold",
                      color: theme.palette.primary[700],
                      textAlign: "center",
                    }}
                  >
                    Sticker đã mở khóa
                  </Text>
                </HStack>
              </View>

              {/* Action Buttons */}
              <VStack space="md" className="w-full">
                {/* Save to Gallery Button */}
                <Pressable
                  onPress={handleSaveToGallery}
                  disabled={isSaving}
                  style={{ width: "100%" }}
                >
                  <View style={{ position: "relative" }}>
                    {/* Shadow layer */}
                    <View
                      style={{
                        backgroundColor: theme.palette.secondary[500],
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
                        backgroundColor: theme.palette.secondary[400],
                        borderRadius: 20,
                        paddingVertical: 16,
                        alignItems: "center",
                        opacity: isSaving ? 0.6 : 1,
                      }}
                    >
                      <HStack space="sm" className="items-center">
                        <Ionicons
                          name={isSaving ? "hourglass" : "download"}
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
                          {isSaving ? "Đang lưu..." : "Lưu vào thư viện"}
                        </Text>
                      </HStack>
                    </View>
                  </View>
                </Pressable>

                {/* Share Button (Optional - for future feature) */}
                <Pressable
                  onPress={() => {
                    Alert.alert(
                      "Tính năng sắp ra mắt",
                      "Tính năng chia sẻ sẽ được thêm vào trong phiên bản sau!"
                    );
                  }}
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
                      }}
                    >
                      <HStack space="sm" className="items-center">
                        <Ionicons name="share-social" size={20} color="white" />
                        <Text
                          style={{
                            color: "white",
                            fontSize: 16,
                            fontFamily: "Baloo2_700Bold",
                          }}
                        >
                          Chia sẻ sticker
                        </Text>
                      </HStack>
                    </View>
                  </View>
                </Pressable>
              </VStack>
            </VStack>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

