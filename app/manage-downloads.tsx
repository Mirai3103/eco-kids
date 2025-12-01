import { Feather, Ionicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    Animated,
    Dimensions,
    FlatList,
    Pressable,
    RefreshControl,
    StatusBar,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Components
import LoadingScreen from "@/components/LoadingScreen";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

// Hooks
import { useOfflineStories } from "@/hooks/useOfflineStories";
import type { StoryWithSegments } from "@/types";

const { width: screenWidth } = Dimensions.get("window");

// Story Card Component
const StoryCard = ({
  story,
  onDelete,
  onPress,
}: {
  story: StoryWithSegments;
  onDelete: () => void;
  onPress: () => void;
}) => {
  const [scaleAnim] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleDelete = () => {
    Alert.alert(
      "Xóa truyện",
      `Bạn có chắc muốn xóa "${story.title}" khỏi thiết bị?`,
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xóa",
          style: "destructive",
          onPress: onDelete,
        },
      ]
    );
  };

  const segmentCount = story.story_segments?.length || 0;
  const estimatedSize = (segmentCount * 0.5).toFixed(1);

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        marginHorizontal: 16,
        marginVertical: 8,
      }}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 20,
            padding: 12,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          <HStack space="md" className="items-center">
            {/* Story Cover */}
            <ExpoImage
              source={{ uri: story.cover_image_url || "" }}
              style={{
                width: 80,
                height: 80,
                borderRadius: 12,
              }}
              contentFit="cover"
              cachePolicy="disk"
            />

            {/* Story Info */}
            <VStack className="flex-1" space="xs">
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#1B4B07",
                  fontFamily: "Baloo2_700Bold",
                }}
                numberOfLines={2}
              >
                {story.title}
              </Text>

              <HStack space="xs" className="items-center">
                <Feather name="file-text" size={14} color="#6B7280" />
                <Text
                  style={{
                    fontSize: 13,
                    color: "#6B7280",
                    fontFamily: "NunitoSans_400Regular",
                  }}
                >
                  {segmentCount} trang
                </Text>
              </HStack>

              <HStack space="xs" className="items-center">
                <Feather name="download" size={14} color="#10B981" />
                <Text
                  style={{
                    fontSize: 13,
                    color: "#10B981",
                    fontFamily: "NunitoSans_600SemiBold",
                  }}
                >
                  ~{estimatedSize} MB
                </Text>
              </HStack>
            </VStack>

            {/* Delete Button */}
            <Pressable
              onPress={handleDelete}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#FEE2E2",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Feather name="trash-2" size={20} color="#EF4444" />
            </Pressable>
          </HStack>
        </View>
      </Pressable>
    </Animated.View>
  );
};

// Empty State Component
const EmptyState = () => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
      }}
    >
      <View
        style={{
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: "rgba(255, 255, 255, 0.5)",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <Feather name="download-cloud" size={60} color="#6B7280" />
      </View>

      <Text
        style={{
          fontSize: 24,
          fontWeight: "700",
          color: "#1B4B07",
          textAlign: "center",
          marginBottom: 12,
          fontFamily: "Baloo2_700Bold",
        }}
      >
        Chưa có truyện nào
      </Text>

      <Text
        style={{
          fontSize: 16,
          color: "#6B7280",
          textAlign: "center",
          lineHeight: 24,
          fontFamily: "NunitoSans_400Regular",
        }}
      >
        Tải truyện về để đọc khi không có mạng
      </Text>
    </View>
  );
};

