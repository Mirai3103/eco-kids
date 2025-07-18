import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
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

const { width: screenWidth } = Dimensions.get('window');

// Sample story data (would come from API based on ID)
const storyData = {
  id: '1',
  title: 'Cuộc phiêu lưu của chú ong nhỏ',
  synopsis: 'Hãy cùng chú ong nhỏ khám phá khu vườn đầy màu sắc và học cách làm mật ngọt ngào. Một câu chuyện tuyệt vời về sự chăm chỉ và tình yêu thiên nhiên.',
  image: require('@/assets/images/sample1.jpg'),
  author: 'Huu Hoang',
  topic: 'Thiên nhiên',
  length: '8 phút',
  difficulty: 'Dễ',
  tags: [
    { icon: '✍️', label: 'Tác giả: Huu Hoang', color: '#E3F2FD' },
    { icon: '🌳', label: 'Chủ đề: Thiên nhiên', color: '#E8F5E8' },
  ]
};

// Tag Component
const InfoTag = ({ tag }: { tag: typeof storyData.tags[0] }) => {
  return (
    <View
      style={{
        backgroundColor: tag.color,
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginHorizontal: 4,
        marginVertical: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
      }}
    >
      <HStack space="xs" className="items-center">
        <Text style={{ fontSize: 12 }}>{tag.icon}</Text>
        <Text
          style={{
            color: '#1B4B07',
            fontSize: 12,
            fontWeight: '600',
          }}
        >
          {tag.label}
        </Text>
      </HStack>
    </View>
  );
};

// 3D Primary Button Component
const PrimaryButton = ({ title, onPress }: { title: string; onPress: () => void }) => {
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
        <View style={{ position: 'relative' }}>
          {/* Shadow/Bottom layer */}
          <View
            style={{
              backgroundColor: '#2E7D32',
              height: 56,
              borderRadius: 16,
              position: 'absolute',
              top: 4,
              left: 0,
              right: 0,
            }}
          />
          {/* Top layer */}
          <View
            style={{
              backgroundColor: '#4CAF50',
              height: 56,
              borderRadius: 16,
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 32,
            }}
          >
            <Text
              style={{
                color: 'white',
                fontWeight: 'bold',
                fontSize: 18,
                textTransform: 'uppercase',
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

// Secondary Outline Button Component
const SecondaryButton = ({ title, onPress }: { title: string; onPress: () => void }) => {
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
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderColor: '#4CAF50',
            height: 56,
            borderRadius: 16,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 32,
          }}
        >
          <Text
            style={{
              color: '#4CAF50',
              fontWeight: 'bold',
              fontSize: 16,
              textTransform: 'uppercase',
            }}
          >
            {title}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
};

// Main Content Component with entrance animations
const StoryContent = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.stagger(200, [
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <VStack space="2xl" className=" px-6">
        {/* Image Block */}
        <View
          style={{
            backgroundColor: 'white',
            borderRadius: 24,
            padding: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 16,
            elevation: 10,
            width: screenWidth - 32,
          }}
        >
          <ExpoImage
            source={{uri:'https://sggniqcffaupphqfevrp.supabase.co/storage/v1/object/public/asset//ChatGPT%20Image%2022_10_30%2016%20thg%207,%202025.png'}}
            style={{
              width: '100%',
              height: 240,
              borderRadius: 16,
            }}
            alt="Story Cover"
            contentFit="cover"
            cachePolicy={'memory-disk'}
          />
        </View>

        {/* Info Block */}
        <VStack space="lg" className="items-center">
          {/* Story Title */}
          <Text
            size="3xl"
            style={{
              color: '#1B4B07',
              textAlign: 'center',
              lineHeight: 42,
              marginBottom: 8,
              fontSize: 36,
              
            }}
            className='font-heading'
          >
            {storyData.title}
          </Text>
         
          {/* Story Synopsis */}
          <Text
            style={{
              color: '#4A5568',
              fontSize: 16,
              lineHeight: 24,
              textAlign: 'center',
              marginBottom: 0,
              paddingHorizontal: 8,
            }}
            className='font-body'
          >
            {storyData.synopsis}
          </Text>

          {/* Info Tags */}
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              maxWidth: screenWidth - 40,
            }}
          >
            {storyData.tags.map((tag, index) => (
              <InfoTag key={index} tag={tag} />
            ))}
          </View>
        </VStack>

        {/* Action Buttons Block */}
        <VStack space="md" className="w-full" style={{ marginTop: 10 }}>
          <PrimaryButton
            title="Bắt đầu Đọc"
            onPress={() => {
              console.log('Start reading story');
              // Navigate to story reader
              router.push(`/stories/${storyData.id}`);
            }}
          />
          
          <SecondaryButton
            title="Làm Bài đố"
            onPress={() => {
              console.log('Take quiz');
              // Navigate to story quiz
              router.push(`/stories/${storyData.id}`);
            }}
          />
        </VStack>
      </VStack>
    </Animated.View>
  );
};

export default function StoryDetailsScreen() {
  const params = useLocalSearchParams();
  const storyId = params.id as string;

  const handleBack = () => {
    router.back();
  };

  // In a real app, fetch story data based on storyId
  console.log('Story ID:', storyId);

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F8FA' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F8FA" />

      <SafeAreaView className="flex-1">
        {/* Header */}
        <HStack className="justify-between items-center px-6 py-4">
          <Pressable
            onPress={handleBack}
            style={{
              backgroundColor: 'white',
              borderRadius: 20,
              width: 40,
              height: 40,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Ionicons name="arrow-back" size={20} color="#1B4B07" />
          </Pressable>

          <Heading size="lg" style={{ color: '#1B4B07', fontWeight: 'bold' }}>
          </Heading>

          <View style={{ width: 40 }} />
        </HStack>

        {/* Main Content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ 
            paddingBottom: 40,
            flexGrow: 1,
            paddingTop: 20,
          }}
        >
          <StoryContent />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
