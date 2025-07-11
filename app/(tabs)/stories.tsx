import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';

// Story Card Component
const StoryCard = ({ title, emoji, color, progress }: any) => (
  <Box 
    className="rounded-2xl p-4 mr-4 w-40"
    style={{ 
      backgroundColor: color,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4
    }}
  >
    <VStack space="sm">
      <Text className="text-4xl text-center">{emoji}</Text>
      <Text 
        size="md" 
        className="font-bold text-center"
        style={{ color: '#1B4B07' }}
      >
        {title}
      </Text>
      {progress && (
        <Box className="w-full">
          <Box 
            className="h-2 rounded-full"
            style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}
          >
            <Box 
              className="h-2 rounded-full"
              style={{ 
                backgroundColor: '#5EF02C',
                width: `${progress}%`
              }}
            />
          </Box>
        </Box>
      )}
    </VStack>
  </Box>
);

export default function StoriesScreen() {
  return (
    <ScrollView className="flex-1" style={{ backgroundColor: '#CAFEC3' }}>
      <Box className="relative min-h-screen">
        {/* Gradient Background */}
        <LinearGradient
          colors={['#CAFEC3', '#E8F5E8', '#F5FBF5']}
          className="absolute inset-0"
        />
        
        {/* Decorative elements */}
        <Box className="absolute top-10 left-4">
          <Text className="text-4xl">📚</Text>
        </Box>
        <Box className="absolute top-20 right-8">
          <Text className="text-2xl opacity-40">✨</Text>
        </Box>
        
        <VStack space="lg" className="px-6 pt-16 pb-24">
          {/* Header */}
          <VStack space="sm" className="items-center">
            <Text 
              size="3xl" 
              className="font-bold text-center"
              style={{ color: '#1B4B07' }}
            >
              Thư viện truyện
            </Text>
            <Text 
              size="lg" 
              className="text-center"
              style={{ color: '#1B4B07' }}
            >
              Khám phá những câu chuyện thú vị!
            </Text>
          </VStack>

          {/* Continue Reading Section */}
          <VStack space="md">
            <Text 
              size="xl" 
              className="font-bold"
              style={{ color: '#1B4B07' }}
            >
              Đang đọc
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <HStack space="md" className="px-2">
                <StoryCard 
                  title="Chú bướm xinh" 
                  emoji="🦋" 
                  color="#DDA0DD" 
                  progress={60}
                />
                <StoryCard 
                  title="Hạt giống nhỏ" 
                  emoji="🌱" 
                  color="#90EE90" 
                  progress={25}
                />
              </HStack>
            </ScrollView>
          </VStack>

          {/* Popular Stories Section */}
          <VStack space="md">
            <Text 
              size="xl" 
              className="font-bold"
              style={{ color: '#1B4B07' }}
            >
              Truyện phổ biến
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <HStack space="md" className="px-2">
                <StoryCard 
                  title="Ong nhỏ thông minh" 
                  emoji="🐝" 
                  color="#FFD700" 
                />
                <StoryCard 
                  title="Cây xanh của bé" 
                  emoji="🌳" 
                  color="#98FB98" 
                />
                <StoryCard 
                  title="Giọt nước du lịch" 
                  emoji="💧" 
                  color="#87CEEB" 
                />
                <StoryCard 
                  title="Mặt trời tốt bụng" 
                  emoji="☀️" 
                  color="#FFA500" 
                />
              </HStack>
            </ScrollView>
          </VStack>

          {/* New Stories Section */}
          <VStack space="md">
            <Text 
              size="xl" 
              className="font-bold"
              style={{ color: '#1B4B07' }}
            >
              Truyện mới
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <HStack space="md" className="px-2">
                <StoryCard 
                  title="Chú gấu trúc" 
                  emoji="🐼" 
                  color="#F0F0F0" 
                />
                <StoryCard 
                  title="Cá heo vui vẻ" 
                  emoji="🐬" 
                  color="#B0E0E6" 
                />
                <StoryCard 
                  title="Rừng xanh kỳ diệu" 
                  emoji="🌲" 
                  color="#228B22" 
                />
              </HStack>
            </ScrollView>
          </VStack>
        </VStack>
      </Box>
    </ScrollView>
  );
} 