// Header Component
const Header = ({
  storiesCount,
  storageSize,
  onClearAll,
  onBack,
}: {
  storiesCount: number;
  storageSize: number;
  onClearAll: () => void;
  onBack: () => void;
}) => {
  const handleClearAll = () => {
    if (storiesCount === 0) return;

    Alert.alert(
      "Xóa tất cả",
      `Bạn có chắc muốn xóa tất cả ${storiesCount} truyện đã tải?`,
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xóa tất cả",
          style: "destructive",
          onPress: onClearAll,
        },
      ]
    );
  };

  return (
    <VStack space="md" className="px-6 pb-4">
      {/* Top Bar */}
      <HStack className="justify-between items-center">
        <Pressable
          onPress={onBack}
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
          Quản lý tải xuống
        </Heading>

        <Pressable
          onPress={handleClearAll}
          disabled={storiesCount === 0}
          style={{
            backgroundColor: storiesCount > 0 ? "#FEE2E2" : "#F3F4F6",
            borderRadius: 20,
            width: 40,
            height: 40,
            justifyContent: "center",
            alignItems: "center",
            opacity: storiesCount > 0 ? 1 : 0.5,
          }}
        >
          <Feather
            name="trash-2"
            size={20}
            color={storiesCount > 0 ? "#EF4444" : "#9CA3AF"}
          />
        </Pressable>
      </HStack>

      {/* Storage Info */}
      {storiesCount > 0 && (
        <View
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            borderRadius: 16,
            padding: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <HStack className="justify-between items-center">
            <VStack space="xs">
              <Text
                style={{
                  fontSize: 14,
                  color: "#6B7280",
                  fontFamily: "NunitoSans_400Regular",
                }}
              >
                Số truyện đã tải
              </Text>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "700",
                  color: "#1B4B07",
                  fontFamily: "Baloo2_700Bold",
                }}
              >
                {storiesCount}
              </Text>
            </VStack>

            <View
              style={{
                width: 1,
                height: 40,
                backgroundColor: "#E5E7EB",
              }}
            />

            <VStack space="xs">
              <Text
                style={{
                  fontSize: 14,
                  color: "#6B7280",
                  fontFamily: "NunitoSans_400Regular",
                }}
              >
                Dung lượng
              </Text>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "700",
                  color: "#10B981",
                  fontFamily: "Baloo2_700Bold",
                }}
              >
                ~{storageSize.toFixed(1)} MB
              </Text>
            </VStack>
          </HStack>
        </View>
      )}
    </VStack>
  );
};

export default function ManageDownloadsScreen() {
  const {
    stories,
    isLoading,
    isDeleting,
    storageSize,
    deleteStory,
    clearAll,
    refresh,
  } = useOfflineStories();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleStoryPress = (storyId: string) => {
    router.push(`/stories/${storyId}`);
  };

  const handleClearAll = async () => {
    try {
      await clearAll();
    } catch (error) {
      Alert.alert("Lỗi", "Không thể xóa tất cả truyện. Vui lòng thử lại.");
    }
  };

  const handleDeleteStory = async (storyId: string) => {
    try {
      await deleteStory(storyId);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể xóa truyện. Vui lòng thử lại.");
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Đang tải..." isLoaded={!isLoading} />;
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Gradient Background */}
      <LinearGradient
        colors={["#C7F9CC", "#80ED99"]}
        style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <Header
          storiesCount={stories.length}
          storageSize={storageSize}
          onClearAll={handleClearAll}
          onBack={() => router.back()}
        />

        {stories.length === 0 ? (
          <EmptyState />
        ) : (
          <FlatList
            data={stories}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <StoryCard
                story={item}
                onDelete={() => handleDeleteStory(item.id)}
                onPress={() => handleStoryPress(item.id)}
              />
            )}
            contentContainerStyle={{
              paddingBottom: 20,
              paddingTop: 8,
            }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#22C55E"
                colors={["#22C55E"]}
              />
            }
          />
        )}

        {/* Deleting Overlay */}
        {isDeleting && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 20,
                padding: 24,
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 10,
              }}
            >
              <Feather name="loader" size={32} color="#22C55E" />
              <Text
                style={{
                  fontSize: 16,
                  color: "#1B4B07",
                  marginTop: 12,
                  fontFamily: "NunitoSans_600SemiBold",
                }}
              >
                Đang xóa...
              </Text>
            </View>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}
