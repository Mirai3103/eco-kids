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
    View,
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
const cardWidth = (screenWidth - 48) / 2; // 2 columns with padding

// Mock data for reading history
const mockHistoryStories = [
  {
    id: 1,
    title: 'Cuộc phiêu lưu của chú ong nhỏ',
    cover_image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300',
    topic: 'Động vật',
    status: 'completed', // completed, reading, not_quiz
    progress: 100,
    readDate: '2024-01-15',
    hasQuiz: true,
    quizCompleted: true,
    readTime: '12 phút',
  },
  {
    id: 2,
    title: 'Rùa biển và nhựa thải',
    cover_image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300',
    topic: 'Môi trường',
    status: 'reading',
    progress: 65,
    readDate: '2024-01-14',
    hasQuiz: true,
    quizCompleted: false,
    readTime: '8 phút',
  },
  {
    id: 3,
    title: 'Cây xanh kỳ diệu',
    cover_image_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300',
    topic: 'Rừng xanh',
    status: 'not_quiz',
    progress: 100,
    readDate: '2024-01-13',
    hasQuiz: true,
    quizCompleted: false,
    readTime: '15 phút',
  },
  {
    id: 4,
    title: 'Gấu trúc và tre xanh',
    cover_image_url: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=400&h=300',
    topic: 'Động vật',
    status: 'completed',
    progress: 100,
    readDate: '2024-01-12',
    hasQuiz: true,
    quizCompleted: true,
    readTime: '10 phút',
  },
  {
    id: 5,
    title: 'Chim cánh cụt bé nhỏ',
    cover_image_url: 'https://images.unsplash.com/photo-1551986782-d0169b3f8fa7?w=400&h=300',
    topic: 'Động vật',
    status: 'reading',
    progress: 30,
    readDate: '2024-01-11',
    hasQuiz: true,
    quizCompleted: false,
    readTime: '5 phút',
  },
  {
    id: 6,
    title: 'Vườn hoa nhiều màu',
    cover_image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300',
    topic: 'Thiên nhiên',
    status: 'not_quiz',
    progress: 100,
    readDate: '2024-01-10',
    hasQuiz: true,
    quizCompleted: false,
    readTime: '18 phút',
  },
  {
    id: 7,
    title: 'Ong làm mật',
    cover_image_url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=300',
    topic: 'Động vật',
    status: 'completed',
    progress: 100,
    readDate: '2024-01-09',
    hasQuiz: false,
    quizCompleted: false,
    readTime: '7 phút',
  },
];

type TabType = 'all' | 'reading' | 'not_quiz';

