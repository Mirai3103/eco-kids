import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";

import {
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  StatusBar,
  Switch,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// GlueStack UI Components
import { ConfirmModal } from "@/components/ConfirmModal";
import { HStack } from "@/components/ui/hstack";
import { SelectionModal } from "@/components/ui/SelectionModal";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { supabase } from "@/lib/supabase";
import { useSettingStore } from "@/stores/setting.store";
import { useUserStore } from "@/stores/user.store";
const { width: screenWidth } = Dimensions.get("window");

// Custom Header Component for Settings
const SettingsHeader = () => {
  const router = useRouter();

  return (
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

      <Text
        style={{
          color: "#1B4B07",
          fontSize: 20,
          fontFamily: "Baloo2_700Bold",
        }}
      >
        Cài đặt
      </Text>

      {/* Placeholder for balance */}
      <View style={{ width: 40, height: 40 }} />
    </HStack>
  );
};

// Settings Item Component
const SettingsItem = ({
  icon,
  title,
  subtitle,
  onPress,
  showArrow = true,
  rightContent,
  color = "#399918",
}: {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showArrow?: boolean;
  rightContent?: React.ReactNode;
  color?: string;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
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
      disabled={!onPress}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 16,
            padding: 16,
            marginHorizontal: 16,
            marginVertical: 6,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <HStack className="items-center justify-between">
            <HStack className="items-center flex-1" space="md">
              <View
                style={{
                  backgroundColor: `${color}15`,
                  borderRadius: 12,
                  width: 48,
                  height: 48,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons name={icon as any} size={24} color={color} />
              </View>
              <VStack className="flex-1">
                <Text
                  style={{
                    color: "#1B4B07",
                    fontSize: 16,
                    fontFamily: "NunitoSans_600SemiBold",
                  }}
                >
                  {title}
                </Text>
                {subtitle && (
                  <Text
                    style={{
                      color: "#6B7280",
                      fontSize: 14,
                      fontFamily: "NunitoSans_400Regular",
                      marginTop: 2,
                    }}
                  >
                    {subtitle}
                  </Text>
                )}
              </VStack>
            </HStack>
            {rightContent ||
              (showArrow && (
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              ))}
          </HStack>
        </View>
      </Animated.View>
    </Pressable>
  );
};

// Section Header Component
const SectionHeader = ({ title }: { title: string }) => (
  <Text
    style={{
      color: "#1B4B07",
      fontSize: 18,
      fontFamily: "Baloo2_700Bold",
      marginLeft: 16,
      marginTop: 24,
      marginBottom: 8,
    }}
  >
    {title}
  </Text>
);

// 3D Logout Button Component
const LogoutButton = ({ onPress }: { onPress: () => void }) => {
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

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <View className="relative mx-4 mb-8">
          {/* Shadow/Bottom layer */}
          <View
            style={{
              backgroundColor: "#C53030",
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
              backgroundColor: "#E53E3E",
              height: 56,
              borderRadius: 16,
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "row",
            }}
          >
            <Ionicons name="log-out-outline" size={24} color="white" />
            <Text
              style={{
                color: "white",
                fontSize: 18,
                fontFamily: "Baloo2_700Bold",
                marginLeft: 8,
              }}
            >
              Đăng xuất
            </Text>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
};

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useUserStore();
  const {
    isDefaultAutoPlay,
    defaultLanguage,
    defaultGender,
    setIsDefaultAutoPlay,
    setDefaultLanguage,
    setDefaultGender,
  } = useSettingStore();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Modal states
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [genderModalVisible, setGenderModalVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  const confirmLogout = async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
      // Clear user store
      logout();
      // Navigate to login
      router.replace("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
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
        <SettingsHeader />

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {/* Profile Section */}
          <SectionHeader title="Hồ sơ cá nhân" />
          <SettingsItem
            icon="person-outline"
            title="Thông tin cá nhân"
            subtitle="Chỉnh sửa tên, avatar và ngày sinh"
            onPress={() => router.push("/profile-edit")}
            color="#3B82F6"
          />
          <SettingsItem
            icon="trophy-outline"
            title="Thành tích"
            subtitle="Xem các huy hiệu và thành tựu đã đạt được"
            onPress={() => console.log("View achievements")}
            color="#F59E0B"
          />

          {/* App Preferences */}
          <SectionHeader title="Tùy chọn ứng dụng" />
          <SettingsItem
            icon="notifications-outline"
            title="Thông báo"
            subtitle="Nhận thông báo về truyện mới và hoạt động"
            showArrow={false}
            rightContent={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: "#E5E7EB", true: "#399918" }}
                thumbColor={notificationsEnabled ? "#ffffff" : "#f4f3f4"}
              />
            }
            color="#8B5CF6"
          />
          <SettingsItem
            icon="volume-high-outline"
            title="Âm thanh"
            subtitle="Bật/tắt âm thanh trong ứng dụng"
            showArrow={false}
            rightContent={
              <Switch
                value={soundEnabled}
                onValueChange={setSoundEnabled}
                trackColor={{ false: "#E5E7EB", true: "#399918" }}
                thumbColor={soundEnabled ? "#ffffff" : "#f4f3f4"}
              />
            }
            color="#EF4444"
          />
          <SettingsItem
            icon="play-outline"
            title="Tự động phát"
            subtitle="Tự động chuyển trang khi đọc truyện"
            showArrow={false}
            rightContent={
              <Switch
                value={isDefaultAutoPlay}
                onValueChange={setIsDefaultAutoPlay}
                trackColor={{ false: "#E5E7EB", true: "#399918" }}
                thumbColor={isDefaultAutoPlay ? "#ffffff" : "#f4f3f4"}
              />
            }
            color="#06B6D4"
          />
          <SettingsItem
            icon="language-outline"
            title="Ngôn ngữ mặc định"
            subtitle={defaultLanguage === "vi" ? "Tiếng Việt" : "Tiếng Anh"}
            onPress={() => setLanguageModalVisible(true)}
            color="#10B981"
          />
          <SettingsItem
            icon="male-female-outline"
            title="Giới tính mặc định"
            subtitle={defaultGender === "male" ? "Nam" : "Nữ"}
            onPress={() => setGenderModalVisible(true)}
            color="#F59E0B"
          />

          {/* Content & Reading */}
          <SectionHeader title="Nội dung & Đọc truyện" />
          <SettingsItem
            icon="download-outline"
            title="Tải xuống"
            subtitle="Quản lý truyện đã tải về"
            onPress={() => { router.push("/manage-downloads") }}
            color="#EC4899"
          />
          <SettingsItem
            icon="text-outline"
            title="Cỡ chữ"
            subtitle="Điều chỉnh kích thước văn bản"
            onPress={() => console.log("Text size")}
            color="#F97316"
          />
          <SettingsItem
            icon="color-palette-outline"
            title="Giao diện"
            subtitle="Chế độ sáng/tối và màu sắc"
            onPress={() => console.log("Theme settings")}
            color="#A855F7"
          />

          {/* Support & About */}
          <SectionHeader title="Hỗ trợ & Thông tin" />
          <SettingsItem
            icon="help-circle-outline"
            title="Trợ giúp"
            subtitle="Hướng dẫn sử dụng và FAQ"
            onPress={() => console.log("Help")}
            color="#059669"
          />
          <SettingsItem
            icon="mail-outline"
            title="Liên hệ"
            subtitle="Gửi phản hồi và báo lỗi"
            onPress={() => router.push("/album/1")}
            color="#DC2626"
          />
          <SettingsItem
            icon="shield-checkmark-outline"
            title="Chính sách bảo mật"
            subtitle="Điều khoản sử dụng và quyền riêng tư"
            onPress={() => router.push("/album")}
            color="#7C3AED"
          />
          <SettingsItem
            icon="information-circle-outline"
            title="Về EcoKids"
            subtitle="Phiên bản 1.0.0"
            onPress={() => router.push("/demo")}
            color="#0891B2"
          />

          {/* Logout Button */}
          <View className="mt-8">
            <LogoutButton onPress={handleLogout} />
          </View>
        </ScrollView>

        {/* Modals */}
        <SelectionModal
          visible={languageModalVisible}
          onClose={() => setLanguageModalVisible(false)}
          title="Chọn ngôn ngữ mặc định"
          options={[
            { label: "Tiếng Việt", value: "vi", emoji: "🇻🇳", color: "#EF4444" },
            { label: "Tiếng Anh", value: "en", emoji: "🇺🇸", color: "#3B82F6" },
          ]}
          onSelect={setDefaultLanguage}
          selectedValue={defaultLanguage}
        />

        <SelectionModal
          visible={genderModalVisible}
          onClose={() => setGenderModalVisible(false)}
          title="Chọn giới tính mặc định"
          options={[
            { label: "Nam", value: "male", icon: "male-outline", color: "#3B82F6" },
            { label: "Nữ", value: "female", icon: "female-outline", color: "#EC4899" },
          ]}
          onSelect={setDefaultGender}
          selectedValue={defaultGender}
        />

        <ConfirmModal
          visible={logoutModalVisible}
          onClose={() => setLogoutModalVisible(false)}
          onConfirm={confirmLogout}
          title="Bạn có chắc chắn muốn đăng xuất không?"
          confirmText="Xác nhận"
          cancelText="Hủy"
          confirmColor="#399918"
          cancelColor="#E53E3E"
          icon="log-out-outline"
          iconColor="#F59E0B"
        />
      </SafeAreaView>
    </View>
  );
}
