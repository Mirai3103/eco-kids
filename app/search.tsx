import { Center } from "@/components/ui/center";
import { HStack } from "@/components/ui/hstack";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { searchStoriesInfinite } from "@/lib/queries/story.query";
import { getAllTopicsQueryOptions } from "@/lib/queries/topic.query";
import { Story } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  FlatList,
  ScrollView,
  StatusBar,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// 3D Filter Button Component
const FilterButton3D = ({
  title,
  isSelected,
  onPress,
}: {
  title: string;
  isSelected: boolean;
  onPress: () => void;
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

  const bgColor = isSelected ? "#399918" : "#fff";
  const shadowColor = isSelected ? "#2a800d" : "#CDD5CD";
  const textColor = isSelected ? "#fff" : "#399918";

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <View style={{ position: "relative", marginRight: 8 }}>
          {/* Shadow/Bottom layer */}
          <View
            style={{
              backgroundColor: shadowColor,
              height: 32,
              borderRadius: 16,
              position: "absolute",
              top: 3,
              left: 0,
              right: 0,
            }}
          />
          {/* Top layer */}
          <View
            style={{
              backgroundColor: bgColor,
              height: 32,
              borderRadius: 16,
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 16,
            }}
          >
            <Text
              style={{
                color: textColor,
                fontSize: 14,
                fontFamily: "NunitoSans_600SemiBold",
              }}
            >
              {title}
            </Text>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
};

// Grid Story Card Component
const SearchStoryCard = ({
  story,
  onPress,
  cardWidth,
}: {
  story: Story;
  onPress: () => void;
  cardWidth: number;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }),
      Animated.spring(rotateAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(rotateAnim, {
        toValue: 0,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "2deg"],
  });

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }, { rotate }],
          width: cardWidth,
          margin: 8,
        }}
      >
        <View
          style={{
            backgroundColor: "#CAFEC3",
            borderRadius: 16,
            padding: 12,
            height: 180,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <Center style={{ flex: 1 }}>
            <ExpoImage
              source={{ uri: story.cover_image_url! }}
              cachePolicy={"memory-disk"}
              alt="story-image"
              style={{ width: "100%", height: "100%", borderRadius: 12 }}
            />
          </Center>
          <Text
            style={{
              color: "#1B4B07",
              fontSize: 14,
              textAlign: "center",
              marginTop: 8,
              fontFamily: "NunitoSans_600SemiBold",
            }}
            numberOfLines={2}
          >
            {story.title}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
};

// Empty State Component
const EmptyState = ({ searchQuery }: { searchQuery: string }) => {
  return (
    <Center style={{ paddingTop: 80 }}>
      <VStack
        space="lg"
        style={{ alignItems: "center", paddingHorizontal: 32 }}
      >
        <Text
          style={{
            color: "#1B4B07",
            fontSize: 20,
            fontFamily: "Baloo2_600SemiBold",
            textAlign: "center",
          }}
        >
          {searchQuery
            ? `Không tìm thấy truyện nào về "${searchQuery}"`
            : "Tìm kiếm truyện yêu thích của bé"}
        </Text>
        <Text
          style={{
            color: "#5F635F",
            fontSize: 15,
            fontFamily: "NunitoSans_400Regular",
            textAlign: "center",
          }}
        >
          {searchQuery
            ? "Thử tìm kiếm với từ khóa khác nhé!"
            : "Nhập tên truyện hoặc chủ đề bé muốn đọc"}
        </Text>
      </VStack>
    </Center>
  );
};

// Loading Skeleton for Grid
const LoadingSkeleton = ({
  cardWidth,
  numColumns = 2,
}: {
  cardWidth: number;
  numColumns?: number;
}) => {
  const fadeAnim = useRef(new Animated.Value(0.3)).current;
  const skeletonCount = numColumns * 3; // 3 rows

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View
      style={{ paddingHorizontal: 8, flexDirection: "row", flexWrap: "wrap" }}
    >
      {Array.from({ length: skeletonCount }).map((_, i) => (
        <Animated.View
          key={i}
          style={{
            opacity: fadeAnim,
            backgroundColor: "#E8F5E8",
            borderRadius: 16,
            width: cardWidth,
            height: 180,
            margin: 8,
          }}
        />
      ))}
    </View>
  );
};

