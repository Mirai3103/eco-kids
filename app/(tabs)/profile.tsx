import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';

// Achievement Badge Component
const AchievementBadge = ({ emoji, title, description, earned = false }: any) => (
  <Box 
    className="rounded-2xl p-4 items-center"
    style={{ 
      backgroundColor: earned ? '#FFD700' : '#F0F0F0',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
      opacity: earned ? 1 : 0.6
    }}
  >
    <VStack space="xs" className="items-center">
      <Text className="text-4xl">{emoji}</Text>
      <Text 
        size="sm" 
        className="font-bold text-center"
        style={{ color: '#1B4B07' }}
      >
        {title}
      </Text>
      <Text 
        size="xs" 
        className="text-center"
        style={{ color: '#666' }}
      >
        {description}
      </Text>
    </VStack>
  </Box>
);

// Stats Card Component
const StatsCard = ({ icon, number, label, color }: any) => (
  <Box 
    className="rounded-2xl p-4 flex-1"
    style={{ 
      backgroundColor: color,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4
    }}
  >
    <VStack space="xs" className="items-center">
      <Text className="text-3xl">{icon}</Text>
      <Text 
        size="2xl" 
        className="font-bold"
        style={{ color: '#1B4B07' }}
      >
        {number}
      </Text>
      <Text 
        size="sm" 
        className="font-medium text-center"
        style={{ color: '#1B4B07' }}
      >
        {label}
      </Text>
    </VStack>
  </Box>
);

export default function ProfileScreen() {
  return (
    <ScrollView className="flex-1" style={{ backgroundColor: '#CAFEC3' }}>
      <Box className="relative min-h-screen">
        {/* Gradient Background */}
        <LinearGradient
          colors={['#CAFEC3', '#E8F5E8', '#F5FBF5']}
          className="absolute inset-0"
        />
        
        {/* Decorative elements */}
        <Box className="absolute top-10 right-4">
          <Text className="text-3xl">🌟</Text>
        </Box>
        <Box className="absolute top-32 left-8">
          <Text className="text-2xl opacity-40">🏆</Text>
        </Box>
        
        <VStack space="lg" className="px-6 pt-16 pb-24">
          {/* Profile Header */}
          <VStack space="md" className="items-center">
            <Box className="relative">
              <Box 
                className="w-24 h-24 rounded-full items-center justify-center"
                style={{ backgroundColor: '#FFD93D' }}
              >
                <Text className="text-5xl">👶</Text>
              </Box>
              <Box 
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full items-center justify-center"
                style={{ backgroundColor: '#5EF02C' }}
              >
                <Text className="text-lg">🐸</Text>
              </Box>
            </Box>
            
            <VStack space="xs" className="items-center">
              <Text 
                size="2xl" 
                className="font-bold"
                style={{ color: '#1B4B07' }}
              >
                Bé Minh
              </Text>
              <Text 
                size="lg" 
                style={{ color: '#1B4B07' }}
              >
                Nhà thám hiểm nhỏ
              </Text>
            </VStack>
          </VStack>

          {/* Stats Section */}
          <VStack space="md">
            <Text 
              size="xl" 
              className="font-bold"
              style={{ color: '#1B4B07' }}
            >
              Thống kê học tập
            </Text>
            
            <HStack space="md">
              <StatsCard 
                icon="📚" 
                number="12" 
                label="Truyện đã đọc" 
                color="#87CEEB"
              />
              <StatsCard 
                icon="⭐" 
                number="245" 
                label="Điểm tích lũy" 
                color="#FFD700"
              />
            </HStack>
            
            <HStack space="md">
              <StatsCard 
                icon="🔥" 
                number="7" 
                label="Ngày liên tiếp" 
                color="#FF6B6B"
              />
              <StatsCard 
                icon="🏆" 
                number="5" 
                label="Huy hiệu" 
                color="#90EE90"
              />
            </HStack>
          </VStack>

          {/* Progress Section */}
          <VStack space="md">
            <Text 
              size="xl" 
              className="font-bold"
              style={{ color: '#1B4B07' }}
            >
              Tiến độ hôm nay
            </Text>
            
            <Box 
              className="rounded-2xl p-4"
              style={{ 
                backgroundColor: '#FFFFFF',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 4
              }}
            >
              <VStack space="md">
                <HStack className="justify-between items-center">
                  <Text 
                    size="md" 
                    className="font-semibold"
                    style={{ color: '#1B4B07' }}
                  >
                    Mục tiêu đọc hàng ngày
                  </Text>
                  <Text 
                    size="sm" 
                    style={{ color: '#666' }}
                  >
                    2/3 truyện
                  </Text>
                </HStack>
                
                <Box className="w-full">
                  <Box 
                    className="h-4 rounded-full"
                    style={{ backgroundColor: '#E0E0E0' }}
                  >
                    <Box 
                      className="h-4 rounded-full"
                      style={{ 
                        backgroundColor: '#5EF02C',
                        width: '67%'
                      }}
                    />
                  </Box>
                </Box>
              </VStack>
            </Box>
          </VStack>

          {/* Achievements Section */}
          <VStack space="md">
            <Text 
              size="xl" 
              className="font-bold"
              style={{ color: '#1B4B07' }}
            >
              Huy hiệu thành tích
            </Text>
            
            <VStack space="md">
              <HStack space="md">
                <AchievementBadge 
                  emoji="🌱" 
                  title="Người mới bắt đầu" 
                  description="Đọc truyện đầu tiên"
                  earned={true}
                />
                <AchievementBadge 
                  emoji="📚" 
                  title="Thích đọc sách" 
                  description="Đọc 10 truyện"
                  earned={true}
                />
                <AchievementBadge 
                  emoji="🔥" 
                  title="Kiên trì" 
                  description="Đọc 7 ngày liên tiếp"
                  earned={true}
                />
              </HStack>
              
              <HStack space="md">
                <AchievementBadge 
                  emoji="🌟" 
                  title="Siêu sao" 
                  description="Đạt 500 điểm"
                  earned={false}
                />
                <AchievementBadge 
                  emoji="🏆" 
                  title="Nhà vô địch" 
                  description="Hoàn thành tất cả chủ đề"
                  earned={false}
                />
                <AchievementBadge 
                  emoji="🎯" 
                  title="Chuyên gia" 
                  description="Đọc 50 truyện"
                  earned={false}
                />
              </HStack>
            </VStack>
          </VStack>
        </VStack>
      </Box>
    </ScrollView>
  );
} 