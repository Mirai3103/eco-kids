import { Button, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField } from '@/components/ui/input';
import { KeyboardAvoidingView } from '@/components/ui/keyboard-avoiding-view';
import { Pressable } from '@/components/ui/pressable';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import Icon from '@react-native-vector-icons/fontawesome';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Platform } from 'react-native';

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRegister = async () => {
    if (formData.password !== formData.confirmPassword) {
      console.log('Mật khẩu không khớp!');
      return;
    }

    setIsLoading(true);
    // Giả lập đăng ký
    setTimeout(() => {
      setIsLoading(false);
      // Ở đây bạn có thể thêm logic đăng ký thật
      console.log('Đăng ký với:', formData);
    }, 1500);
  };

  const handleGoogleRegister = () => {
    console.log('Đăng ký với Google');
    // Ở đây bạn có thể thêm logic đăng ký Google
  };

  const handleAppleRegister = () => {
    console.log('Đăng ký với Apple');
    // Ở đây bạn có thể thêm logic đăng ký Apple
  };

  const goToLogin = () => {
    router.push('/login');
  };

  const goBack = () => {
    router.back();
  };

  const isFormValid = () => {
    return formData.fullName && 
           formData.email && 
           formData.password && 
           formData.confirmPassword &&
           formData.password === formData.confirmPassword &&
           !isLoading;
  };

  return (
    <SafeAreaView className="flex-1 bg-background-0">
      <StatusBar style="auto" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1">
          <VStack className="flex-1 px-6 pt-8 pb-6">
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
                Đăng ký
              </Heading>
              <Text size="lg" className="text-typography-600">
                Tạo tài khoản mới để bắt đầu
              </Text>
            </VStack>

            {/* Social Login Buttons */}
            <VStack space="md" className="mb-6">
              <Button
                size="lg"
                action="default"
                variant="outline"
                onPress={handleGoogleRegister}
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
                  onPress={handleAppleRegister}
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

            {/* Divider */}
            <VStack space="sm" className="mb-6">
              <HStack className="items-center justify-center">
                <Divider className="flex-1" />
                <Text size="sm" className="px-4 text-typography-500">
                  hoặc đăng ký với email
                </Text>
                <Divider className="flex-1" />
              </HStack>
            </VStack>

            {/* Form Section */}
            <VStack space="lg">
              <VStack space="md">
                <VStack space="xs">
                  <Text size="sm" className="text-typography-700 font-medium">
                    Họ và tên
                  </Text>
                  <Input
                    variant="outline"
                    size="lg"
                    className="bg-background-50"
                  >
                    <InputField
                      placeholder="Nhập họ và tên của bạn"
                      value={formData.fullName}
                      onChangeText={(value) => updateFormData('fullName', value)}
                      autoCapitalize="words"
                      autoComplete="name"
                    />
                  </Input>
                </VStack>

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
                      value={formData.email}
                      onChangeText={(value) => updateFormData('email', value)}
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
                      placeholder="Tạo mật khẩu (ít nhất 6 ký tự)"
                      value={formData.password}
                      onChangeText={(value) => updateFormData('password', value)}
                      secureTextEntry
                      autoComplete="new-password"
                    />
                  </Input>
                </VStack>

                <VStack space="xs">
                  <Text size="sm" className="text-typography-700 font-medium">
                    Xác nhận mật khẩu
                  </Text>
                  <Input
                    variant="outline"
                    size="lg"
                    className="bg-background-50"
                  >
                    <InputField
                      placeholder="Nhập lại mật khẩu"
                      value={formData.confirmPassword}
                      onChangeText={(value) => updateFormData('confirmPassword', value)}
                      secureTextEntry
                      autoComplete="new-password"
                    />
                  </Input>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <Text size="xs" className="text-error-600">
                      Mật khẩu không khớp
                    </Text>
                  )}
                </VStack>
              </VStack>

              {/* Terms and Conditions */}
              <VStack space="sm">
                <Text size="xs" className="text-typography-500 text-center">
                  Bằng cách đăng ký, bạn đồng ý với{' '}
                  <Text size="xs" className="text-primary-600">
                    Điều khoản sử dụng
                  </Text>
                  {' '}và{' '}
                  <Text size="xs" className="text-primary-600">
                    Chính sách bảo mật
                  </Text>
                  {' '}của chúng tôi.
                </Text>
              </VStack>

              {/* Register Button */}
              <Button
                size="lg"
                action="primary"
                variant="solid"
                onPress={handleRegister}
                disabled={!isFormValid()}
                className="w-full mt-4"
              >
                <ButtonText>
                  {isLoading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
                </ButtonText>
              </Button>

              {/* Login Link */}
              <HStack className="justify-center items-center mt-6">
                <Text size="md" className="text-typography-600">
                  Đã có tài khoản?{' '}
                </Text>
                <Pressable onPress={goToLogin}>
                  <Text size="md" className="text-primary-600 font-semibold">
                    Đăng nhập ngay
                  </Text>
                </Pressable>
              </HStack>
            </VStack>
          </VStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} 