import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
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
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useUserStore } from '@/stores/user.store';
import { Image as ExpoImage } from 'expo-image';
import { useRouter } from 'expo-router';

const { width: screenWidth } = Dimensions.get('window');

// User data (would come from API/state management)


// Achievements/Badges data
const badges = [
  { id: 1, name: 'Bảo vệ đại dương', icon: '🌊', earned: true, color: '#2196F3' },
  { id: 2, name: 'Người bạn rừng', icon: '🌳', earned: true, color: '#4CAF50' },
  { id: 3, name: 'Chuyên gia tái chế', icon: '♻️', earned: true, color: '#009688' },
  { id: 4, name: 'Người yêu động vật', icon: '🐾', earned: false, color: '#FF9800' },
  { id: 5, name: 'Thám hiểm thiên nhiên', icon: '🔍', earned: false, color: '#9C27B0' },
  { id: 6, name: 'Nhà khoa học nhí', icon: '🧪', earned: false, color: '#E91E63' },
  { id: 7, name: 'Bảo vệ môi trường', icon: '🌍', earned: true, color: '#8BC34A' },
  { id: 8, name: 'Đọc sách hằng ngày', icon: '📚', earned: false, color: '#FF5722' },
  { id: 9, name: 'Người hùng xanh', icon: '🦸', earned: false, color: '#607D8B' },
];

// Recent rewards data
const recentRewards = [
  { id: 1, title: 'Sticker cá voi', image: '🐋', bgColor: '#E3F2FD' },
  { id: 2, title: 'Hình nền rừng', image: '🌲', bgColor: '#E8F5E8' },
  { id: 3, title: 'Âm thanh thiên nhiên', image: '🎵', bgColor: '#F3E5F5' },
  { id: 4, title: 'Badge đặc biệt', image: '🏆', bgColor: '#FFF3E0' },
];

// Favorite story data
const favoriteStory = {
  id: 1,
  title: 'Cuộc phiêu lưu của chú ong nhỏ',
  image: '🌸',
  bgColor: '#CAFEC3'
};

