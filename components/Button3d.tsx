import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

const Button3D = ({ title = "Get Started", onPress }: { title: string, onPress: () => void }) => {

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className={
        'w-[240px] h-[58px] bg-green-500 rounded-full justify-center items-center shadow-md'
      }
    >
      <View className={
        'bg-green-600 w-full h-full rounded-full justify-center items-center'
      }>
        <Text className={
          'text-white text-base font-bold tracking-wide'
        }>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default Button3D;
