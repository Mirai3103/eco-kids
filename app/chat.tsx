import { Center } from "@/components/ui/center";
import { HStack } from "@/components/ui/hstack";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useCircularReveal } from "@/contexts/CircularRevealContext";
import { useSpeechRecognize } from "@/hooks/useSpeechRecognize";
import useTTSQueue from "@/hooks/useTTSQueue";
import { generate } from "@/lib/flow";
import { db } from "@/stores/db";
import { useIdStore } from "@/stores/id.store";
import { messages } from "@/stores/sqlite.schema";
import { Ionicons } from "@expo/vector-icons";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// 3D Button Component
const Button3D = ({
  onPress,
  onPressIn,
  onPressOut,
  children,
  size = "medium",
  color = "#399918",
  shadowColor = "#2a800d",
  disabled = false,
}: {
  onPress: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  children: React.ReactNode;
  size?: "small" | "medium" | "large";
  color?: string;
  shadowColor?: string;
  disabled?: boolean;
}) => {
  const buttonSize = size === "small" ? 40 : size === "large" ? 60 : 50;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <View className="relative">
        {/* Shadow layer */}
        <View
          style={{
            backgroundColor: shadowColor,
            width: buttonSize,
            height: buttonSize,
            borderRadius: buttonSize / 2,
            position: "absolute",
            top: 4,
            left: 0,
          }}
        />
        {/* Top layer */}
        <View
          style={{
            backgroundColor: color,
            width: buttonSize,
            height: buttonSize,
            borderRadius: buttonSize / 2,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {children}
        </View>
      </View>
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
        delay: index * 50,
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

export default function ChatScreen() {
  const router = useRouter();
  const chatId = useIdStore((state) => state.id);
  const resetId = useIdStore((state) => state.resetId);
  const { data: messagesData } = useLiveQuery(
    db.query.messages.findMany({
      where: eq(messages.conversationId, chatId),
    }),[chatId]
  );
  const { playFastTTS } = useTTSQueue();

  const abortController = useRef<AbortController>(new AbortController());
  const [status, setStatus] = useState<
    "streaming" | "submitted" | "ready" | "error"
  >("ready");
  const [testText, setTestText] = useState("");

  const streamBuffer = useRef("");
  const lastPlayedSentence = useRef("");

  const handleSendMessage = useCallback(
    async (message: string) => {
      abortController.current.abort();
      abortController.current = new AbortController();

      // Reset buffer khi bắt đầu stream mới
      streamBuffer.current = "";
      lastPlayedSentence.current = "";

      function onChunk(chunk: string) {
        setTestText((prev) => prev + chunk);

        // Thêm chunk vào buffer
        streamBuffer.current += chunk;

        // Tìm câu hoàn chỉnh (kết thúc bằng .!?)
        const sentenceRegex = /[^.!?]*[.!?]+/g;
        const sentences = streamBuffer.current.match(sentenceRegex);

        if (sentences && sentences.length > 0) {
          // Lấy câu cuối cùng hoàn chỉnh
          const completeSentence = sentences[sentences.length - 1].trim();

          // Chỉ phát nếu câu này chưa được phát
          if (
            completeSentence &&
            completeSentence !== lastPlayedSentence.current
          ) {
            lastPlayedSentence.current = completeSentence;

            // Phát audio cho câu này
            playFastTTS(completeSentence).catch((err) => {
              console.error("TTS error:", err);
            });

            // Xóa các câu đã phát khỏi buffer, giữ lại phần chưa hoàn chỉnh
            const lastSentenceEnd =
              streamBuffer.current.lastIndexOf(completeSentence) +
              completeSentence.length;
            streamBuffer.current =
              streamBuffer.current.substring(lastSentenceEnd);
          }
        }
      }

      try {
        setStatus("streaming");
        await generate(
          message,
          chatId,
          abortController.current.signal,
          onChunk
        );

        // Sau khi stream xong, phát phần còn lại (nếu có)
        if (
          streamBuffer.current.trim() &&
          streamBuffer.current.trim() !== lastPlayedSentence.current
        ) {
          await playFastTTS(streamBuffer.current.trim());
        }
      } catch (error) {
        console.log(error);
        setTestText("");
        setStatus("error");
      } finally {
        setStatus("ready");
        setTestText("");
        streamBuffer.current = "";
        lastPlayedSentence.current = "";
      }
    },
    [chatId, playFastTTS]
  );
  const { isRecording, startRecognize, stopRecognize } = useSpeechRecognize({
    onSpeechStart() {
    },
    onSpeechResults(e) {
      const recognizedText = e.value[e.value.length - 1];
      handleSendMessage(recognizedText);
    },
  });
  const [inputText, setInputText] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const { completeReveal, isAnimating } = useCircularReveal();

  // Complete the circular reveal animation when component mounts
  useEffect(() => {
    if (isAnimating) {
      // Wait for the animation to complete before clearing
      const timer = setTimeout(() => {
        completeReveal();
      }, 650); // Slightly longer than the animation duration (600ms + 50ms buffer)

      return () => clearTimeout(timer);
    }
  }, []);

  // Auto scroll to bottom when new message arrives
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messagesData]);

  const handleSend = async () => {
    if (inputText.trim() && status !== "streaming") {
      handleSendMessage(inputText);
      setInputText("");
    }
  };

  const handleMicPress = () => {
    if (isRecording) {
      stopRecognize();
    } else {
      if (status === "streaming" || status === "submitted") return;
      startRecognize("vi-VN");
    }
  };

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
  const handleRefresh = () => {
    resetId();
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
        colors={["#EEF0FE", "#CAFEC3"]}
        style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          {/* Header */}
          <HStack
            className="items-center px-4 py-3"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderBottomLeftRadius: 20,
              borderBottomRightRadius: 20,
            }}
          >
            <Pressable onPress={() => router.push("/(tabs)")}>
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

            <HStack className="flex-1 items-center justify-center">
              <ExpoImage
                source={require("@/assets/images/assistant_icon.png")}
                style={{ width: 40, height: 40, marginRight: 8 }}
                contentFit="contain"
              />
              <VStack>
                <Text
                  style={{
                    color: "#1B4B07",
                    fontSize: 18,
                    fontFamily: "Baloo2_700Bold",
                  }}
                >
                  Greenie
                </Text>
                <Text
                  style={{
                    color: "#666",
                    fontSize: 12,
                    fontFamily: "NunitoSans_600SemiBold",
                  }}
                >
                  Trợ lý AI của bé
                </Text>
              </VStack>
           
            </HStack>

            <Pressable onPress={handleRefresh}>
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
                <Ionicons name="refresh-outline" size={24} color="#399918" />
              </View>
            </Pressable>
          </HStack>

          {/* Messages Area */}
          <ScrollView
            ref={scrollViewRef}
            className="flex-1"
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          >
            {messagesData?.length === 0 ? (
              <Center className="flex-1 px-4 mt-20">
                <MotiView
                  from={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: "spring",
                    damping: 15,
                    delay: 200,
                  }}
                >
                  <ExpoImage
                    source={require("@/assets/images/assistant_icon.png")}
                    style={{ width: 100, height: 100, marginBottom: 16 }}
                    contentFit="contain"
                  />
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
                  Xin chào! 👋
                </Text>
                <Text
                  style={{
                    color: "#666",
                    fontSize: 16,
                    textAlign: "center",
                    fontFamily: "NunitoSans_600SemiBold",
                  }}
                >
                  Mình là Greenie, trợ lý của bé về môi trường xanh!
                </Text>
              </Center>
            ) : (
              <VStack>
                {messagesData
                  ?.filter((msg) => !!msg.textContent)
                  ?.map((msg: typeof messages.$inferSelect, index) => (
                    <ChatBubble
                      key={msg.id}
                      message={msg.textContent as string}
                      isUser={msg.role === "user"}
                      index={index}
                    />
                  ))}
                {status === "streaming" && (
                  // <HStack className="justify-start px-4">
                  //   <ExpoImage
                  //     source={require("@/assets/images/assistant_icon.png")}
                  //     style={{
                  //       width: 36,
                  //       height: 36,
                  //       borderRadius: 18,
                  //       marginRight: 8,
                  //     }}
                  //     contentFit="contain"
                  //   />
                  //   <View
                  //     style={{
                  //       backgroundColor: "white",
                  //       borderRadius: 20,
                  //       padding: 16,
                  //       shadowColor: "#000",
                  //       shadowOffset: { width: 0, height: 2 },
                  //       shadowOpacity: 0.1,
                  //       shadowRadius: 4,
                  //       elevation: 3,
                  //     }}
                  //   >
                  //     <Spinner size="small" color="#399918" />
                  //   </View>
                  // </HStack>
                  <ChatBubble message={testText} isUser={false} index={0} />
                )}
              </VStack>
            )}
          </ScrollView>

          {/* Input Bar */}
          <View
            style={{
              backgroundColor: "white",
              paddingHorizontal: 16,
              paddingVertical: 12,
              paddingBottom: Platform.OS === "ios" ? 24 : 12,
              borderTopLeftRadius: 25,
              borderTopRightRadius: 25,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 10,
            }}
          >
            <HStack className="items-center" space="md">
              {/* Mic Button */}
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Button3D
                  onPress={handleMicPress}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  disabled={status !== "ready"}
                  color={isRecording ? "#D72654" : "#399918"}
                  shadowColor={isRecording ? "#a01a3f" : "#2a800d"}
                >
                  <Ionicons
                    name={isRecording ? "stop" : "mic"}
                    size={24}
                    color="white"
                  />
                </Button3D>
              </Animated.View>

              {/* Text Input */}
              <View
                style={{
                  flex: 1,
                  backgroundColor: "#F5F5F5",
                  borderRadius: 25,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                }}
              >
                <TextInput
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="Nhập tin nhắn..."
                  placeholderTextColor="#999"
                  style={{
                    fontSize: 16,
                    fontFamily: "NunitoSans_600SemiBold",
                    color: "#1B4B07",
                  }}
                  multiline
                  maxLength={500}
                  onSubmitEditing={handleSend}
                />
              </View>

              {/* Send Button */}
              <Button3D
                onPress={handleSend}
                color="#399918"
                shadowColor="#2a800d"
                disabled={!inputText.trim() || status !== "ready"}
              >
                <Ionicons name="send" size={20} color="white" />
              </Button3D>
            </HStack>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
// interface IMessage {
//   role: Role;
//   content: string  | { type: "text"; text: string } | { type: "text"; text: string }[] ;
// }
