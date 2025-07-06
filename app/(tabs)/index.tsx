import { Button, ButtonText } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { router } from 'expo-router';
import React from 'react';

export default function HomeScreen() {
  const handleLogin = () => {
    router.push('/login');
  };

  const handleRegister = () => {
    router.push('/register');
  };

  return (
    <Center className="flex-1 bg-background-0 px-6">
      <VStack space="lg" className="w-full max-w-sm">
        <VStack space="md" className="items-center">
          <Text size="3xl" className="font-bold text-typography-900 text-center">
            Green Tales
          </Text>
          <Text size="lg" className="text-typography-600 text-center">
            Chào mừng bạn đến với ứng dụng
          </Text>
        </VStack>
        
        <VStack space="md" className="mt-8">
          <Button
            size="lg"
            action="primary"
            variant="solid"
            onPress={handleLogin}
            className="w-full"
          >
            <ButtonText>Đăng nhập</ButtonText>
          </Button>
          
          <Button
            size="lg"
            action="secondary"
            variant="outline"
            onPress={handleRegister}
            className="w-full"
          >
            <ButtonText>Đăng ký</ButtonText>
          </Button>
        </VStack>
      </VStack>
    </Center>
  );
}
