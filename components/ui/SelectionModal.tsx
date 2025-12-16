import { Text } from "@/components/ui/text";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
    Animated,
    Dimensions,
    Modal,
    Pressable,
    StyleSheet,
    View,
} from "react-native";

const { height: screenHeight } = Dimensions.get("window");

export interface SelectionOption {
  label: string;
  value: string;
  icon?: string;
  emoji?: string;
  color?: string;
}

interface SelectionModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  options: SelectionOption[];
  onSelect: (value: any) => void;
  selectedValue: any;
}

export const SelectionModal = ({
  visible,
  onClose,
  title,
  options,
  onSelect,
  selectedValue,
}: SelectionModalProps) => {
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose}>
          <Animated.View style={[styles.backdropDim, { opacity: fadeAnim }]} />
        </Pressable>

        <Animated.View
          style={[
            styles.contentContainer,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </Pressable>
          </View>

          <View style={styles.optionsContainer}>
            {options.map((option, index) => {
              const isSelected = option.value === selectedValue;
              return (
                <Pressable
                  key={index}
                  style={[
                    styles.optionItem,
                    isSelected && styles.selectedOptionItem,
                  ]}
                  onPress={() => {
                    onSelect(option.value);
                    onClose();
                  }}
                >
                  <View style={styles.optionContent}>
                    {option.icon && (
                      <View
                        style={[
                          styles.iconContainer,
                          {
                            backgroundColor: option.color
                              ? `${option.color}15`
                              : "#F3F4F6",
                          },
                        ]}
                      >
                        <Ionicons
                          name={option.icon as any}
                          size={20}
                          color={option.color || "#4B5563"}
                        />
                      </View>
                    )}
                    {option.emoji && (
                      <Text style={styles.optionEmoji}>{option.emoji}</Text>
                    )}
                    <Text
                      style={[
                        styles.optionLabel,
                        isSelected && styles.selectedOptionLabel,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </View>

                  {isSelected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color="#22C55E"
                    />
                  )}
                </Pressable>
              );
            })}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  optionEmoji: {
    fontSize: 24,
    fontFamily: "NunitoSans_700Bold",
    color: "#374151",
    lineHeight: 24,
    marginRight: 12,
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  contentContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    maxHeight: screenHeight * 0.7,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  title: {
    fontSize: 18,
    fontFamily: "Baloo2_700Bold",
    color: "#111827",
  },
  closeButton: {
    padding: 4,
  },
  optionsContainer: {
    padding: 16,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "transparent",
  },
  selectedOptionItem: {
    backgroundColor: "#ECFDF5",
    borderColor: "#22C55E",
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  optionLabel: {
    fontSize: 16,
    fontFamily: "NunitoSans_600SemiBold",
    color: "#374151",
  },
  selectedOptionLabel: {
    color: "#15803D",
    fontFamily: "NunitoSans_700Bold",
  },
});
