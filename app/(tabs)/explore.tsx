import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StatusBar, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// GlueStack UI Components
import { Center } from '@/components/ui/center';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

export default function ExploreScreen() {
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
      
      {/* Decorative Elements */}
      <View style={{ position: 'absolute', top: 100, left: 20, zIndex: 1 }}>
        <Text style={{ fontSize: 32, opacity: 0.8 }}>🦋</Text>
      </View>
      <View style={{ position: 'absolute', top: 150, right: 40, zIndex: 1 }}>
        <Text style={{ fontSize: 24, opacity: 0.6 }}>🌺</Text>
      </View>
      <View style={{ position: 'absolute', top: 250, left: 60, zIndex: 1 }}>
        <Text style={{ fontSize: 28, opacity: 0.7 }}>🐝</Text>
      </View>

      <SafeAreaView className="flex-1">
        <Center className="flex-1 px-6">
          <VStack space="lg" className="items-center">
            <Text style={{ fontSize: 80 }}>🔍</Text>
            <Heading size="3xl" style={{ color: '#1B4B07', fontWeight: 'bold', textAlign: 'center' }}>
              Khám phá
            </Heading>
            <Text size="lg" style={{ color: '#399018', textAlign: 'center' }}>
              Tìm hiểu thêm về thế giới xung quanh bé
            </Text>
            <VStack space="md" className="mt-8 items-center">
              <Text style={{ fontSize: 48 }}>🌍</Text>
              <Text style={{ color: '#1B4B07', fontSize: 16, textAlign: 'center' }}>
                Chức năng đang được phát triển...
              </Text>
            </VStack>
          </VStack>
        </Center>
      </SafeAreaView>
    </View>
  );
}
