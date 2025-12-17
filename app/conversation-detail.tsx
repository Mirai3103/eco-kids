import { HStack } from "@/components/ui/hstack";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { db } from "@/stores/db";
import { useIdStore } from "@/stores/id.store";
import { conversations, messages } from "@/stores/sqlite.schema";
import { Ionicons } from "@expo/vector-icons";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MotiView } from "moti";
import React, { useRef, useState } from "react";
import {
    Animated,
    ScrollView,
    StatusBar,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// 3D Button Component
const Button3D = ({
  onPress,
  children,
  color = "#399918",
  shadowColor = "#2a800d",
  disabled = false,
}: {
  onPress: () => void;
  children: React.ReactNode;
  color?: string;
  shadowColor?: string;
  disabled?: boolean;
}) => {
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
      disabled={disabled}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <View className="relative">
          {/* Shadow layer */}
          <View
            style={{
              backgroundColor: shadowColor,
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
              backgroundColor: color,
              height: 56,
              borderRadius: 16,
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "row",
              paddingHorizontal: 24,
            }}
          >
            {children}
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
};

// Chat Bubble Component
const ChatBubble = ({
  message,
  isUser,
  index,
}: {
  message: string;
  isUser: boolean;
  index: number;
}) => {
  if (message.trim() === "") return null;
  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        type: "timing",
        duration: 300,
        delay: index * 30,
      }}
    >
      <HStack
        className={`mb-4 ${isUser ? "justify-end" : "justify-start"}`}
        style={{ paddingHorizontal: 16 }}
      >
        {!isUser && (
          <ExpoImage
            source={require("@/assets/images/assistant_icon.png")}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              marginRight: 8,
            }}
            contentFit="contain"
          />
        )}
        <View
          style={{
            backgroundColor: isUser ? "#399918" : "white",
            borderRadius: 20,
            padding: 12,
            paddingHorizontal: 16,
            maxWidth: "70%",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Text
            style={{
              color: isUser ? "white" : "#1B4B07",
              fontSize: 15,
              fontFamily: "NunitoSans_600SemiBold",
            }}
          >
            {message}
          </Text>
        </View>
      </HStack>
    </MotiView>
  );
};

export default function ConversationDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const conversationId = params.id as string;
  const { setId } = useIdStore();
  const [showSuccess, setShowSuccess] = useState(false);

  const { data: conversationData } = useLiveQuery(
    db.query.conversations.findFirst({
      where: eq(conversations.id, conversationId),
    })
  );

  const { data: messagesData } = useLiveQuery(
    db.query.messages.findMany({
      where: eq(messages.conversationId, conversationId),
      orderBy: (messages, { asc }) => [asc(messages.createdAt)],
    })
  );

  const handleRecover = () => {
    setId(conversationId);
    setShowSuccess(true);
    setTimeout(() => {
      router.push("/chat");
    }, 1000);
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
        <HStack
          className="items-center px-4 py-3"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
          }}
        >
          <Pressable onPress={() => router.back()}>
            <View
              style={{
                backgroundColor: "#F0F0F0",
                width: 40,
                height: 40,
                borderRadius: 20,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="arrow-back" size={24} color="#399918" />
            </View>
          </Pressable>

          <VStack className="flex-1" style={{ marginLeft: 12 }}>
            <Text
              style={{
                color: "#1B4B07",
                fontSize: 18,
                fontFamily: "Baloo2_700Bold",
              }}
              numberOfLines={1}
            >
              {conversationData?.title || "Cuộc trò chuyện"}
            </Text>
            <Text
              style={{
                color: "#6B7280",
                fontSize: 12,
                fontFamily: "NunitoSans_400Regular",
              }}
            >
              {messagesData?.length || 0} tin nhắn
            </Text>
          </VStack>

          <View style={{ width: 40 }} />
        </HStack>

        {/* Messages Area */}
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {!messagesData || messagesData.length === 0 ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                marginTop: 100,
                paddingHorizontal: 32,
              }}
            >
              <MotiView
                from={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: "spring",
                  damping: 15,
                  delay: 200,
                }}
              >
                <View
                  style={{
                    backgroundColor: "#39991815",
                    borderRadius: 60,
                    width: 120,
                    height: 120,
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 24,
                  }}
                >
                  <Ionicons
                    name="chatbubble-outline"
                    size={60}
                    color="#399918"
                  />
                </View>
              </MotiView>
              <Text
                style={{
                  color: "#1B4B07",
                  fontSize: 20,
                  textAlign: "center",
                  fontFamily: "Baloo2_700Bold",
                  marginBottom: 8,
                }}
              >
                Không có tin nhắn
              </Text>
            </View>
          ) : (
            <VStack>
              {messagesData
                .filter((msg) => !!msg.textContent)
                .map((msg, index) => (
                  <ChatBubble
                    key={msg.id}
                    message={msg.textContent as string}
                    isUser={msg.role === "user"}
                    index={index}
                  />
                ))}
            </VStack>
          )}
        </ScrollView>

        {/* Recover Button */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "white",
            paddingHorizontal: 16,
            paddingVertical: 12,
            paddingBottom: 24,
            borderTopLeftRadius: 25,
            borderTopRightRadius: 25,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 10,
          }}
        >
          <Button3D
            onPress={handleRecover}
            color="#399918"
            shadowColor="#2a800d"
          >
            <Ionicons name="refresh" size={24} color="white" />
            <Text
              style={{
                color: "white",
                fontSize: 18,
                fontFamily: "Baloo2_700Bold",
                marginLeft: 8,
              }}
            >
              Khôi phục cuộc trò chuyện
            </Text>
          </Button3D>
        </View>

        {/* Success Message */}
        {showSuccess && (
          <MotiView
            from={{ opacity: 0, scale: 0.8, translateY: -20 }}
            animate={{ opacity: 1, scale: 1, translateY: 0 }}
            style={{
              position: "absolute",
              top: 100,
              left: 0,
              right: 0,
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            <View
              style={{
                backgroundColor: "#399918",
                borderRadius: 16,
                padding: 16,
                paddingHorizontal: 24,
                marginHorizontal: 32,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <HStack className="items-center" space="md">
                <Ionicons name="checkmark-circle" size={24} color="white" />
                <Text
                  style={{
                    color: "white",
                    fontSize: 16,
                    fontFamily: "NunitoSans_600SemiBold",
                  }}
                >
                  Đã khôi phục cuộc trò chuyện!
                </Text>
              </HStack>
            </View>
          </MotiView>
        )}
      </SafeAreaView>
    </View>
  );
}