export default function SearchScreen() {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState<string | undefined>(
    undefined
  );
  const searchInputRef = useRef<TextInput>(null);
  const searchBarScale = useRef(new Animated.Value(1)).current;

  // Calculate number of columns based on screen width
  const getNumColumns = () => {
    if (screenWidth >= 1024) return 4; // Tablet landscape
    if (screenWidth >= 768) return 3; // Tablet portrait
    if (screenWidth >= 600) return 3; // Large phone landscape
    return 2; // Default (phone portrait)
  };

  const numColumns = getNumColumns();
  const cardWidth = (screenWidth - 16 * (numColumns + 1)) / numColumns;

  // Fetch topics for filter
  const { data: topics = [] } = useQuery(getAllTopicsQueryOptions());

  // Debounce search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Infinite scroll query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["search-stories", debouncedQuery, selectedTopicId],
    queryFn: ({ pageParam = 0 }) =>
      searchStoriesInfinite({
        searchQuery: debouncedQuery,
        topicId: selectedTopicId,
        pageParam,
        limit: 10,
      }),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
  });

  const stories = data?.pages.flatMap((page) => page.data) ?? [];

  const handleSearchFocus = () => {
    Animated.spring(searchBarScale, {
      toValue: 1.02,
      useNativeDriver: true,
    }).start();
  };

  const handleSearchBlur = () => {
    Animated.spring(searchBarScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    searchInputRef.current?.focus();
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <Center style={{ paddingVertical: 20 }}>
        <Text
          style={{
            color: "#399918",
            fontFamily: "NunitoSans_600SemiBold",
          }}
        >
          Đang tải thêm...
        </Text>
      </Center>
    );
  };

  return (
    <View style={{ flex: 1 }}>
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

      <SafeAreaView style={{ flex: 1 }}>
        {/* Header with Search Bar */}
        <VStack
          space="md"
          style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 }}
        >
          <HStack space="md" style={{ alignItems: "center" }}>
            {/* Back Button */}
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: "#fff",
                justifyContent: "center",
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Ionicons name="arrow-back" size={24} color="#1B4B07" />
            </TouchableOpacity>

            {/* Search Input */}
            <Animated.View
              style={{
                flex: 1,
                transform: [{ scale: searchBarScale }],
              }}
            >
              <HStack
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 22,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
                space="sm"
              >
                <Ionicons name="search" size={20} color="#828782" />
                <TextInput
                  ref={searchInputRef}
                  placeholder="Tìm kiếm truyện..."
                  placeholderTextColor="#A7ADA7"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                  autoFocus={true}
                  style={{
                    flex: 1,
                    fontSize: 16,
                    fontFamily: "NunitoSans_400Regular",
                    color: "#1B4B07",
                    paddingVertical: 4,
                  }}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={handleClearSearch}>
                    <Ionicons name="close-circle" size={20} color="#A7ADA7" />
                  </TouchableOpacity>
                )}
              </HStack>
            </Animated.View>
          </HStack>

          {/* Topic Filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 8 }}
            style={{ paddingBottom: 8 }}
          >
            <HStack space="xs">
              <FilterButton3D
                title="Tất cả"
                isSelected={!selectedTopicId}
                onPress={() => setSelectedTopicId(undefined)}
              />
              {topics.map((topic) => (
                <FilterButton3D
                  key={topic.id}
                  title={topic.name!}
                  isSelected={selectedTopicId === topic.id}
                  onPress={() => setSelectedTopicId(topic.id)}
                />
              ))}
            </HStack>
          </ScrollView>
        </VStack>

        {/* Search Results */}
        {isLoading && debouncedQuery.length > 0 ? (
          <LoadingSkeleton cardWidth={cardWidth} numColumns={numColumns} />
        ) : stories.length === 0 ? (
          <EmptyState searchQuery={debouncedQuery} />
        ) : (
          <FlatList
            key={numColumns}
            data={stories}
            numColumns={numColumns}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <SearchStoryCard
                story={item}
                cardWidth={cardWidth}
                onPress={() => router.push(`/stories/${item.id}`)}
              />
            )}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 8, paddingBottom: 100 }}
            columnWrapperStyle={{ paddingHorizontal: 8 }}
          />
        )}
      </SafeAreaView>
    </View>
  );
}
