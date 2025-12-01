import { Ionicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    Animated,
    Dimensions,
    Pressable,
    ScrollView,
    StatusBar,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Components
import { AvatarSelectionModal } from "@/components/AvatarSelectionModal";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

// Hooks & Store
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/stores/user.store";
import type { Reward } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const { width: screenWidth } = Dimensions.get("window");

// Input Field Component
const InputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  editable = true,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  icon: string;
  editable?: boolean;
}) => {
  return (
    <VStack space="xs" className="mb-4">
      <Text
        style={{
          color: "#1B4B07",
          fontSize: 16,
          fontFamily: "NunitoSans_600SemiBold",
          marginLeft: 4,
        }}
      >
        {label}
      </Text>
      <View
        style={{
          backgroundColor: "white",
          borderRadius: 16,
          padding: 16,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <HStack space="md" className="items-center">
          <View
            style={{
              backgroundColor: "#E8F5E8",
              borderRadius: 12,
              width: 40,
              height: 40,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name={icon as any} size={20} color="#399918" />
          </View>
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            editable={editable}
            style={{
              flex: 1,
              color: "#1B4B07",
              fontSize: 16,
              fontFamily: "NunitoSans_400Regular",
            }}
          />
        </HStack>
      </View>
    </VStack>
  );
};

// Date Picker Component (Simple)
const DatePickerField = ({
  label,
  value,
  onChange,
  icon,
}: {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;
  icon: string;
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [day, setDay] = useState(value?.getDate().toString() || "");
  const [month, setMonth] = useState(
    value ? (value.getMonth() + 1).toString() : ""
  );
  const [year, setYear] = useState(value?.getFullYear().toString() || "");

  const handleApply = () => {
    const d = parseInt(day);
    const m = parseInt(month);
    const y = parseInt(year);

    if (d && m && y && d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 1900) {
      const date = new Date(y, m - 1, d);
      onChange(date);
      setShowPicker(false);
    } else {
      Alert.alert("Lỗi", "Ngày sinh không hợp lệ");
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Chọn ngày sinh";
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <VStack space="xs" className="mb-4">
      <Text
        style={{
          color: "#1B4B07",
          fontSize: 16,
          fontFamily: "NunitoSans_600SemiBold",
          marginLeft: 4,
        }}
      >
        {label}
      </Text>
      <Pressable onPress={() => setShowPicker(!showPicker)}>
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 16,
            padding: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <HStack space="md" className="items-center justify-between">
            <HStack space="md" className="items-center flex-1">
              <View
                style={{
                  backgroundColor: "#FEF3C7",
                  borderRadius: 12,
                  width: 40,
                  height: 40,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons name={icon as any} size={20} color="#F59E0B" />
              </View>
              <Text
                style={{
                  color: value ? "#1B4B07" : "#9CA3AF",
                  fontSize: 16,
                  fontFamily: "NunitoSans_400Regular",
                }}
              >
                {formatDate(value)}
              </Text>
            </HStack>
            <Ionicons
              name={showPicker ? "chevron-up" : "chevron-down"}
              size={20}
              color="#9CA3AF"
            />
          </HStack>
        </View>
      </Pressable>

      {/* Date Picker Expanded */}
      {showPicker && (
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 16,
            padding: 20,
            marginTop: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Text
            style={{
              color: "#1B4B07",
              fontSize: 14,
              fontFamily: "NunitoSans_600SemiBold",
              marginBottom: 12,
            }}
          >
            Nhập ngày sinh
          </Text>

          <HStack space="sm" className="mb-4">
            {/* Day */}
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 12,
                  color: "#6B7280",
                  marginBottom: 4,
                  fontFamily: "NunitoSans_400Regular",
                }}
              >
                Ngày
              </Text>
              <TextInput
                value={day}
                onChangeText={setDay}
                placeholder="DD"
                keyboardType="number-pad"
                maxLength={2}
                style={{
                  backgroundColor: "#F3F4F6",
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  textAlign: "center",
                  fontFamily: "NunitoSans_600SemiBold",
                }}
              />
            </View>

            {/* Month */}
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 12,
                  color: "#6B7280",
                  marginBottom: 4,
                  fontFamily: "NunitoSans_400Regular",
                }}
              >
                Tháng
              </Text>
              <TextInput
                value={month}
                onChangeText={setMonth}
                placeholder="MM"
                keyboardType="number-pad"
                maxLength={2}
                style={{
                  backgroundColor: "#F3F4F6",
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  textAlign: "center",
                  fontFamily: "NunitoSans_600SemiBold",
                }}
              />
            </View>

            {/* Year */}
            <View style={{ flex: 1.5 }}>
              <Text
                style={{
                  fontSize: 12,
                  color: "#6B7280",
                  marginBottom: 4,
                  fontFamily: "NunitoSans_400Regular",
                }}
              >
                Năm
              </Text>
              <TextInput
                value={year}
                onChangeText={setYear}
                placeholder="YYYY"
                keyboardType="number-pad"
                maxLength={4}
                style={{
                  backgroundColor: "#F3F4F6",
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  textAlign: "center",
                  fontFamily: "NunitoSans_600SemiBold",
                }}
              />
            </View>
          </HStack>

          <Pressable onPress={handleApply}>
            <View
              style={{
                backgroundColor: "#22C55E",
                borderRadius: 12,
                padding: 12,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 16,
                  fontFamily: "NunitoSans_600SemiBold",
                }}
              >
                Áp dụng
              </Text>
            </View>
          </Pressable>
        </View>
      )}
    </VStack>
  );
};

// Save Button Component
const SaveButton = ({
  onPress,
  isLoading,
}: {
  onPress: () => void;
  isLoading: boolean;
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

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

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isLoading}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <View className="relative mx-4">
          {/* Shadow layer */}
          <View
            style={{
              backgroundColor: "#16A34A",
              height: 56,
              borderRadius: 16,
              position: "absolute",
              top: 4,
              left: 0,
              right: 0,
            }}
          />
          {/* Top layer */}
          <View
            style={{
              backgroundColor: isLoading ? "#9CA3AF" : "#22C55E",
              height: 56,
              borderRadius: 16,
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "row",
            }}
          >
            {isLoading ? (
              <Ionicons name="hourglass-outline" size={24} color="white" />
            ) : (
              <Ionicons name="checkmark-circle" size={24} color="white" />
            )}
            <Text
              style={{
                color: "white",
                fontSize: 18,
                fontFamily: "Baloo2_700Bold",
                marginLeft: 8,
              }}
            >
              {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
            </Text>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
};

export default function ProfileEditScreen() {
  const queryClient = useQueryClient();
  const { user, updateUser, updateUserAvatar } = useUserStore();

  // Local state
  const [name, setName] = useState(user?.name || "");
  const [birthday, setBirthday] = useState<Date | null>(
    user?.birthdday ? new Date(user.birthdday) : null
  );
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);

  // Fetch unlocked rewards for avatar selection
  const { data: unlockedRewards } = useQuery({
    queryKey: ["user-rewards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_rewards")
        .select("*, rewards(*)")
        .eq("user_id", user!.id);
      return data;
    },
    select: (data) => {
      return data?.map((reward) => reward.rewards) || [];
    },
    enabled: !!user?.id,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { name: string; birthdday: string | null }) => {
      const { data: result, error } = await supabase
        .from("users")
        .update(data)
        .eq("id", user!.id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (data) => {
      updateUser({
        name: data.name || undefined,
        birthdday: data.birthdday || undefined,
      });
      Alert.alert("Thành công", "Đã cập nhật thông tin cá nhân", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    },
    onError: (error) => {
      console.error("Update profile error:", error);
      Alert.alert("Lỗi", "Không thể cập nhật thông tin. Vui lòng thử lại.");
    },
  });

  // Update avatar mutation
  const updateAvatarMutation = useMutation({
    mutationFn: async (avatar: string) => {
      const { data, error } = await supabase
        .from("users")
        .update({ avatar_url: avatar })
        .eq("id", user!.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      const avatar = data?.avatar_url;
      if (avatar) {
        updateUserAvatar(avatar);
        setAvatarModalVisible(false);
        Alert.alert("Thành công", "Đã cập nhật avatar");
      }
    },
    onError: (error) => {
      console.error("Update avatar error:", error);
      Alert.alert("Lỗi", "Không thể cập nhật avatar. Vui lòng thử lại.");
    },
  });

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên");
      return;
    }

    updateProfileMutation.mutate({
      name: name.trim(),
      birthdday: birthday ? birthday.toISOString().split("T")[0] : null,
    });
  };

  const handleAvatarSelect = (imageUrl: string) => {
    updateAvatarMutation.mutate(imageUrl);
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Gradient Background */}
      <LinearGradient
        colors={["#EEF0FE", "#CAFEC3"]}
        style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <HStack className="justify-between items-center px-6 py-4">
          <Pressable
            onPress={() => router.back()}
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

          <Heading
            size="xl"
            style={{
              color: "#1B4B07",
              fontFamily: "Baloo2_700Bold",
            }}
          >
            Chỉnh sửa hồ sơ
          </Heading>

          <View style={{ width: 40 }} />
        </HStack>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {/* Avatar Section */}
          <VStack space="md" className="items-center mt-6 mb-8">
            <Pressable onPress={() => setAvatarModalVisible(true)}>
              <View style={{ position: "relative" }}>
                <ExpoImage
                  source={{ uri: user?.avatar }}
                  cachePolicy={"memory-disk"}
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 60,
                    borderWidth: 4,
                    borderColor: "white",
                  }}
                  alt="User Avatar"
                />
                <View
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    backgroundColor: "#4285f4",
                    borderRadius: 18,
                    width: 36,
                    height: 36,
                    justifyContent: "center",
                    alignItems: "center",
                    borderWidth: 3,
                    borderColor: "white",
                  }}
                >
                  <Ionicons name="pencil" size={16} color="white" />
                </View>
              </View>
            </Pressable>
            <Text
              style={{
                color: "#6B7280",
                fontSize: 14,
                fontFamily: "NunitoSans_400Regular",
              }}
            >
              Nhấn để thay đổi avatar
            </Text>
          </VStack>

          {/* Form Section */}
          <VStack space="lg" className="px-6">
            <InputField
              label="Tên của bé"
              value={name}
              onChangeText={setName}
              placeholder="Nhập tên của bé"
              icon="person-outline"
            />

            <DatePickerField
              label="Ngày sinh"
              value={birthday}
              onChange={setBirthday}
              icon="calendar-outline"
            />

            {/* Info Card */}
            <View
              style={{
                backgroundColor: "#FEF3C7",
                borderRadius: 16,
                padding: 16,
                marginTop: 8,
              }}
            >
              <HStack space="md" className="items-start">
                <Ionicons name="information-circle" size={24} color="#F59E0B" />
                <Text
                  style={{
                    flex: 1,
                    color: "#92400E",
                    fontSize: 14,
                    lineHeight: 20,
                    fontFamily: "NunitoSans_400Regular",
                  }}
                >
                  Thông tin này giúp chúng tôi cung cấp nội dung phù hợp với độ
                  tuổi của bé
                </Text>
              </HStack>
            </View>
          </VStack>
        </ScrollView>

        {/* Save Button - Fixed at bottom */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "transparent",
            paddingTop: 20,
            paddingBottom: 40,
          }}
        >
          <LinearGradient
            colors={["rgba(238, 240, 254, 0)", "rgba(238, 240, 254, 1)"]}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
            }}
          />
          <SaveButton
            onPress={handleSave}
            isLoading={updateProfileMutation.isPending}
          />
        </View>
      </SafeAreaView>

      {/* Avatar Selection Modal */}
      <AvatarSelectionModal
        visible={avatarModalVisible}
        rewards={(unlockedRewards as Reward[]) || []}
        currentAvatar={user?.avatar || ""}
        onClose={() => setAvatarModalVisible(false)}
        onSelect={handleAvatarSelect}
        isLoading={updateAvatarMutation.isPending}
      />
    </View>
  );
}

