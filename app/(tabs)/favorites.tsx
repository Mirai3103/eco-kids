import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Pressable,
    ScrollView,
    StatusBar,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// GlueStack UI Components
import { Center } from '@/components/ui/center';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Image as ExpoImage } from 'expo-image';

const { width: screenWidth } = Dimensions.get('window');

// Mock data for favorite stories
const mockFavoriteStories = [
  {
    id: 1,
    title: 'Cuộc phiêu lưu của chú ong nhỏ',
    cover_image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300',
    topic: 'Động vật',
    readCount: 3,
    bgColor: '#E8F5E8',
    dateAdded: '2024-01-15'
  },
  {
    id: 2,
    title: 'Rùa biển và nhựa thải',
    cover_image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300',
    topic: 'Môi trường',
    readCount: 2,
    bgColor: '#E3F2FD',
    dateAdded: '2024-01-12'
  },
  {
    id: 3,
    title: 'Cây xanh kỳ diệu',
    cover_image_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300',
    topic: 'Rừng xanh',
    readCount: 5,
    bgColor: '#F1F8E9',
    dateAdded: '2024-01-10'
  },
  {
    id: 4,
    title: 'Gấu trúc và tre xanh',
    cover_image_url: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=400&h=300',
    topic: 'Động vật',
    readCount: 1,
    bgColor: '#FFF8E1',
    dateAdded: '2024-01-08'
  },
  {
    id: 5,
    title: 'Chim cánh cụt bé nhỏ',
    cover_image_url: 'https://images.unsplash.com/photo-1551986782-d0169b3f8fa7?w=400&h=300',
    topic: 'Động vật',
    readCount: 4,
    bgColor: '#E1F5FE',
    dateAdded: '2024-01-05'
  }
];

