// components/AnimatedHeader.tsx
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { useUserStore } from "@/stores/user.store";
import React from "react";
import { Image } from "./ui/image";

export const Header = () => {
  const { user } = useUserStore();
  return (
   
        <HStack className="justify-between items-center px-4 py-0">
          <Image
            source={require("@/assets/images/logo.png")}
            alt="logo"
            className="w-32 h-auto "
            resizeMode="contain"
            
          />

          <HStack className="items-center space-x-3">
            <HStack className="items-center bg-white rounded-full px-3 py-2 shadow-sm">
             
              <Text
                style={{
                  color: "#1B4B07",
                  fontWeight: "600",
                  marginLeft: 4,
                }}
              >
             ⭐  {user?.points}
              </Text>
            </HStack>
          </HStack>
        </HStack>
  );
};
