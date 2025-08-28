import { Center } from '@/components/ui/center';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useLoadingProgress } from '@/hooks/useLoadingProgress';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  StatusBar,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface LoadingScreenProps {
  message?: string;
  isLoaded?: boolean;
}

// Gamified Progress Bar Component
const GameProgressBar = ({ progress }: { progress?: number }) => {
    const progressAnim = useRef(new Animated.Value(0)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;
    const shimmerAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
  
    // chiều rộng đo theo layout thực tế
    const [barWidth, setBarWidth] = React.useState(0);
    // text % render an toàn
    const [percent, setPercent] = React.useState(0);
  
    useEffect(() => {
      const id = progressAnim.addListener(({ value }) => {
        setPercent(Math.round(value * 100));
      });
  
      const glowLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
        ])
      );
  
      const shimmerLoop = Animated.loop(
        Animated.timing(shimmerAnim, { toValue: 1, duration: 1800, useNativeDriver: true })
      );
  
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 1500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        ])
      );
  
      glowLoop.start();
      shimmerLoop.start();
      pulseLoop.start();
  
      // cập nhật progress
      if (typeof progress === 'number') {
        Animated.timing(progressAnim, {
          toValue: Math.max(0, Math.min(1, progress / 100)),
          duration: 800,
          useNativeDriver: false, // width/left -> false
        }).start();
      } else {
        Animated.timing(progressAnim, {
          toValue: 1, duration: 5000, useNativeDriver: false,
        }).start();
      }
  
      return () => {
        progressAnim.removeListener(id);
        glowLoop.stop(); shimmerLoop.stop(); pulseLoop.stop();
      };
    }, [progress]);
  
    const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.8] });
    const shimmerTranslate = shimmerAnim.interpolate({ inputRange: [0, 1], outputRange: [-100, 100] });
  
    // các giá trị phụ thuộc barWidth
    const fillWidth = progressAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%'],
    });
  
    const dotLeft = progressAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, Math.max(0, barWidth - 20)], // 20 = kích thước dot
      extrapolate: 'clamp',
    });
  
    return (
      <VStack space="xl" className="items-center">
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <View
            onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
            accessible
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 0, max: 100, now: percent }}
            style={{ width: screenWidth * 0.8, height: 16, position: 'relative' }}
          >
            {/* Glow */}
            <Animated.View
              style={{
                position: 'absolute', width: '100%', height: 24, top: -4, borderRadius: 12,
                backgroundColor: '#22C55E', opacity: glowOpacity, elevation: 15,
              }}
            />
  
            {/* Track */}
            <View
              style={{
                width: '100%', height: 16, backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: 8, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', overflow: 'hidden',
              }}
            >
              {/* Fill */}
              <Animated.View style={{ width: fillWidth, height: '100%', borderRadius: 6, overflow: 'hidden' }}>
                <LinearGradient
                  colors={['#4ADE80', '#22C55E', '#16A34A']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={{ flex: 1, position: 'relative' }}
                >
                  {/* Shimmer riêng */}
                  <Animated.View
                    style={{
                      position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.3)',
                      transform: [{ translateX: shimmerTranslate }],
                    }}
                  />
                </LinearGradient>
              </Animated.View>
            </View>
  
            {/* Dot */}
            <Animated.View
              style={{
                position: 'absolute',
                left: dotLeft,
                top: -2,
                width: 20, height: 20,
                justifyContent: 'center', alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 16 }}>🌍</Text>
            </Animated.View>
          </View>
        </Animated.View>
  
      </VStack>
    );
  };
  

// Floating Elements Animation
const FloatingElement = ({ 
  emoji, 
  delay = 0, 
  startX, 
  startY 
}: { 
  emoji: string; 
  delay?: number; 
  startX: number; 
  startY: number; 
}) => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const floatAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000 + Math.random() * 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000 + Math.random() * 2000,
          useNativeDriver: true,
        }),
      ])
    );

    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    );

    setTimeout(() => {
      floatAnimation.start();
      rotateAnimation.start();
    }, delay);

    return () => {
      floatAnimation.stop();
      rotateAnimation.stop();
    };
  }, [delay]);





  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: startX,
        top: startY,
       
      }}
    >
      <Text style={{ fontSize: 24 }}>{emoji}</Text>
    </Animated.View>
  );
};

export default function LoadingScreen({ 
  message = "Đang tải...", 
  isLoaded = false

}: LoadingScreenProps) {
  const progress = useLoadingProgress(isLoaded)
  const logoScaleAnim = useRef(new Animated.Value(0.8)).current;
  const logoRotateAnim = useRef(new Animated.Value(0)).current;
  const fadeInAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo entrance animation
    Animated.sequence([
      Animated.timing(fadeInAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(logoScaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Gentle logo rotation
    Animated.loop(
      Animated.timing(logoRotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

 
  return (
    <View style={{ flex: 1 }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Background Gradient */}
      <LinearGradient
        colors={['#EEF0FE', '#CAFEC3']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />



      <SafeAreaView style={{ flex: 1 }}>
        <Center style={{ flex: 1 }}>
          <Animated.View
            style={{
              opacity: fadeInAnim,
              transform: [
                { scale: logoScaleAnim },
              ],
            }}
          >
            <VStack space="2xl" className="items-center">
              {/* Logo */}
              <View
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: 100,
                  padding: 20,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.15,
                  shadowRadius: 16,
                  elevation: 10,
                }}
              >
                <ExpoImage
                  source={require('@/assets/images/eco_kids_logo2.png')}
                  style={{
                    width: 120,
                    height: 120,
                  }}
                  contentFit="contain"
                  cachePolicy="memory-disk"
                />
              </View>

              {/* App Title */}
              <Text
                style={{
                  color: '#1B4B07',
                  fontSize: 28,
                  fontFamily: 'Baloo2_700Bold',
                  textAlign: 'center',
                  textShadowColor: 'rgba(255, 255, 255, 0.8)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                }}
              >
                EcoKids
              </Text>

              {/* Loading Message */}
              <Text
                style={{
                  color: '#4A5568',
                  fontSize: 16,
                  fontFamily: 'NunitoSans_600SemiBold',
                  textAlign: 'center',
                  marginBottom: 20,
                }}
              >
                {message}
              </Text>

              {/* Progress Bar */}
              <GameProgressBar progress={progress} />
            </VStack>
          </Animated.View>
        </Center>

        {/* Footer Text */}
        <View style={{ paddingBottom: 40, alignItems: 'center' }}>
          <Text
            style={{
              color: '#6B7280',
              fontSize: 12,
              fontFamily: 'NunitoSans_400Regular',
              textAlign: 'center',
            }}
          >
            Khám phá thế giới xanh cùng bé! 🌍
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}
