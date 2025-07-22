import { Button } from "@/components/ui/button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import { View } from "react-native";
export default function Setting() {
  function log() {
    console.log(AsyncStorage.getAllKeys());
  }
  return (
    <View className="py-10 h-screen">
      <Button onPress={log}></Button>
    </View>
  );
}
