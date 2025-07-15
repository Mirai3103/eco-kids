import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Pressable,
  StatusBar,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// GlueStack UI Components
import { Center } from '@/components/ui/center';
import { Heading } from '@/components/ui/heading';
import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Floating Element Component
const FloatingElement = ({ 
  emoji, 
  initialPosition, 
  animationDuration = 4000 
}: {
  emoji: string;
  initialPosition: { x: number; y: number };
  animationDuration?: number;
}) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const floatAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -30,
          duration: animationDuration,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: animationDuration,
          useNativeDriver: true,
        }),
      ])
    );

    const opacityAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: animationDuration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: animationDuration / 2,
          useNativeDriver: true,
        }),
      ])
    );

    floatAnimation.start();
    opacityAnimation.start();

    return () => {
      floatAnimation.stop();
      opacityAnimation.stop();
    };
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: initialPosition.x,
        top: initialPosition.y,
        transform: [{ translateY }],
        opacity,
        zIndex: 1,
      }}
    >
      <Text style={{ fontSize: 24 }}>{emoji}</Text>
    </Animated.View>
  );
};

// 3D Google Button Component
const GoogleButton = ({ onPress }: { onPress: () => void }) => {
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
              height: 56,
              borderRadius: 16,
              position: 'absolute',
              top: 6,
              left: 0,
              right: 0,
            }}
            className='bg-red-600'
          />
          {/* Top layer */}
          <View
            style={{
              height: 56,
              borderRadius: 16,
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 32,
              flexDirection: 'row',
            }}
            className='bg-red-400'
          >
            {/* Google G Logo */}
            <View
              style={{
                backgroundColor: 'white',
                width: 24,
                height: 24,
                borderRadius: 12,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
              }}
            >
              <Text style={{ color: '#4285f4', fontSize: 16, fontWeight: 'bold' }}>
                G
              </Text>
            </View>
            
            <Text
              style={{
                color: 'white',
                fontWeight: 'bold',
                fontSize: 16,
                textTransform: 'uppercase',
              }}
            >
              Tiếp tục với Google
            </Text>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
};

// Skip Button Component
const SkipButton = ({ onPress }: { onPress: () => void }) => {
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
        <Text
          style={{
            color: '#1B4B07',
            fontSize: 16,
            fontWeight: '500',
            textDecorationLine: 'underline',
            textAlign: 'center',
          }}
        >
          Tiếp tục không cần đăng nhập
        </Text>
      </Animated.View>
    </Pressable>
  );
};

// Main Component with entrance animations
const LoginContent = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <VStack space="xl" className="items-center px-8">
        {/* Welcome Headline */}
        <VStack space="md" className="items-center">
          <Heading
            size="3xl"
            style={{
              color: '#1B4B07',
              fontWeight: 'bold',
              textAlign: 'center',
              lineHeight: 42,
            }}
          >
            Chào mừng đến với EcoKids!
          </Heading>
        </VStack>

        {/* Central Logo */}
        <View className="items-center my-2">
          <Image
            source={require('@/assets/images/EcoKidsLogo2.png')}
            alt="EcoKids Logo"
            resizeMode="center"
            className='h-80 w-80'
          />
        </View>

        {/* Subheading */}
        <Text
          size="lg"
          style={{
            color: '#399018',
            textAlign: 'center',
            fontWeight: '500',
            marginBottom:24,
            lineHeight: 24,
          }}
        >
          Hãy cùng nhau khám phá hành tinh xanh nhé!
        </Text>

        {/* Action Buttons */}
        <VStack space="lg" className="w-full">
          <GoogleButton 
            onPress={() => {
              console.log('Google login pressed');
              // Handle Google authentication
              router.push('/(tabs)');
            }}
          />
          
          <SkipButton 
            onPress={() => {
              console.log('Skip login pressed');
              // Continue without login
              router.push('/(tabs)');
            }}
          />
        </VStack>
      </VStack>
    </Animated.View>
  );
};

export default function LoginScreen() {
  // Floating elements positions
  const floatingElements = [
    { emoji: '☁️', position: { x: 50, y: 100 }, duration: 5000 },
    { emoji: '🍃', position: { x: screenWidth - 80, y: 150 }, duration: 4000 },
    { emoji: '☁️', position: { x: 30, y: 250 }, duration: 6000 },
    { emoji: '🌱', position: { x: screenWidth - 60, y: 320 }, duration: 4500 },
    { emoji: '☁️', position: { x: screenWidth - 100, y: 450 }, duration: 5500 },
    { emoji: '🍃', position: { x: 70, y: 500 }, duration: 4200 },
    { emoji: '✨', position: { x: screenWidth - 50, y: 600 }, duration: 3800 },
    { emoji: '🌸', position: { x: 40, y: 650 }, duration: 4800 },
  ];

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

      {/* Floating Decorative Elements */}
      {floatingElements.map((element, index) => (
        <FloatingElement
          key={index}
          emoji={element.emoji}
          initialPosition={element.position}
          animationDuration={element.duration}
        />
      ))}

      <SafeAreaView className="flex-1">
        <Center className="flex-1">
          <LoginContent />
        </Center>
      </SafeAreaView>
    </View>
  );
}
