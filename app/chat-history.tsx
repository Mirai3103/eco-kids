import { HStack } from "@/components/ui/hstack";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { db } from "@/stores/db";
import { conversations } from "@/stores/sqlite.schema";
import { Ionicons } from "@expo/vector-icons";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import React, { useRef } from "react";
import {
    Animated,
    ScrollView,
    StatusBar,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Conversation Item Component
const ConversationItem = ({
  conversation,
  index,
  onPress,
}: {
  conversation: typeof conversations.$inferSelect;
  index: number;
  onPress: () => void;
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

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return "Hôm nay";
    } else if (days === 1) {
      return "Hôm qua";
    } else if (days < 7) {
      return `${days} ngày trước`;
    } else {
      return date.toLocaleDateString("vi-VN");
    }
  };

  return (
    <MotiView
      from={{ opacity: 0, translateX: -20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{
        type: "timing",
        duration: 300,
        delay: index * 50,
      }}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 16,
              padding: 16,
              marginHorizontal: 16,
              marginVertical: 8,
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
                    backgroundColor: "#39991815",
                    borderRadius: 12,
                    width: 48,
                    height: 48,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={24}
                    color="#399918"
                  />
                </View>
                <VStack className="flex-1">
                  <Text
                    style={{
                      color: "#1B4B07",
                      fontSize: 16,
                      fontFamily: "NunitoSans_600SemiBold",
                    }}
                    numberOfLines={1}
                  >
                    {conversation.title || "Cuộc trò chuyện"}
                  </Text>
                  <Text
                    style={{
                      color: "#6B7280",
                      fontSize: 14,
                      fontFamily: "NunitoSans_400Regular",
                      marginTop: 2,
                    }}
                  >
                    {formatDate(conversation.updatedAt)}
                  </Text>
                </VStack>
              </HStack>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </HStack>
          </View>
        </Animated.View>
      </Pressable>
    </MotiView>
  );
};

export default function ChatHistoryScreen() {
  const router = useRouter();
  const { data: conversationsData } = useLiveQuery(
    db.query.conversations.findMany({
      orderBy: (conversations, { desc }) => [desc(conversations.updatedAt)],
    })
  );

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

          <Text
            style={{
              flex: 1,
              textAlign: "center",
              color: "#1B4B07",
              fontSize: 20,
              fontFamily: "Baloo2_700Bold",
              marginRight: 40,
            }}
          >
            Lịch sử chat
          </Text>
        </HStack>

        {/* Conversations List */}
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {!conversationsData || conversationsData.length === 0 ? (
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
                    name="chatbubbles-outline"
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
                Chưa có cuộc trò chuyện nào
              </Text>
              <Text
                style={{
                  color: "#6B7280",
                  fontSize: 16,
                  textAlign: "center",
                  fontFamily: "NunitoSans_400Regular",
                }}
              >
                Hãy bắt đầu trò chuyện với Greenie nhé!
              </Text>
            </View>
          ) : (
            <VStack>
              {conversationsData.map((conversation, index) => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  index={index}
                  onPress={() =>
                    router.push(`/conversation-detail?id=${conversation.id}`)
                  }
                />
              ))}
            </VStack>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

