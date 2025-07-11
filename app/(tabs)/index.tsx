import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { FlatList } from '@/components/ui/flat-list';
import { HStack } from '@/components/ui/hstack';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { Dimensions, StatusBar, TouchableOpacity } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Sample data
const topics = [
  { id: '1', title: 'Đại dương', icon: '🐋', color: '#2196F3' },
  { id: '2', title: 'Rừng cây', icon: '🌳', color: '#4CAF50' },
  { id: '3', title: 'Côn trung', icon: '🐞', color: '#FF9800' },
  { id: '4', title: 'Động vật', icon: '🦁', color: '#E91E63' },
  { id: '5', title: 'Hoa quả', icon: '🍎', color: '#9C27B0' },
];

const newStories = [
  { id: '1', title: 'Cá heo thông minh', image: '🐬' },
  { id: '2', title: 'Ong nhỏ cần mẫn', image: '🐝' },
  { id: '3', title: 'Cây xanh lớn mạnh', image: '🌱' },
  { id: '4', title: 'Chim nhỏ bay cao', image: '🦅' },
];

const recentStories = [
  { id: '1', title: 'Gấu trúc dễ thương', image: '🐼' },
  { id: '2', title: 'Hoa sen xinh đẹp', image: '🪷' },
  { id: '3', title: 'Bướm bay lượn', image: '🦋' },
  { id: '4', title: 'Cầu vồng sau mưa', image: '🌈' },
];

const AnimatedCloud = ({ delay = 0, top = 50 }: { delay?: number; top?: number }) => {
  const translateX = useSharedValue(-100);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(SCREEN_WIDTH + 50, { duration: 15000 }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    position: 'absolute',
    top,
    opacity: 0.6,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Text className="text-white text-6xl">☁️</Text>
    </Animated.View>
  );
};