// Tab Button Component
const TabButton = ({
  title,
  isActive,
  onPress,
  count,
}: {
  title: string;
  isActive: boolean;
  onPress: () => void;
  count: number;
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
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <View
          style={{
            backgroundColor: isActive ? '#399918' : 'rgba(255, 255, 255, 0.8)',
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 20,
            marginHorizontal: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isActive ? 0.2 : 0.1,
            shadowRadius: 4,
            elevation: isActive ? 4 : 2,
          }}
        >
          <HStack className="items-center" space="xs">
            <Text
              style={{
                color: isActive ? 'white' : '#1B4B07',
                fontSize: 14,
                fontFamily: 'NunitoSans_700Bold',
              }}
            >
              {title}
            </Text>
            <View
              style={{
                backgroundColor: isActive ? 'rgba(255,255,255,0.3)' : '#E8F5E8',
                borderRadius: 10,
                paddingHorizontal: 6,
                paddingVertical: 2,
                minWidth: 20,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: isActive ? 'white' : '#399918',
                  fontSize: 12,
                  fontFamily: 'NunitoSans_700Bold',
                }}
              >
                {count}
              </Text>
            </View>
          </HStack>
        </View>
      </Animated.View>
    </Pressable>
  );
};

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

  const buttonHeight = size === "large" ? 44 : 32;
  const fontSize = size === "large" ? 16 : 12;

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
              paddingHorizontal: size === "large" ? 24 : 12,
              flexDirection: 'row',
            }}
          >
            {icon && (
              <Ionicons name={icon as any} size={fontSize} color="white" style={{ marginRight: 4 }} />
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

// Progress Bar Component
const ProgressBar = ({ progress }: { progress: number }) => {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  return (
    <View
      style={{
        backgroundColor: '#E0E0E0',
        height: 4,
        borderRadius: 2,
        overflow: 'hidden',
        marginVertical: 4,
      }}
    >
      <Animated.View
        style={{
          backgroundColor: progress === 100 ? '#4CAF50' : '#FFC107',
          height: '100%',
          borderRadius: 2,
          width: progressAnim.interpolate({
            inputRange: [0, 100],
            outputRange: ['0%', '100%'],
            extrapolate: 'clamp',
          }),
        }}
      />
    </View>
  );
};

// Story Card Component for History
const HistoryStoryCard = ({
  story,
  index,
  onPress,
}: {
  story: typeof mockHistoryStories[0];
  index: number;
  onPress: () => void;
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;
  const [tiltAngle] = useState(() => {
    const tilts = [-2, -1, 0, 1, 2];
    return tilts[Math.floor(Math.random() * tilts.length)];
  });

  useEffect(() => {
    // Staggered entrance animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 100,
      tension: 60,
      friction: 8,
      useNativeDriver: true,
    }).start();
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

  const getStatusIcon = () => {
    switch (story.status) {
      case 'completed':
        return { icon: 'checkmark-circle', color: '#4CAF50' };
      case 'reading':
        return { icon: 'time', color: '#FFC107' };
      case 'not_quiz':
        return { icon: 'help-circle', color: '#FF9800' };
      default:
        return { icon: 'book', color: '#666' };
    }
  };

  const statusInfo = getStatusIcon();

  return (
    <Animated.View
      style={{
        transform: [
          { scale: scaleAnim },
          { scale: pressAnim },
          { rotate: `${tiltAngle}deg` },
        ],
        marginBottom: 20,
        marginHorizontal: 4,
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
            borderRadius: 16,
            padding: 10,
            width: cardWidth,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          {/* Story Image with Status Badge */}
          <View style={{ position: "relative" }}>
            <View
              style={{
                height: 160,
                borderRadius: 12,
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
              }}
            >
              <ExpoImage
                source={{ uri: story.cover_image_url }}
                className="w-full h-full rounded-lg"
                contentFit="cover"
                alt="story-image"
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 12,
                }}
                cachePolicy="memory-disk"
              />

              {/* Status Badge */}
              <View
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  backgroundColor: statusInfo.color,
                  borderRadius: 16,
                  width: 32,
                  height: 32,
                  justifyContent: "center",
                  alignItems: "center",
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Ionicons name={statusInfo.icon as any} size={16} color="white" />
              </View>

              {/* Reading Time Badge */}
              <View
                style={{
                  position: "absolute",
                  bottom: 8,
                  left: 8,
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  borderRadius: 12,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                }}
              >
                <Text
                  style={{
                    color: 'white',
                    fontSize: 10,
                    fontFamily: 'NunitoSans_600SemiBold',
                  }}
                >
                  {story.readTime}
                </Text>
              </View>
            </View>
          </View>

          {/* Story Info */}
          <VStack space="xs" className="mt-3">
            <Text
              style={{
                color: "#1B4B07",
                fontSize: 14,
                textAlign: "center",
                lineHeight: 16,
                fontFamily: "NunitoSans_700Bold"
              }}
              className="line-clamp-2"
            >
              {story.title}
            </Text>

            {/* Progress Bar for reading stories */}
            {story.status === 'reading' && (
              <VStack space="xs">
                <ProgressBar progress={story.progress} />
                <Text
                  style={{
                    color: '#666',
                    fontSize: 10,
                    textAlign: 'center',
                    fontFamily: 'NunitoSans_600SemiBold',
                  }}
                >
                  Đã đọc {story.progress}%
                </Text>
              </VStack>
            )}

            {/* Action Buttons */}
            <HStack className="justify-center" space="xs">
              {story.status === 'reading' ? (
                <Button3D
                  title="Đọc tiếp"
                  onPress={() => console.log('Continue reading')}
                  icon="play"
                  color="#399918"
                  shadowColor="#2a800d"
                />
              ) : story.status === 'not_quiz' ? (
                <Button3D
                  title="Làm Quiz"
                  onPress={() => console.log('Take quiz')}
                  icon="help-circle"
                  color="#FF9800"
                  shadowColor="#F57C00"
                />
              ) : (
                <Button3D
                  title="Đọc lại"
                  onPress={() => console.log('Read again')}
                  icon="refresh"
                  color="#2196F3"
                  shadowColor="#1976D2"
                />
              )}
            </HStack>
          </VStack>
        </View>
      </Pressable>
    </Animated.View>
  );
};

// Masonry Grid Component
const MasonryGrid = ({
  data,
  onStoryPress,
}: {
  data: typeof mockHistoryStories;
  onStoryPress: (story: typeof mockHistoryStories[0]) => void;
}) => {
  const [leftColumn, setLeftColumn] = useState<typeof mockHistoryStories>([]);
  const [rightColumn, setRightColumn] = useState<typeof mockHistoryStories>([]);

  useEffect(() => {
    // Distribute items across columns for masonry effect
    const left: typeof mockHistoryStories = [];
    const right: typeof mockHistoryStories = [];
    let leftHeight = 0;
    let rightHeight = 0;

    data.forEach((story) => {
      if (leftHeight <= rightHeight) {
        left.push(story);
        leftHeight += 220 + 20; // height + margin
      } else {
        right.push(story);
        rightHeight += 220 + 20;
      }
    });

    setLeftColumn(left);
    setRightColumn(right);
  }, [data]);

  return (
    <HStack className="px-4 items-start" space="sm">
      <VStack className="flex-1">
        {leftColumn.map((story, index) => (
          <HistoryStoryCard
            key={story.id}
            story={story}
            index={index * 2}
            onPress={() => onStoryPress(story)}
          />
        ))}
      </VStack>
      <VStack className="flex-1">
        {rightColumn.map((story, index) => (
          <HistoryStoryCard
            key={story.id}
            story={story}
            index={index * 2 + 1}
            onPress={() => onStoryPress(story)}
          />
        ))}
      </VStack>
    </HStack>
  );
};

// Empty State Component
const EmptyState = ({ activeTab }: { activeTab: TabType }) => {
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

  const getEmptyStateContent = () => {
    switch (activeTab) {
      case 'reading':
        return {
          emoji: '📖⏳',
          title: 'Chưa có truyện đang đọc',
          subtitle: 'Hãy bắt đầu đọc một câu chuyện mới nhé!',
        };
      case 'not_quiz':
        return {
          emoji: '🤔📝',
          title: 'Chưa có truyện cần làm quiz',
          subtitle: 'Đọc xong truyện và thử sức với các câu hỏi thú vị!',
        };
      default:
        return {
          emoji: '📚✨',
          title: 'Chưa có lịch sử đọc',
          subtitle: 'Hãy khám phá và đọc những câu chuyện thú vị!',
        };
    }
  };

  const content = getEmptyStateContent();

  return (
    <Center className="flex-1 px-8" style={{ marginTop: 100 }}>
      <Animated.View style={{ transform: [{ translateY }] }}>
        <Text style={{ fontSize: 80, textAlign: 'center', marginBottom: 20 }}>
          {content.emoji}
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
          {content.title}
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
          {content.subtitle}
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

export default function HistoryScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [filteredStories, setFilteredStories] = useState(mockHistoryStories);

  // Filter stories based on active tab
  useEffect(() => {
    let filtered = mockHistoryStories;
    
    switch (activeTab) {
      case 'reading':
        filtered = mockHistoryStories.filter(story => story.status === 'reading');
        break;
      case 'not_quiz':
        filtered = mockHistoryStories.filter(story => 
          story.status === 'not_quiz' || (story.hasQuiz && !story.quizCompleted && story.status === 'completed')
        );
        break;
      default:
        filtered = mockHistoryStories;
        break;
    }
    
    setFilteredStories(filtered);
  }, [activeTab]);

  const handleBack = () => {
    router.back();
  };

  const handleStoryPress = (story: typeof mockHistoryStories[0]) => {
    console.log('Open story:', story.title);
    // router.push(`/stories/${story.id}`);
  };

  // Get counts for each tab
  const getCounts = () => {
    const reading = mockHistoryStories.filter(story => story.status === 'reading').length;
    const notQuiz = mockHistoryStories.filter(story => 
      story.status === 'not_quiz' || (story.hasQuiz && !story.quizCompleted && story.status === 'completed')
    ).length;
    
    return {
      all: mockHistoryStories.length,
      reading,
      not_quiz: notQuiz,
    };
  };

  const counts = getCounts();

  return (
    <View className="flex-1">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Background Gradient */}
      <LinearGradient
        colors={['#EEF0FE', '#CAFEC3']}
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
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              borderRadius: 25,
              width: 50,
              height: 50,
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
          </Pressable>

          <HStack className="items-center" space="sm">
            <Text style={{ fontSize: 28 }}>📚</Text>
            <Heading 
              size="xl" 
              style={{ 
                color: '#1B4B07', 
                fontFamily: 'Baloo2_700Bold' 
              }}
            >
              Lịch sử đọc
            </Heading>
          </HStack>

          <View style={{ width: 50 }} />
        </HStack>

        {/* Tab Navigation */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
          style={{ maxHeight: 60 }}
        >
          <HStack space="sm">
            <TabButton
              title="Tất cả"
              isActive={activeTab === 'all'}
              onPress={() => setActiveTab('all')}
              count={counts.all}
            />
            <TabButton
              title="Đang đọc"
              isActive={activeTab === 'reading'}
              onPress={() => setActiveTab('reading')}
              count={counts.reading}
            />
            <TabButton
              title="Chưa làm quiz"
              isActive={activeTab === 'not_quiz'}
              onPress={() => setActiveTab('not_quiz')}
              count={counts.not_quiz}
            />
          </HStack>
        </ScrollView>

        {/* Content */}
        {filteredStories.length === 0 ? (
          <EmptyState activeTab={activeTab} />
        ) : (
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120, paddingTop: 10 }}
          >
            <MasonryGrid data={filteredStories} onStoryPress={handleStoryPress} />
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}
