import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  StatusBar,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// GlueStack UI Components
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { supabase } from "@/lib/supabase";
import theme from "@/lib/theme";
import { useUserStore } from "@/stores/user.store";
import type { Album as AlbumType } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";

const { width: screenWidth } = Dimensions.get("window");

// Mock data - replace with actual API calls

// Album Card Component with 3D Effect
const AlbumCard = ({
  album,
  index,
  onPress,
}: {
  album: AlbumType;
  index: number;
  onPress: () => void;
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;
  const { user: currentUser } = useUserStore();
  const { data: rewards, error } = useQuery({
    queryKey: ["rewards", album.id],
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
        user_rewards!left (
          claimed_at
        )
      `
        )
        .eq("category", album.id) // album id
        .eq("user_rewards.user_id", currentUser!.id) // user id
        .order("cost", { ascending: true });
      return data?.filter((reward) => reward.user_rewards.length > 0)
    },

    enabled: !!currentUser?.id,
  });
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay: index * 100,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        delay: index * 100,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(pressAnim, {
      toValue: 0.95,
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
  const totalUserRewards = rewards?.length || 0;
  const progress = (totalUserRewards / album.rewards.length) * 100;
  const isComplete = totalUserRewards === album.rewards.length;

  return (
    <Animated.View
      style={{
        transform: [
          { scale: scaleAnim },
          { scale: pressAnim },
          { translateY: slideAnim },
        ],
        marginBottom: 20,
      }}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={{ position: "relative" }}>
          {/* Shadow layer - 3D effect */}
          <View
            style={{
              backgroundColor: album.color.bgColor,
              borderRadius: 24,
              position: "absolute",
              top: 6,
              left: 0,
              right: 0,
              height: "100%",
            }}
          />
          {/* Top layer */}
          <View
            style={{
              backgroundColor: album.color.bgColor,
              borderRadius: 24,
              padding: 20,
              borderWidth: 3,
              borderColor: album.color.color,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            <HStack space="lg" className="items-center">
              {/* Album Icon */}
              <View
                style={{
                  backgroundColor: "white",
                  borderRadius: 20,
                  width: 70,
                  height: 70,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 2,
                  borderColor: album.color.color,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Image
                  source={{ uri: album!.thumbnail! }}
                  style={{ width: "100%", height: "100%" }}
                />
              </View>

              {/* Album Info */}
              <VStack className="flex-1" space="xs">
                <Text
                  style={{
                    color: "#1B4B07",
                    fontSize: 20,
                    fontFamily: "Baloo2_700Bold",
                  }}
                >
                  {album.name}
                </Text>
                {/* <Text
                  style={{
                    color: "#4A5568",
                    fontSize: 14,
                    fontFamily: "NunitoSans_600SemiBold",
                  }}
                  numberOfLines={2}
                >
                  {album.name}
                </Text> */}

                {/* Progress Bar */}
                <View className="mt-2">
                  <View
                    style={{
                      width: "100%",
                      height: 8,
                      backgroundColor: "rgba(0,0,0,0.1)",
                      borderRadius: 4,
                      overflow: "hidden",
                    }}
                  >
                    <View
                      style={{
                        width: `${progress}%`,
                        height: "100%",
                        backgroundColor: album.color.color,
                        borderRadius: 4,
                      }}
                    />
                  </View>
                  <HStack className="justify-between mt-1">
                    <Text
                      style={{
                        fontSize: 12,
                        color: "#4A5568",
                        fontFamily: "NunitoSans_600SemiBold",
                      }}
                    >
                      {totalUserRewards}/{album.rewards.length} sticker
                    </Text>
                    {isComplete && <Text style={{ fontSize: 14 }}>✨</Text>}
                  </HStack>
                </View>
              </VStack>

              {/* Arrow Icon */}
              <Ionicons
                name="chevron-forward"
                size={24}
                color={album.color.color}
              />
            </HStack>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

// Star Display Component
const StarDisplay = ({ count }: { count: number }) => {
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
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
          paddingHorizontal: 20,
          paddingVertical: 12,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 6,
        }}
      >
        <HStack space="sm" className="items-center">
          <Animated.Text
            style={{
              fontSize: 24,
              transform: [{ scale: bounceAnim }],
            }}
          >
            ⭐
          </Animated.Text>
          <Text
            style={{
              color: "white",
              fontSize: 24,
              fontFamily: "Baloo2_700Bold",
            }}
          >
            {count}
          </Text>
        </HStack>
      </View>
    </View>
  );
};

export default function Album() {
  const { user: currentUser } = useUserStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { data, isLoading } = useQuery({
    queryKey: ["albums"],
    queryFn: async () => {
      return supabase
        .from("albums")
        .select("*, rewards(*)")
        .then((res) => res.data);
    },
  });
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

  const handleAlbumPress = (albumId: number) => {
    router.push(`/album/${albumId}` as any);
  };

  return (
    <View className="flex-1">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Background Gradient */}
      <LinearGradient
        colors={["#EEF0FE", "#CAFEC3"]}
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

          <Text
            style={{
              color: "#1B4B07",
              fontSize: 24,
              fontFamily: "Baloo2_700Bold",
            }}
          >
            Bộ sưu tập
          </Text>

          <StarDisplay count={currentUser?.points || 0} />
        </HStack>

        {/* Main Content */}
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingBottom: 120,
            }}
          >
            <VStack space="md" className="mt-4">
              {data?.map((album, index) => (
                <AlbumCard
                  key={album.id}
                  album={album as any}
                  index={index}
                  onPress={() => handleAlbumPress(album.id)}
                />
              ))}
            </VStack>
          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}