const TopicCard = ({ item, index }: { item: any; index: number }) => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const handlePress = () => {
    scale.value = withSpring(0.95, {}, () => {
      scale.value = withSpring(1);
    });
    rotation.value = withSpring(5, {}, () => {
      rotation.value = withSpring(0);
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` }
    ],
  }));

  return (
    <TouchableOpacity onPress={handlePress}>
      <Animated.View style={animatedStyle}>
        <Box 
          className="mx-2 p-4 rounded-3xl items-center justify-center shadow-lg"
          style={{
            backgroundColor: item.color,
            width: 120,
            height: 100,
            shadowColor: item.color,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Text className="text-4xl mb-2">{item.icon}</Text>
          <Text className="text-white font-bold text-sm text-center">
            {item.title}
          </Text>
        </Box>
      </Animated.View>
    </TouchableOpacity>
  );
};

const StoryCard = ({ item, size = 'normal' }: { item: any; size?: 'normal' | 'large' }) => {
  const scale = useSharedValue(1);
  const isLarge = size === 'large';

  const handlePress = () => {
    scale.value = withSpring(0.98, {}, () => {
      scale.value = withSpring(1);
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableOpacity onPress={handlePress}>
      <Animated.View style={animatedStyle}>
        <Box 
          className={`bg-white rounded-2xl shadow-lg ${isLarge ? 'mx-4 p-6' : 'mx-2 p-4'}`}
          style={{
            width: isLarge ? SCREEN_WIDTH - 32 : 140,
            height: isLarge ? 200 : 160,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <Box className="flex-1 items-center justify-center">
            <Text className={`${isLarge ? 'text-8xl' : 'text-5xl'} mb-3`}>
              {item.image}
            </Text>
            <Text className={`text-[#1B4B07] font-bold text-center ${isLarge ? 'text-xl' : 'text-sm'}`}>
              {item.title}
            </Text>
          </Box>
          {isLarge && (
            <Button
              className="mt-4 bg-[#2857E0] rounded-full"
              onPress={() => {}}
            >
              <HStack space="sm" className="items-center">
                <Ionicons name="play" size={16} color="white" />
                <ButtonText className="text-white font-bold">
                  Bắt đầu đọc
                </ButtonText>
              </HStack>
            </Button>
          )}
        </Box>
      </Animated.View>
    </TouchableOpacity>
  );
};

const NavIcon = ({ icon, label, active, onPress }: { icon: string; label: string; active: boolean; onPress: () => void }) => {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    scale.value = active ? withSpring(1.2) : withSpring(1);
    glowOpacity.value = active ? withRepeat(withTiming(0.7, { duration: 1000 }), -1, true) : withTiming(0);
  }, [active]);

  const handlePress = () => {
    scale.value = withSpring(0.9, {}, () => {
      scale.value = withSpring(active ? 1.2 : 1);
    });
    onPress();
  };

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <TouchableOpacity onPress={handlePress} className="items-center justify-center">
      <Box className="relative items-center justify-center">
        {/* Glow Effect */}
        {active && (
          <Animated.View
            style={[
              glowAnimatedStyle,
              {
                position: 'absolute',
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: '#5EF02C',
                opacity: 0.3,
              }
            ]}
          />
        )}
        
        {/* Icon Container */}
        <Animated.View style={iconAnimatedStyle}>
          <Box 
            className={`items-center justify-center rounded-full ${active ? 'bg-white' : 'bg-transparent'}`}
            style={{
              width: 50,
              height: 50,
              shadowColor: active ? '#5EF02C' : 'transparent',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: active ? 0.3 : 0,
              shadowRadius: 4,
              elevation: active ? 4 : 0,
            }}
          >
            <Text className={`${active ? 'text-3xl' : 'text-2xl'}`}>
              {icon}
            </Text>
          </Box>
        </Animated.View>

        {/* Active Dot */}
        {active && (
          <Box 
            className="absolute -bottom-2 bg-[#5EF02C] rounded-full"
            style={{
              width: 6,
              height: 6,
            }}
          />
        )}
      </Box>
      
      <Text className={`text-xs mt-2 ${active ? 'text-[#1B4B07] font-bold' : 'text-gray-500'}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const CustomBottomNav = () => {
  const [activeTab, setActiveTab] = React.useState('home');
  
  const navItems = [
    { id: 'home', icon: '🍄', label: 'Trang chủ' },
    { id: 'library', icon: '📚', label: 'Thư viện' },
    { id: 'favorites', icon: '💚', label: 'Yêu thích' },
    { id: 'profile', icon: '😊', label: 'Cá nhân' },
  ];

  // Wave shape path
  const wavePath = `M 0,40 Q ${SCREEN_WIDTH * 0.25},10 ${SCREEN_WIDTH * 0.5},20 Q ${SCREEN_WIDTH * 0.75},30 ${SCREEN_WIDTH},40 L ${SCREEN_WIDTH},100 L 0,100 Z`;

  return (
    <Box className="absolute bottom-0 left-0 right-0" style={{ height: 100 }}>
      {/* Wave Shape Background */}
      <Svg width={SCREEN_WIDTH} height={100} style={{ position: 'absolute' }}>
        <Path
          d={wavePath}
          fill="white"
          stroke="none"
        />
      </Svg>
      
      {/* Shadow Effect */}
      <Box
        style={{
          position: 'absolute',
          top: -10,
          left: 0,
          right: 0,
          height: 20,
          backgroundColor: 'transparent',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -5 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 10,
        }}
      />

      {/* Navigation Items */}
      <HStack className="absolute bottom-4 left-0 right-0 items-end justify-around px-8">
        {navItems.map((item, index) => (
          <Box key={item.id} style={{ paddingBottom: index === 1 || index === 2 ? 10 : 0 }}>
            <NavIcon
              icon={item.icon}
              label={item.label}
              active={activeTab === item.id}
              onPress={() => setActiveTab(item.id)}
            />
          </Box>
        ))}
      </HStack>
    </Box>
  );
};

export default function EcoKidsHomeScreen() {
  const scrollY = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const sunRotation = useSharedValue(0);

  useEffect(() => {
    // Pulsating animation for featured story
    pulseScale.value = withRepeat(
      withTiming(1.02, { duration: 2000 }),
      -1,
      true
    );

    // Rotating sun animation
    sunRotation.value = withRepeat(
      withTiming(360, { duration: 20000 }),
      -1,
      false
    );
  }, []);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const parallaxStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(scrollY.value, [0, 300], [0, -50]) }
    ],
  }));

  const sunStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sunRotation.value}deg` }],
    position: 'absolute',
    top: 60,
    left: 20,
  }));

  const featuredStoryStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <SafeAreaView className="flex-1">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Gradient Background */}
      <LinearGradient
        colors={['#EEF0FE', '#CAFEC3']}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: SCREEN_HEIGHT,
        }}
      />

      {/* Animated Background Elements */}
      <Animated.View style={parallaxStyle}>
        <Animated.View style={sunStyle}>
          <Text className="text-6xl">☀️</Text>
        </Animated.View>
        <AnimatedCloud delay={0} top={80} />
        <AnimatedCloud delay={5000} top={120} />
        <AnimatedCloud delay={10000} top={100} />
      </Animated.View>

      {/* Header */}
      <HStack className="items-center justify-between px-6 pt-4 pb-4">
        <HStack className="items-center">
          <Text className="text-3xl font-bold text-[#1B4B07]">EcoKids</Text>
          <Text className="text-2xl ml-2">🌱</Text>
        </HStack>
        <HStack className="items-center space-x-3">
          <HStack className="items-center bg-white/80 rounded-full px-3 py-1">
            <Text className="text-lg">🏆</Text>
            <Text className="text-[#1B4B07] font-bold ml-1">125 ⭐</Text>
          </HStack>
          <Avatar size="md">
            <AvatarImage source={{ uri: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%23FF6B6B'/%3E%3Ctext x='50' y='60' text-anchor='middle' font-size='40'%3E🐼%3C/text%3E%3C/svg%3E" }} />
          </Avatar>
        </HStack>
      </HStack>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Topic Selection Carousel */}
        <VStack className="mb-6">
          <Text className="text-2xl font-bold text-[#1B4B07] px-6 mb-4">
            Khám phá Chủ đề
          </Text>
          <FlatList
            data={topics}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            renderItem={({ item, index }) => (
              <TopicCard item={item} index={index} />
            )}
            keyExtractor={(item) => item.id}
          />
        </VStack>

        {/* Featured Story Card */}
        <VStack className="mb-6 px-6">
          <Text className="text-2xl font-bold text-[#1B4B07] mb-4">
            Truyện nổi bật
          </Text>
          <Animated.View style={featuredStoryStyle}>
            <StoryCard 
              item={{ title: 'Cuộc phiêu lưu của Gấu trúc nhỏ', image: '🐼' }} 
              size="large" 
            />
          </Animated.View>
        </VStack>

        {/* New Stories Carousel */}
        <VStack className="mb-6">
          <Text className="text-2xl font-bold text-[#1B4B07] px-6 mb-4">
            Truyện mới nhất nè
          </Text>
          <FlatList
            data={newStories}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            renderItem={({ item }) => <StoryCard item={item} />}
            keyExtractor={(item) => item.id}
          />
        </VStack>

        {/* Recent Stories Carousel */}
        <VStack className="mb-6">
          <Text className="text-2xl font-bold text-[#1B4B07] px-6 mb-4">
            Đọc lại nhé!
          </Text>
          <FlatList
            data={recentStories}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            renderItem={({ item }) => <StoryCard item={item} />}
            keyExtractor={(item) => item.id}
          />
        </VStack>
      </Animated.ScrollView>

      {/* Custom Bottom Navigation */}
      <CustomBottomNav />
    </SafeAreaView>
  );
}
