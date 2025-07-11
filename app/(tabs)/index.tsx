import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';

// Custom 3D Button Component
const ThreeDButton = ({ 
  children, 
  onPress, 
  variant = 'primary',
  size = 'lg',
  className = '' 
}: any) => {
  const isPrimary = variant === 'primary';
  const topColor = isPrimary ? '#2857E0' : '#5EF02C';
  const bottomColor = isPrimary ? '#183999' : '#3BA318';
  
  return (
    <Pressable onPress={onPress} className={`${className}`}>
      {({ pressed }) => (
        <View className="relative">
          {/* Bottom shadow layer */}
          <View 
            className={`absolute top-1 left-0 right-0 h-full rounded-2xl`}
            style={{ backgroundColor: bottomColor }}
          />
          
          {/* Top button layer */}
          <View 
            className={`rounded-2xl ${pressed ? 'translate-y-1' : ''} transition-all duration-150`}
            style={{ 
              backgroundColor: topColor,
              paddingVertical: size === 'lg' ? 16 : 12,
              paddingHorizontal: 24
            }}
          >
            <Text className="text-white font-bold text-center text-lg tracking-wide">
              {children}
            </Text>
          </View>
        </View>
      )}
    </Pressable>
  );
};

// Topic Icon Component
const TopicIcon = ({ icon, label, color }: any) => (
  <VStack space="xs" className="items-center mx-3">
    <Box 
      className="w-16 h-16 rounded-2xl items-center justify-center"
      style={{ backgroundColor: color }}
    >
      <Text className="text-2xl">{icon}</Text>
    </Box>
    <Text size="sm" className="text-typography-700 font-medium">{label}</Text>
  </VStack>
);

export default function HomeScreen() {
  const handleStartReading = () => {
    router.push('/explore');
  };

  const handleContinueReading = () => {
    router.push('/explore');
  };

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: '#CAFEC3' }}>
      {/* Background with decorative elements */}
      <Box className="relative min-h-screen">
        {/* Gradient Background */}
        <LinearGradient
          colors={['#CAFEC3', '#E8F5E8', '#F5FBF5']}
          className="absolute inset-0"
        />
        
        {/* Decorative elements */}
        <Box className="absolute top-10 right-4 w-20 h-20">
          <Text className="text-6xl">🐸</Text>
        </Box>
        
        {/* Floating decorations */}
        <Box className="absolute top-32 left-8">
          <Text className="text-2xl opacity-30">🍃</Text>
        </Box>
        <Box className="absolute top-96 right-12">
          <Text className="text-xl opacity-40">✨</Text>
        </Box>
        <Box className="absolute top-80 left-16">
          <Text className="text-lg opacity-35">☀️</Text>
        </Box>
        
        <VStack space="lg" className="px-6 pt-16 pb-24">
          {/* Featured Story Card */}
          <Box 
            className="rounded-3xl p-6 shadow-lg"
            style={{ 
              backgroundColor: '#EFF1EF',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 8
            }}
          >
            <VStack space="lg">
              <Text 
                size="2xl" 
                className="font-bold text-center" 
                style={{ color: '#1B4B07', fontFamily: 'NunitoSans_400Regular' }}
              >
                Cùng khám phá nào!
              </Text>
              
              {/* Story illustration placeholder */}
              <Box 
                className="w-full h-40 rounded-2xl items-center justify-center"
                style={{ backgroundColor: '#A8E6A3' }}
              >
                <VStack space="sm" className="items-center">
                  <Text className="text-6xl">🌱</Text>
                  <Text className="text-4xl">📚</Text>
                </VStack>
              </Box>
              
              <Text 
                size="xl" 
                className="font-bold text-center"
                style={{ color: '#1B4B07' }}
              >
                Cuộc phiêu lưu của hạt giống nhỏ
              </Text>
              
              <ThreeDButton 
                variant="primary" 
                onPress={handleStartReading}
                className="w-full"
              >
                BẮT ĐẦU ĐỌC
              </ThreeDButton>
            </VStack>
          </Box>

          {/* Continue Reading Card */}
          <Box 
            className="rounded-3xl p-6 shadow-lg"
            style={{ 
              backgroundColor: '#FFFFFF',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 8
            }}
          >
            <VStack space="md">
              <Text 
                size="xl" 
                className="font-bold"
                style={{ color: '#1B4B07' }}
              >
                Đọc tiếp nào...
              </Text>
              
              <HStack space="md" className="items-center">
                <Box 
                  className="w-16 h-16 rounded-xl items-center justify-center"
                  style={{ backgroundColor: '#B8E6B8' }}
                >
                  <Text className="text-2xl">🦋</Text>
                </Box>
                
                <VStack space="xs" className="flex-1">
                  <Text 
                    size="md" 
                    className="font-semibold"
                    style={{ color: '#1B4B07' }}
                  >
                    Chú bướm xinh đẹp
                  </Text>
                  
                  {/* Progress bar */}
                  <Box className="w-full">
                    <Box 
                      className="h-3 rounded-full"
                      style={{ backgroundColor: '#E0E0E0' }}
                    >
                      <Box 
                        className="h-3 rounded-full"
                        style={{ 
                          backgroundColor: '#5EF02C',
                          width: '60%'
                        }}
                      />
                    </Box>
                  </Box>
                  
                  <Text size="xs" className="text-typography-500">
                    60% hoàn thành
                  </Text>
                </VStack>
              </HStack>
              
              <ThreeDButton 
                variant="secondary" 
                size="md"
                onPress={handleContinueReading}
              >
                ĐỌC TIẾP
              </ThreeDButton>
            </VStack>
          </Box>

          {/* Explore Topics Card */}
          <Box 
            className="rounded-3xl p-6 shadow-lg"
            style={{ 
              backgroundColor: '#EFF1EF',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 8
            }}
          >
            <VStack space="lg">
              <Text 
                size="xl" 
                className="font-bold"
                style={{ color: '#1B4B07' }}
              >
                Chủ đề yêu thích
              </Text>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <HStack space="md" className="px-2">
                  <TopicIcon icon="💧" label="Nước" color="#87CEEB" />
                  <TopicIcon icon="🌿" label="Cây cối" color="#90EE90" />
                  <TopicIcon icon="🦋" label="Côn trung" color="#DDA0DD" />
                  <TopicIcon icon="🌈" label="Màu sắc" color="#FFB6C1" />
                  <TopicIcon icon="🌍" label="Địa cầu" color="#98FB98" />
                  <TopicIcon icon="☀️" label="Thời tiết" color="#FFD700" />
                </HStack>
              </ScrollView>
            </VStack>
          </Box>
        </VStack>
      </Box>
    </ScrollView>
  );
}