// 3D Button Component
const Button3D = ({
  title,
  onPress,
  size = "small",
  color = "#399918",
  shadowColor = "#2a800d",
  icon,
}: {
  title: string;
  onPress: () => void;
  size?: "small" | "large";
  color?: string;
  shadowColor?: string;
  icon?: string;
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

  const buttonHeight = size === "large" ? 44 : 36;
  const fontSize = size === "large" ? 16 : 14;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <View className="relative">
          {/* Shadow/Bottom layer */}
          <View
            style={{
              backgroundColor: shadowColor,
              height: buttonHeight,
              borderRadius: 12,
              position: "absolute",
              top: 3,
              left: 0,
              right: 0,
            }}
          />
          {/* Top layer */}
          <View
            style={{
              backgroundColor: color,
              height: buttonHeight,
              borderRadius: 12,
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: size === "large" ? 24 : 16,
              flexDirection: 'row',
            }}
          >
            {icon && (
              <Ionicons name={icon as any} size={fontSize} color="white" style={{ marginRight: 6 }} />
            )}
            <Text
              style={{
                color: "white",
                fontSize,
                fontFamily: "NunitoSans_700Bold",
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

// Story Card Component for Favorites
const FavoriteStoryCard = ({ 
  story, 
  index, 
  onPress,
  onRemove 
}: { 
  story: typeof mockFavoriteStories[0]; 
  index: number;
  onPress: () => void;
  onRemove: () => void;
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered entrance animation
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
        duration: 600,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePress = () => {
    const pressAnim = useRef(new Animated.Value(1)).current;
    Animated.sequence([
      Animated.spring(pressAnim, { toValue: 0.95, useNativeDriver: true }),
      Animated.spring(pressAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
        opacity: opacityAnim,
        marginBottom: 16,
      }}
    >
      <Pressable onPress={handlePress}>
        <View
          style={{
            backgroundColor: 'white',
            borderRadius: 20,
            marginHorizontal: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 6,
            overflow: 'hidden',
          }}
        >
          <HStack className="p-4" space="md">
            {/* Story Image */}
            <View style={{ position: 'relative' }}>
              <ExpoImage
                source={{ uri: story.cover_image_url }}
                style={{
                  width: 80,
                  height: 100,
                  borderRadius: 12,
                }}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
              {/* Favorite badge */}
              <View
                style={{
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  backgroundColor: '#D72654',
                  borderRadius: 12,
                  width: 24,
                  height: 24,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 2,
                  borderColor: 'white',
                }}
              >
                <Ionicons name="heart" size={12} color="white" />
              </View>
            </View>

            {/* Story Info */}
            <VStack className="flex-1" space="xs">
              <Text
                style={{
                  color: '#1B4B07',
                  fontSize: 16,
                  fontFamily: 'NunitoSans_700Bold',
                  lineHeight: 20,
                }}
                className="line-clamp-2"
              >
                {story.title}
              </Text>
              
              <HStack className="items-center" space="xs">
                <View
                  style={{
                    backgroundColor: story.bgColor,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 8,
                  }}
                >
                  <Text
                    style={{
                      color: '#399918',
                      fontSize: 12,
                      fontFamily: 'NunitoSans_600SemiBold',
                    }}
                  >
                    {story.topic}
                  </Text>
                </View>
                
                <HStack className="items-center" space="xs">
                  <Ionicons name="book-outline" size={14} color="#666" />
                  <Text
                    style={{
                      color: '#666',
                      fontSize: 12,
                      fontFamily: 'NunitoSans_600SemiBold',
                    }}
                  >
                    Đã đọc {story.readCount} lần
                  </Text>
                </HStack>
              </HStack>

              <HStack className="justify-between items-center mt-2">
                <HStack space="sm">
                  <Button3D
                    title="Đọc"
                    onPress={() => console.log('Read story')}
                    icon="play"
                    color="#399918"
                    shadowColor="#2a800d"
                  />
                  <Button3D
                    title="Bỏ thích"
                    onPress={onRemove}
                    icon="heart-dislike"
                    color="#D72654"
                    shadowColor="#B71C1C"
                  />
                </HStack>
              </HStack>
            </VStack>
          </HStack>
        </View>
      </Pressable>
    </Animated.View>
  );
};

// Empty State Component
const EmptyState = () => {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const translateY = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <Center className="flex-1 px-8" style={{ marginTop: 100 }}>
      <Animated.View style={{ transform: [{ translateY }] }}>
        <Text style={{ fontSize: 80, textAlign: 'center', marginBottom: 20 }}>
          📚💔
        </Text>
      </Animated.View>
      
      <VStack space="md" className="items-center">
        <Heading 
          size="xl" 
          style={{ 
            color: '#1B4B07', 
            textAlign: 'center',
            fontFamily: 'Baloo2_700Bold' 
          }}
        >
          Chưa có truyện yêu thích
        </Heading>
        
        <Text
          style={{
            color: '#666',
            fontSize: 16,
            textAlign: 'center',
            lineHeight: 22,
            fontFamily: 'NunitoSans_600SemiBold',
            maxWidth: 280,
          }}
        >
          Hãy khám phá và thêm những câu chuyện thú vị vào danh sách yêu thích nhé!
        </Text>
        
        <View style={{ marginTop: 20 }}>
          <Button3D
            title="Khám phá truyện"
            onPress={() => console.log('Explore stories')}
            size="large"
            icon="search"
            color="#399918"
            shadowColor="#2a800d"
          />
        </View>
      </VStack>
    </Center>
  );
};

export default function FavoritesScreen() {
  const router = useRouter();
  const [favoriteStories, setFavoriteStories] = useState(mockFavoriteStories);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleRemoveFromFavorites = (storyId: number) => {
    setFavoriteStories(prev => prev.filter(story => story.id !== storyId));
  };

  const handleStoryPress = (story: typeof mockFavoriteStories[0]) => {
    console.log('Open story:', story.title);
    // router.push(`/stories/${story.id}`);
  };

  return (
    <View className="flex-1">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['#EEF0FE', '#CAFEC3']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      <SafeAreaView className="flex-1">
        {/* Header */}
        <HStack className="justify-between items-center px-6 py-4 mb-4">
          <View style={{ width: 40 }} />
          <HStack className="items-center" space="sm">
            <Text style={{ fontSize: 28 }}>💖</Text>
            <Heading 
              size="xl" 
              style={{ 
                color: '#1B4B07', 
                fontFamily: 'Baloo2_700Bold' 
              }}
            >
              Truyện yêu thích
            </Heading>
          </HStack>
          <Pressable
            onPress={() => console.log('Search favorites')}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderRadius: 20,
              width: 40,
              height: 40,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons name="search" size={20} color="#1B4B07" />
          </Pressable>
        </HStack>

        {/* Stats Bar */}
        {favoriteStories.length > 0 && (
          <View
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              marginHorizontal: 16,
              borderRadius: 16,
              padding: 16,
              marginBottom: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <HStack className="justify-between items-center">
              <HStack className="items-center" space="sm">
                <View
                  style={{
                    backgroundColor: '#FFC107',
                    borderRadius: 12,
                    width: 40,
                    height: 40,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 20 }}>📖</Text>
                </View>
                <VStack>
                  <Text
                    style={{
                      color: '#1B4B07',
                      fontSize: 18,
                      fontFamily: 'NunitoSans_700Bold',
                    }}
                  >
                    {favoriteStories.length} truyện
                  </Text>
                  <Text
                    style={{
                      color: '#666',
                      fontSize: 12,
                      fontFamily: 'NunitoSans_600SemiBold',
                    }}
                  >
                    Trong danh sách yêu thích
                  </Text>
                </VStack>
              </HStack>
              
              <HStack className="items-center" space="sm">
                <View
                  style={{
                    backgroundColor: '#4CAF50',
                    borderRadius: 12,
                    width: 40,
                    height: 40,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 20 }}>⭐</Text>
                </View>
                <VStack>
                  <Text
                    style={{
                      color: '#1B4B07',
                      fontSize: 18,
                      fontFamily: 'NunitoSans_700Bold',
                    }}
                  >
                    {favoriteStories.reduce((sum, story) => sum + story.readCount, 0)} lượt đọc
                  </Text>
                  <Text
                    style={{
                      color: '#666',
                      fontSize: 12,
                      fontFamily: 'NunitoSans_600SemiBold',
                    }}
                  >
                    Tổng số lần đọc
                  </Text>
                </VStack>
              </HStack>
            </HStack>
          </View>
        )}

        {/* Content */}
        {favoriteStories.length === 0 ? (
          <EmptyState />
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120 }}
          >
            {favoriteStories.map((story, index) => (
              <FavoriteStoryCard
                key={story.id}
                story={story}
                index={index}
                onPress={() => handleStoryPress(story)}
                onRemove={() => handleRemoveFromFavorites(story.id)}
              />
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}
