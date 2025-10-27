import { Feather, Ionicons } from "@expo/vector-icons";
import * as Crypto from 'expo-crypto';
import { Image as ExpoImage, Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
type RewardWithUnlocked = Reward & {
  unlocked: boolean;
};
// GlueStack UI Components
import { CongratulationsModal } from "@/components/CongratulationsModal";
import LoadingScreen from "@/components/LoadingScreen";
import { StickerDetailModal } from "@/components/StickerDetailModal";
import { Center } from "@/components/ui/center";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { supabase } from "@/lib/supabase";
import theme from "@/lib/theme";
import { useUserStore } from "@/stores/user.store";
import { Album, Reward } from "@/types";
import { useMutation, useQuery, useQueryClient, } from "@tanstack/react-query";

const { width: screenWidth } = Dimensions.get("window");
const stickerSize = (screenWidth - 64) / 3; // 3 columns with padding

// Mock album data

// Sticker Card Component
const StickerCard = ({
  sticker,
  index,
  onPress,
}: {
  sticker: RewardWithUnlocked;
  index: number;
  onPress: () => void;
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay: index * 50,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        delay: index * 50,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
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

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["-10deg", "0deg"],
  });

  return (
    <Animated.View
      style={{
        transform: [
          { scale: scaleAnim },
          { scale: pressAnim },
          { rotate: rotation },
        ],
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
              backgroundColor: sticker.unlocked
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
              backgroundColor: sticker.unlocked ? "white" : "#E5E7EB",
              borderRadius: 16,
              padding: 8,
              width: stickerSize,
              height: stickerSize + 30,
              borderWidth: 2,
              borderColor: sticker.unlocked
                ? theme.palette.primary[400]
                : "#D1D5DB",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            {/* Sticker Image */}
            <View
              style={{
                flex: 1,
                borderRadius: 12,
                overflow: "hidden",
                backgroundColor: "#F3F4F6",
                position: "relative",
              }}
            >
              <ExpoImage
                source={{
                  uri: sticker.image_url!,
                }}
                style={{
                  width: "100%",
                  height: "100%",
                }}
                contentFit="cover"
                cachePolicy="memory-disk"
              />

              {/* Lock Overlay for locked stickers */}
              {!sticker.unlocked && (
                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(255, 255, 255, 0.7)",
                    justifyContent: "center",
                    alignItems: "center",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  {/* Blur effect simulation */}
                  <View
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: "rgba(209, 213, 219, 0.8)",
                    }}
                  />
                  <View
                    style={{
                      backgroundColor: "white",
                      borderRadius: 20,
                      width: 40,
                      height: 40,
                      justifyContent: "center",
                      alignItems: "center",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      elevation: 4,
                    }}
                  >
                    <Ionicons name="lock-closed" size={20} color="#6B7280" />
                  </View>
                </View>
              )}

              {/* Unlocked checkmark */}
              {sticker.unlocked && (
                <View
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    backgroundColor: theme.palette.primary[400],
                    borderRadius: 12,
                    width: 24,
                    height: 24,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Feather name="check" size={14} color="white" />
                </View>
              )}
            </View>

            {/* Sticker Name/Cost */}
            <Center className="mt-1">
            <Text
                style={{
                  fontSize: 12,
                  fontFamily: "NunitoSans_600SemiBold",
                  color: sticker.unlocked ? "#1B4B07" : "#6B7280",
                  textAlign: "center",
                }}
                numberOfLines={1}
              >
                { `${sticker.cost} ⭐`}
              </Text> 
            </Center>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

// Unlock Modal Component
const UnlockModal = ({
  visible,
  sticker,
  userStars,
  onClose,
  onUnlock,
}: {
  visible: boolean;
  sticker: RewardWithUnlocked | null;
  userStars: number;
  onClose: () => void;
  onUnlock: () => void;
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

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

  const canUnlock = userStars >= (sticker.cost || 0);

  return (
    <Modal transparent visible={visible} animationType="none">
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "center",
          alignItems: "center",
          opacity: fadeAnim,
        }}
      >
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            width: screenWidth - 48,
            maxWidth: 400,
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 24,
              padding: 24,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.2,
              shadowRadius: 16,
              elevation: 10,
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
                borderRadius: 20,
                width: 36,
                height: 36,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="close" size={20} color="#6B7280" />
            </Pressable>

            <VStack space="lg" className="items-center">
              {/* Sticker Preview */}
              <View
                style={{
                  width: 220,
                  height: 220,
                  borderRadius: 16,
                  overflow: "hidden",
                  borderWidth: 3,
                  borderColor: theme.palette.primary[400],
                }}
              >
                <ExpoImage
                  source={{
                    uri: sticker.image_url!,
                  }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                />
              </View>

              {/* Sticker Name */}
            {sticker.name &&  <Text
                style={{
                  fontSize: 24,
                  fontFamily: "Baloo2_700Bold",
                  color: "#1B4B07",
                  textAlign: "center",
                }}
              >
                {sticker.name}
              </Text> }

              {/* Cost Info */}
              <HStack space="md" className="items-center">
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: "NunitoSans_600SemiBold",
                    color: "#4A5568",
                  }}
                >
                  Giá:
                </Text>
                <HStack space="xs" className="items-center">
                  <Text style={{ fontSize: 20 }}>⭐</Text>
                  <Text
                    style={{
                      fontSize: 20,
                      fontFamily: "Baloo2_700Bold",
                      color: theme.palette.primary[500],
                    }}
                  >
                    {sticker.cost}
                  </Text>
                </HStack>
              </HStack>

              {/* User Stars */}
              <HStack space="md" className="items-center">
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "NunitoSans_600SemiBold",
                    color: "#4A5568",
                  }}
                >
                  Sao của bé:
                </Text>
                <HStack space="xs" className="items-center">
                  <Text style={{ fontSize: 18 }}>⭐</Text>
                  <Text
                    style={{
                      fontSize: 18,
                      fontFamily: "Baloo2_700Bold",
                      color: canUnlock
                        ? theme.palette.primary[500]
                        : theme.palette.error[500],
                    }}
                  >
                    {userStars}
                  </Text>
                </HStack>
              </HStack>

              {/* Warning if not enough stars */}
              {!canUnlock && (
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "NunitoSans_600SemiBold",
                    color: theme.palette.error[500],
                    textAlign: "center",
                  }}
                >
                  Bé cần thêm {(sticker.cost || 0) - userStars} sao nữa nhé! 🌟
                </Text>
              )}

              {/* Unlock Button */}
              <Pressable
                onPress={canUnlock ? onUnlock : undefined}
                disabled={!canUnlock}
                style={{ width: "100%" }}
              >
                <View style={{ position: "relative" }}>
                  {/* Shadow layer */}
                  <View
                    style={{
                      backgroundColor: canUnlock
                        ? theme.palette.primary[500]
                        : "#9CA3AF",
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
                      backgroundColor: canUnlock
                        ? theme.palette.primary[400]
                        : "#D1D5DB",
                      borderRadius: 20,
                      paddingVertical: 16,
                      alignItems: "center",
                    }}
                  >
                    <HStack space="sm" className="items-center">
                      <Ionicons
                        name={canUnlock ? "lock-open" : "lock-closed"}
                        size={20}
                        color="white"
                      />
                      <Text
                        style={{
                          color: "white",
                          fontSize: 18,
                          fontFamily: "Baloo2_700Bold",
                        }}
                      >
                        {canUnlock ? "Mở khóa" : "Chưa đủ sao"}
                      </Text>
                    </HStack>
                  </View>
                </View>
              </Pressable>
            </VStack>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default function AlbumDetails() {
  const params = useLocalSearchParams();
  const albumId = params.id as string;
  const { user: currentUser,updateUserPoints: updateUserPointsStore } = useUserStore();
  const userStars = currentUser?.points || 0;
  const { mutate: updateUserPoints, isPending: isUpdatingPoints  } = useMutation({
    mutationFn: async (points: number) => {
      return supabase.from("users").update({ points }).eq("id", currentUser!.id).select().single();
    },
    onSuccess: (data) => {
      updateUserPointsStore(data.data?.points || 0);
    },
    onError: (error) => {
      console.error(error);
    },
  });
  const queryClient = useQueryClient();
  const { mutate: saveReward, isPending: isSavingReward  } = useMutation({
    mutationFn: async (rewardId: string) => {
      return supabase.from("user_rewards").insert({
        id: Crypto.randomUUID(),
        reward_id: rewardId,
        user_id: currentUser!.id,
        claimed_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rewards", albumId] });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const {
    data: unlockedRewards,
    isLoading: loading1,
  } = useQuery({
    queryKey: ["rewards", albumId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rewards")
        .select(
          `
        id,
        name,
        image_url,
        cost,
        is_active,
        category,
        user_rewards!left (
          claimed_at
        )
      `
        )
        .eq("category", Number(albumId)) 
        .eq("user_rewards.user_id", currentUser!.id) 
        .order("cost", { ascending: true });
      return data;
    },
    select: (data) =>
      data?.map((reward) => ({
        ...reward,
        unlocked: reward.user_rewards?.length > 0,
      })) || [],
    enabled: !!currentUser?.id,
  });

  const allRewards = React.useMemo(() => {


    return [...(unlockedRewards || [])].sort(
      (a, b) => (a.cost || 0) - (b.cost || 0)
    );
  }, [unlockedRewards]);
  const [selectedSticker, setSelectedSticker] =
    useState<RewardWithUnlocked | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [congratsModalVisible, setCongratsModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedDetailSticker, setSelectedDetailSticker] =
    useState<RewardWithUnlocked | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { data: album, isLoading: loading3 } = useQuery({
    queryKey: ["albums", albumId],
    queryFn: async () => {
      return supabase
        .from("albums")
        .select("*")
        .eq("id", Number(albumId))
        .single()
        .then((res) => res.data as Album);
    },
  });
  const unlockedCount = allRewards.filter((s) => s.unlocked).length;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleStickerPress = (sticker: RewardWithUnlocked) => {
    if (!sticker.unlocked) {
      // Open unlock modal for locked stickers
      setSelectedSticker(sticker);
      setModalVisible(true);
    } else {
      // Open detail modal for unlocked stickers
      setSelectedDetailSticker(sticker);
      setDetailModalVisible(true);
    }
  };

  const handleUnlock = () => {
    if (selectedSticker && userStars >= selectedSticker.cost!) {
      // Update stars
      updateUserPoints(userStars - selectedSticker.cost!);

      // Unlock sticker
      const unlockedSticker = { ...selectedSticker, unlocked: true };
      saveReward(selectedSticker.id!);
      
      // Close unlock modal and show congratulations modal
      setModalVisible(false);
      setSelectedSticker(null);
      
      // Show congratulations modal after a short delay
      setTimeout(() => {
        setSelectedSticker(unlockedSticker);
        setCongratsModalVisible(true);
      }, 300);
    }
  };

  const handleCongratsClose = () => {
    setCongratsModalVisible(false);
    setSelectedSticker(null);
  };

  const handleDetailClose = () => {
    setDetailModalVisible(false);
    setSelectedDetailSticker(null);
  };
  if (loading1 || loading3 || !album) {
    return <LoadingScreen />;
  }

  return (
    <View className="flex-1">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Background Gradient */}
      <LinearGradient
        colors={[album!.color!.bgColor as string, "#CAFEC3"]}
        style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      <SafeAreaView className="flex-1">
        {/* Header */}
        <HStack className="justify-between items-center px-6 py-4">
          <Pressable
            onPress={handleBack}
            style={{
              backgroundColor: "white",
              borderRadius: 20,
              width: 40,
              height: 40,
              justifyContent: "center",
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Ionicons name="arrow-back" size={20} color="#1B4B07" />
          </Pressable>

          <HStack space="sm" className="items-center">
            <Image
              source={{ uri: album!.thumbnail! }}
              style={{ width: 28, height: 28 }}
            />
            <Text
              style={{
                color: "#1B4B07",
                fontSize: 20,
                fontFamily: "Baloo2_700Bold",
              }}
            >
              {album!.name}
            </Text>
          </HStack>

          {/* Stars Display */}
          <View style={{ position: "relative" }}>
            <View
              style={{
                backgroundColor: theme.palette.secondary[500],
                borderRadius: 16,
                position: "absolute",
                top: 3,
                left: 0,
                right: 0,
                height: "100%",
              }}
            />
            <View
              style={{
                backgroundColor: theme.palette.secondary[400],
                borderRadius: 16,
                paddingHorizontal: 12,
                paddingVertical: 6,
              }}
            >
              <HStack space="xs" className="items-center">
                <Text style={{ fontSize: 16 }}>⭐</Text>
                <Text
                  style={{
                    color: "white",
                    fontSize: 16,
                    fontFamily: "Baloo2_700Bold",
                  }}
                >
                  {userStars}
                </Text>
              </HStack>
            </View>
          </View>
        </HStack>

        {/* Progress Info */}
        <Animated.View
          style={{ opacity: fadeAnim, paddingHorizontal: 24, marginBottom: 16 }}
        >
          <View style={{ position: "relative" }}>
            <View
              style={{
                backgroundColor: album!.color!.bgColor as string,
                borderRadius: 16,
                position: "absolute",
                top: 4,
                left: 0,
                right: 0,
                height: "100%",
              }}
            />
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 16,
                padding: 16,
                borderWidth: 2,
                borderColor: album!.color!.color as string,
              }}
            >
              <HStack className="justify-between items-center">
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "Baloo2_700Bold",
                    color: "#1B4B07",
                  }}
                >
                  Tiến độ
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "Baloo2_700Bold",
                    color: album!.color!.color as string,
                  }}
                >
                  {unlockedCount}/{allRewards.length}
                </Text>
              </HStack>
              <View
                style={{
                  width: "100%",
                  height: 8,
                  backgroundColor: "rgba(0,0,0,0.1)",
                  borderRadius: 4,
                  marginTop: 8,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    width: `${(unlockedCount / allRewards.length) * 100}%`,
                    height: "100%",
                    backgroundColor: album!.color!.color as string,
                    borderRadius: 4,
                  }}
                />
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Stickers Grid */}
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingBottom: 120,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-between",
              }}
            >
              {allRewards.map((sticker, index) => (
                <StickerCard
                  key={index}
                  sticker={sticker as any}
                  index={index}
                  onPress={() => handleStickerPress(sticker)}
                />
              ))}
            </View>
          </ScrollView>
        </Animated.View>
      </SafeAreaView>

      {/* Unlock Modal */}
      <UnlockModal
        visible={modalVisible}
        sticker={selectedSticker}
        userStars={userStars}
        onClose={() => {
          setModalVisible(false);
          setSelectedSticker(null);
        }}
        onUnlock={handleUnlock}
      />

      {/* Congratulations Modal */}
      <CongratulationsModal
        visible={congratsModalVisible}
        sticker={selectedSticker as Reward | null}
        onClose={handleCongratsClose}
      />

      {/* Sticker Detail Modal */}
      <StickerDetailModal
        visible={detailModalVisible}
        sticker={selectedDetailSticker as Reward | null}
        onClose={handleDetailClose}
      />
    </View>
  );
}
