import { Button, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField } from '@/components/ui/input';
import { KeyboardAvoidingView } from '@/components/ui/keyboard-avoiding-view';
import { Pressable } from '@/components/ui/pressable';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import Icon from '@react-native-vector-icons/fontawesome';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Platform } from 'react-native';


export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    // Giả lập đăng nhập
    setTimeout(() => {
      setIsLoading(false);
      // Ở đây bạn có thể thêm logic đăng nhập thật
      console.log('Đăng nhập với:', { email, password });
    }, 1500);
  };

  const handleGoogleLogin = () => {
    console.log('Đăng nhập với Google');
    // Ở đây bạn có thể thêm logic đăng nhập Google
  };

  const handleAppleLogin = () => {
    console.log('Đăng nhập với Apple');
    // Ở đây bạn có thể thêm logic đăng nhập Apple
  };

  const goToRegister = () => {
    router.push('/register');
  };

  const goBack = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-background-0">
      <StatusBar style="auto" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <VStack className="flex-1 px-6 pt-8">
          {/* Header */}
          <HStack className="items-center justify-between mb-8">
            <Pressable onPress={goBack}>
              <Text size="lg" className="text-primary-600">
                ← Quay lại
              </Text>
            </Pressable>
          </HStack>

          {/* Title Section */}
          <VStack space="sm" className="mb-8">
            <Heading size="3xl" className="text-typography-900">
              Đăng nhập
            </Heading>
            <Text size="lg" className="text-typography-600">
              Chào mừng bạn trở lại!
            </Text>
          </VStack>

          {/* Form Section */}
          <VStack space="lg" className="flex-1">
            <VStack space="md">
              <VStack space="xs">
                <Text size="sm" className="text-typography-700 font-medium">
                  Email
                </Text>
                <Input
                  variant="outline"
                  size="lg"
                  className="bg-background-50"
                >
                  <InputField
                    placeholder="Nhập email của bạn"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                </Input>
              </VStack>

              <VStack space="xs">
                <Text size="sm" className="text-typography-700 font-medium">
                  Mật khẩu
                </Text>
                <Input
                  variant="outline"
                  size="lg"
                  className="bg-background-50"
                >
                  <InputField
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoComplete="password"
                  />
                </Input>
              </VStack>

              <HStack className="justify-end">
                <Pressable>
                  <Text size="sm" className="text-primary-600">
                    Quên mật khẩu?
                  </Text>
                </Pressable>
              </HStack>
            </VStack>

            {/* Login Button */}
            <Button
              size="lg"
              action="primary"
              variant="solid"
              onPress={handleLogin}
              disabled={!email || !password || isLoading}
              className="w-full mt-4"
            >
              <ButtonText>
                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </ButtonText>
            </Button>

            {/* Divider */}
            <VStack space="sm" className="my-4">
              <HStack className="items-center justify-center">
                <Divider className="flex-1" />
                <Text size="sm" className="px-4 text-typography-500">
                  hoặc
                </Text>
                <Divider className="flex-1" />
              </HStack>
            </VStack>

            {/* Social Login Buttons */}
            <VStack space="md">
              <Button
                size="lg"
                action="default"
                variant="outline"
                onPress={handleGoogleLogin}
                className="w-full border-background-300"
              >
                <HStack space="sm" className="items-center">
                  <Icon name="google" size={20} color="#EA4335" />
                  <ButtonText className="text-typography-900">
                    Tiếp tục với Google
                  </ButtonText>
                </HStack>
              </Button>

              {Platform.OS === 'ios' && (
                <Button
                  size="lg"
                  action="default"
                  variant="outline"
                  onPress={handleAppleLogin}
                  className="w-full border-background-300"
                >
                  <HStack space="sm" className="items-center">
                    <Icon name="apple" size={20} color="#000000" />
                    <ButtonText className="text-typography-900">
                      Tiếp tục với Apple
                    </ButtonText>
                  </HStack>
                </Button>
              )}
            </VStack>

            {/* Register Link */}
            <HStack className="justify-center items-center mt-6">
              <Text size="md" className="text-typography-600">
                Chưa có tài khoản?{' '}
              </Text>
              <Pressable onPress={goToRegister}>
                <Text size="md" className="text-primary-600 font-semibold">
                  Đăng ký ngay
                </Text>
              </Pressable>
            </HStack>
          </VStack>
        </VStack>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} 