import "@/lib/native-wind";

import { HStack } from "@/components/ui/hstack";
import { useCircularReveal } from "@/contexts/CircularRevealContext";
import { Ionicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import { Tabs, useRouter } from "expo-router";
import { MotiView } from "moti";
import React, { useRef } from "react";
import { Pressable, View, useWindowDimensions } from "react-native";

// Floating Assistant Button Component
const FloatingAssistantButton = () => {
  const router = useRouter();
  const { triggerReveal } = useCircularReveal();
  const buttonRef = useRef<View>(null);
  const { width: screenWidth } = useWindowDimensions();

  const handlePress = () => {
    buttonRef.current?.measureInWindow((x, y, width, height) => {
      // Calculate center of the button
      const centerX = x + width / 2;
      const centerY = y + height / 2;

      // Trigger the circular reveal animation
      triggerReveal(centerX, centerY);

      // Small delay before navigation to let animation start
      requestAnimationFrame(() => {
        setTimeout(() => {
          router.push("/chat");
        }, 400);
      });
    });
  };

  return (
    <Pressable
      onPress={handlePress}
      style={{
        position: "absolute",
        top: -25,
        left: screenWidth / 2 - 35,
        width: 70,
        height: 70,
      }}
    >
      <MotiView
        ref={buttonRef}
        from={{
          scale: 0.8,
          opacity: 0,
        }}
        animate={{
          scale: 1,
          opacity: 1,
        }}
        transition={{
          type: "spring",
          damping: 12,
          delay: 200,
        }}
      >
        <MotiView
          from={{ scale: 1 }}
          animate={{ scale: 1 }}
          // @ts-ignore
          whileTap={{ scale: 0.9 }}
          transition={{
            type: "spring",
            damping: 10,
            stiffness: 200,
          }}
          style={{
            width: 70,
            height: 70,
            borderRadius: 35,
            backgroundColor: "#FFFFFF",
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 4,
            borderColor: "#399918",
          }}
        >
          <ExpoImage
            source={require("@/assets/images/assistant_icon.png")}
            style={{ width: 50, height: 50, borderRadius: 35 }}
            contentFit="contain"
          />

          {/* Pulse animation ring */}
          <MotiView
            from={{
              opacity: 0.7,
              scale: 1,
            }}
            animate={{
              opacity: 0,
              scale: 1.5,
            }}
            transition={{
              type: "timing",
              duration: 2000,
              loop: true,
            }}
            style={{
              position: "absolute",
              width: 70,
              height: 70,
              borderRadius: 35,
              borderWidth: 2,
              borderColor: "#399918",
            }}
          />
        </MotiView>
      </MotiView>
    </Pressable>
  );
};

// Custom Bottom Navigation Component for EcoKids
const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  const { width: screenWidth } = useWindowDimensions();
  
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
      routeName: "all-topics",
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
      routeName: "user",
    },
  ];

  // Calculate tab width and positions
  // We have 4 tabs split into 2 groups with a center space
  const tabWidth = screenWidth / 5; // 5 equal sections

  // Calculate indicator position based on tab index
  const getIndicatorPosition = (index: number) => {
    if (index === 0) return tabWidth * 0.5; // First tab center
    if (index === 1) return tabWidth * 1.5; // Second tab center
    if (index === 2) return tabWidth * 3.5; // Third tab center (after gap)
    if (index === 3) return tabWidth * 4.5; // Fourth tab center
    return 0;
  };

  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 90,
        backgroundColor: "white",
        borderTopLeftRadius: 55,
        borderTopRightRadius: 55,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
      }}
    >
      {/* Animated Indicator at Bottom */}
      <MotiView
        animate={{
          translateX: getIndicatorPosition(state.index) - tabWidth / 2,
        }}
        transition={{
          type: "spring",
          damping: 20,
          stiffness: 200,
        }}
        style={{
          position: "absolute",
          bottom: 0,
          width: tabWidth,
          height: 4,
          backgroundColor: "#D72654",
          borderTopLeftRadius: 4,
          borderTopRightRadius: 4,
        }}
      />

      <HStack className="flex-1 items-center justify-around pt-1">
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

          // Add spacer after second tab (library)
          const TabButton = (
            <Pressable
              key={index}
              onPress={onPress}
              className="items-center flex-1"
            >
              <MotiView
                animate={{
                  scale: isFocused ? 1 : 0.9,
                  translateY: isFocused ? -8 : 0,
                }}
                transition={{
                  type: "spring",
                  damping: 15,
                  stiffness: 200,
                }}
              >
                <MotiView
                  animate={{
                    backgroundColor: isFocused ? "#FFF5F7" : "transparent",
                  }}
                  transition={{
                    type: "timing",
                    duration: 300,
                  }}
                  style={{
                    padding: 12,
                    borderRadius: 100,
                  }}
                >
                  <MotiView
                    animate={{
                      rotate: isFocused ? "0deg" : "0deg",
                      scale: isFocused ? 1.1 : 1,
                    }}
                    transition={{
                      type: "spring",
                      damping: 12,
                      stiffness: 150,
                    }}
                  >
                    <tab.IconComponent
                      name={tab.icon as any}
                      size={32}
                      color={isFocused ? "#D72654" : "#399918"}
                    />
                  </MotiView>
                </MotiView>
              </MotiView>
            </Pressable>
          );

          // Add spacer after library tab (index 1)
          if (index === 1) {
            return (
              <React.Fragment key={index}>
                {TabButton}
                <View className="flex-1" />
              </React.Fragment>
            );
          }

          return TabButton;
        })}
      </HStack>

      {/* Floating Assistant Button */}
      <FloatingAssistantButton />
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
        <Tabs.Screen name="all-topics" options={{ headerShown: false }} />
        <Tabs.Screen name="favorites" options={{ headerShown: false }} />
        <Tabs.Screen name="user" options={{ headerShown: false }} />
      </Tabs>
    </View>
  );
}
