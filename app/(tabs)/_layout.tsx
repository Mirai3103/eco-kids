import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";

import { HStack } from "@/components/ui/hstack";

// Custom Bottom Navigation Component for EcoKids
const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  const tabs = [
    {
      icon: "home",
      label: "Trang chủ",
      IconComponent: Ionicons,
      routeName: "index",
    },
    {
      icon: "library",
      label: "Thư viện",
      IconComponent: Ionicons,
      routeName: "topic",
    },
    {
      icon: "heart",
      label: "Yêu thích",
      IconComponent: Ionicons,
      routeName: "favorites",
    },
    {
      icon: "person",
      label: "Cá nhân",
      IconComponent: Ionicons,
      routeName: "profile",
    },
  ];

  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        backgroundColor: "white",
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
      }}
    >
      <HStack className="flex-1 items-center justify-around pt-3">
        {tabs.map((tab, index) => {
          const isFocused = state.index === index;
          const route = state.routes[index];

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={index}
              onPress={onPress}
              className="items-center flex-1"
              style={{ opacity: index < 2 ? 1 : 0.5 }} // Disable inactive tabs for now
            >
              <View
                className={`p-2 rounded-full ${
                  isFocused ? "bg-blue-100 " : ""
                }`}
                style={{ borderRadius: 1000 }}
              >
                <tab.IconComponent
                  name={tab.icon as any}
                  size={24}
                  color={isFocused ? "#D72654" : "#399918"}
                />
              </View>
            </Pressable>
          );
        })}
      </HStack>
    </View>
  );
};

export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
          }}
        />
        <Tabs.Screen
          name="topic"
          options={{
            title: "Topic",
          }}
        />
      </Tabs>
    </View>
  );
}