// Stat Card Component
const StatCard = ({ 
  icon, 
  number, 
  label, 
  bgColor, 
  textColor = 'white' 
}: {
  icon: string;
  number: number;
  label: string;
  bgColor: string;
  textColor?: string;
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
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <View
          style={{
            backgroundColor: bgColor,
            borderRadius: 20,
            padding: 20,
            width: (screenWidth - 48) / 2,
            height: 120,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <VStack space="xs" className="items-center justify-center flex-1">
            <Text style={{ fontSize: 32 }}>{icon}</Text>
            <Text 
              style={{ 
                color: textColor, 
                fontSize: 24, 
                fontWeight: 'bold' 
              }}
            >
              {number}
            </Text>
            <Text 
              style={{ 
                color: textColor, 
                fontSize: 14, 
                fontWeight: '600',
                textAlign: 'center' 
              }}
            >
              {label}
            </Text>
          </VStack>
        </View>
      </Animated.View>
    </Pressable>
  );
};

// Badge Component
const BadgeItem = ({ 
  badge, 
  index 
}: { 
  badge: typeof badges[0]; 
  index: number; 
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 100,
      tension: 60,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable>
        <VStack space="xs" className="items-center" style={{ width: (screenWidth - 64) / 3 }}>
          <View
            style={{
              backgroundColor: badge.earned ? badge.color : '#E0E0E0',
              width: 60,
              height: 60,
              borderRadius: 30,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: badge.earned ? 0.2 : 0.1,
              shadowRadius: 4,
              elevation: 3,
              position: 'relative',
            }}
          >
            <Text 
              style={{ 
                fontSize: 24, 
                opacity: badge.earned ? 1 : 0.5 
              }}
            >
              {badge.icon}
            </Text>
            {!badge.earned && (
              <View
                style={{
                  position: 'absolute',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: 30,
                  width: 60,
                  height: 60,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="lock-closed" size={20} color="white" />
              </View>
            )}
          </View>
          <Text
            style={{
              color: badge.earned ? '#1B4B07' : '#888',
              fontSize: 12,
              fontWeight: '600',
              textAlign: 'center',
              lineHeight: 16,
            }}
          >
            {badge.name}
          </Text>
        </VStack>
      </Pressable>
    </Animated.View>
  );
};

// Reward Card Component
const RewardCard = ({ reward }: { reward: typeof recentRewards[0] }) => {
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
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <View
          style={{
            backgroundColor: reward.bgColor,
            borderRadius: 16,
            padding: 16,
            width: 120,
            height: 100,
            marginRight: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 4,
          }}
        >
          <VStack space="xs" className="items-center justify-center flex-1">
            <Text style={{ fontSize: 32 }}>{reward.image}</Text>
            <Text
              style={{
                color: '#1B4B07',
                fontSize: 10,
                fontWeight: '600',
                textAlign: 'center',
                lineHeight: 12,
              }}
            >
              {reward.title}
            </Text>
          </VStack>
        </View>
      </Animated.View>
    </Pressable>
  );
};

// Favorite Story Card Component
const FavoriteStoryCard = ({ story }: { story: typeof favoriteStory }) => {
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
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <View
          style={{
            backgroundColor: story.bgColor,
            borderRadius: 20,
            padding: 20,
            marginHorizontal: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.15,
            shadowRadius: 10,
            elevation: 8,
            position: 'relative',
          }}
        >
          {/* Favorite Ribbon */}
          <View
            style={{
              position: 'absolute',
              top: -5,
              right: 20,
              backgroundColor: '#D72654',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
              Yêu thích nhất
            </Text>
          </View>

          <HStack space="md" className="items-center">
            <View
              style={{
                backgroundColor: 'white',
                borderRadius: 12,
                padding: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <Text style={{ fontSize: 48 }}>{story.image}</Text>
            </View>
            <VStack space="xs" className="flex-1">
              <Text
                style={{
                  color: '#1B4B07',
                  fontSize: 16,
                  fontWeight: 'bold',
                  lineHeight: 20,
                }}
              >
                {story.title}
              </Text>
              <Text
                style={{
                  color: '#399018',
                  fontSize: 12,
                  fontWeight: '500',
                }}
              >
                Đã đọc 5 lần
              </Text>
            </VStack>
          </HStack>
        </View>
      </Animated.View>
    </Pressable>
  );
};

export default function UserProfileScreen() {
  const handleSettingsPress = () => {
    router.push('/setting')
    console.log('Settings pressed');
    // Navigate to settings screen
  };

 
  const { user,logout } = useUserStore();
  const handleAvatarEdit = () => {
    console.log('logout');
    logout();
    // Open avatar selection modal
  };
  const router = useRouter();
  console.log("UserProfileScreen",user);
  React.useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user]);

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
        {/* Header with Settings */}
        <HStack className="justify-between items-center px-6 py-4">
          <View style={{ width: 40 }} />
          <Heading size="xl" style={{ color: '#1B4B07', fontWeight: 'bold', fontFamily : 'Baloo2_700Bold' }}>
            Hồ sơ của tôi
          </Heading>
          <Pressable
            onPress={handleSettingsPress}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderRadius: 20,
              width: 40,
              height: 40,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            
          >
            <Ionicons name="settings" size={20} color="#1B4B07" />
          </Pressable>
        </HStack>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {/* Avatar & Name Section */}
          <VStack space="md" className="items-center mt-6 mb-8">
            <Pressable onPress={handleAvatarEdit}>
              <View style={{ position: 'relative' }}>
                <ExpoImage
                  source={{ uri: user?.avatar }}
                  cachePolicy={'memory-disk'}
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 60,
                    borderWidth: 4,
                    borderColor: 'white',
                  }}
                  alt="User Avatar"
                />
                <View
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: '#4285f4',
                    borderRadius: 18,
                    width: 36,
                    height: 36,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 3,
                    borderColor: 'white',
                  }}
                >
                  <Ionicons name="pencil" size={16} color="white" />
                </View>
              </View>
            </Pressable>
            <Heading size="2xl" style={{ color: '#1B4B07', fontWeight: 'bold' }}>
              {user?.name}
            </Heading>
          </VStack>

          {/* Stats Section */}
          <VStack space="md" className="px-6 mb-8">
            <Heading size="lg" style={{ color: '#1B4B07', fontWeight: 'bold' }}>
              Hoạt động của bé
            </Heading>
            <HStack space="md" className="justify-between">
              <StatCard
                icon="⭐"
                number={20}
                label="Sao thưởng"
                bgColor="#FFC107"
                textColor="white"
              />
              <StatCard
                icon="📚"
                number={20}
                label="Truyện đã đọc"
                bgColor="#2196F3"
                textColor="white"
              />
            </HStack>
          </VStack>

          {/* Achievements Section */}
          {/* <VStack space="md" className="px-6 mb-8">
            <Heading size="lg" style={{ color: '#1B4B07', fontWeight: 'bold' }}>
              Bộ sưu tập Huy hiệu
            </Heading>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                rowGap: 20,
              }}
            >
              {badges.map((badge, index) => (
                <BadgeItem key={badge.id} badge={badge} index={index} />
              ))}
            </View>
          </VStack> */}

          {/* Recent Rewards Section */}
          {/* <VStack space="md" className="mb-8">
            <Heading size="lg" style={{ color: '#1B4B07', fontWeight: 'bold', paddingHorizontal: 24 }}>
              Phần thưởng mới mở khóa
            </Heading>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24 }}
            >
              {recentRewards.map((reward) => (
                <RewardCard key={reward.id} reward={reward} />
              ))}
            </ScrollView>
          </VStack> */}

          {/* Favorite Story Section */}
          {/* <VStack space="md" className="mb-8">
            <Heading size="lg" style={{ color: '#1B4B07', fontWeight: 'bold', paddingHorizontal: 24 }}>
              Câu chuyện yêu thích
            </Heading>
            <FavoriteStoryCard story={favoriteStory} />
          </VStack> */}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
