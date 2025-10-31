import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface SafeModalProps {
  visible: boolean;
  onClose: () => void;
  onVerified: () => void;
  title?: string;
  message?: string;
}

// Generate simple math problem for parent verification
const generateMathProblem = () => {
  const num1 = Math.floor(Math.random() * 10) + 5; // 5-14
  const num2 = Math.floor(Math.random() * 10) + 5; // 5-14
  const operations = ["+", "-"];
  const operation = operations[Math.floor(Math.random() * operations.length)];

  let answer: number;
  let question: string;

  if (operation === "+") {
    answer = num1 + num2;
    question = `${num1} + ${num2}`;
  } else {
    // Ensure positive result
    const larger = Math.max(num1, num2);
    const smaller = Math.min(num1, num2);
    answer = larger - smaller;
    question = `${larger} - ${smaller}`;
  }

  return { question, answer };
};

export const SafeModal: React.FC<SafeModalProps> = ({
  visible,
  onClose,
  onVerified,
  title = "Cần sự giúp đỡ của phụ huynh",
  message = "Hãy nhờ bố mẹ giúp bé giải câu đố này nhé!",
}) => {
  const [mathProblem, setMathProblem] = useState(generateMathProblem());
  const [userAnswer, setUserAnswer] = useState("");
  const [isError, setIsError] = useState(false);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (visible) {
      // Reset when modal opens
      setMathProblem(generateMathProblem());
      setUserAnswer("");
      setIsError(false);
      setAttempts(0);
    }
  }, [visible]);

  const handleSubmit = () => {
    const answer = parseInt(userAnswer);

    if (answer === mathProblem.answer) {
      // Correct answer - verified
      setIsError(false);
      onVerified();
      // Reset after short delay
      setTimeout(() => {
        setUserAnswer("");
        setAttempts(0);
      }, 500);
    } else {
      // Wrong answer
      setIsError(true);
      setAttempts((prev) => prev + 1);
      setUserAnswer("");

      // Generate new problem after 3 attempts
      if (attempts >= 2) {
        setTimeout(() => {
          setMathProblem(generateMathProblem());
          setAttempts(0);
          setIsError(false);
        }, 1500);
      }
    }
  };

  const handleClose = () => {
    setUserAnswer("");
    setIsError(false);
    setAttempts(0);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFillObject}
          onPress={handleClose}
        />

        <MotiView
          from={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{
            type: "spring",
            damping: 20,
          }}
          style={styles.modalContainer}
        >
          {/* Background gradient */}
          <LinearGradient
            colors={["#FFFFFF", "#F0F9FF"]}
            style={StyleSheet.absoluteFillObject}
          />

          {/* Close button */}
          <Pressable onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close-circle" size={32} color="#999" />
          </Pressable>

          <VStack space="xl" className="items-center p-6">
            {/* Title */}
            <VStack space="sm" className="items-center mt-8">
              <Text
                style={{
                  fontSize: 24,
                  lineHeight: 32,
                  fontWeight: "bold",
                  color: "#1B4B07",
                  textAlign: "center",
                  fontFamily: "Baloo2_700Bold",
                }}
              >
                {title}
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: "#666",
                  textAlign: "center",
                  fontFamily: "NunitoSans_600SemiBold",
                  lineHeight: 24,
                }}
              >
                {message}
              </Text>
            </VStack>

            {/* Math Problem */}
            <VStack space="lg" className="w-full items-center">
              <View style={styles.mathProblemContainer}>
                <Text style={styles.mathProblemText}>
                  {mathProblem.question} = ?
                </Text>
              </View>

              {/* Input */}
              <TextInput
                value={userAnswer}
                onChangeText={(text) => {
                  setUserAnswer(text);
                  setIsError(false);
                }}
                keyboardType="number-pad"
                placeholder="Nhập đáp án"
                placeholderTextColor="#999"
                style={[styles.input, isError && styles.inputError]}
                maxLength={3}
                onSubmitEditing={handleSubmit}
                autoFocus
              />

              {/* Error message */}
              {isError && (
                <MotiView
                  from={{ opacity: 0, translateY: -10 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ type: "timing", duration: 200 }}
                >
                  <HStack space="xs" className="items-center">
                    <Ionicons name="alert-circle" size={20} color="#EF4444" />
                    <Text
                      style={{
                        color: "#EF4444",
                        fontSize: 14,
                        fontFamily: "NunitoSans_600SemiBold",
                      }}
                    >
                      {attempts >= 2
                        ? "Thử lại với câu hỏi mới nhé!"
                        : "Chưa đúng, thử lại nhé!"}
                    </Text>
                  </HStack>
                </MotiView>
              )}

              {/* Submit button */}
              <Pressable
                onPress={handleSubmit}
                disabled={!userAnswer.trim()}
                style={({ pressed }) => [
                  styles.submitButton,
                  (!userAnswer.trim() || pressed) &&
                    styles.submitButtonDisabled,
                ]}
              >
                <View style={styles.submitButtonShadow} />
                <View style={styles.submitButtonTop}>
                  <Text style={styles.submitButtonText}>Xác nhận</Text>
                </View>
              </Pressable>
            </VStack>

            {/* Helper text */}
            <Text
              style={{
                fontSize: 12,
                color: "#999",
                textAlign: "center",
                fontFamily: "NunitoSans_400Regular",
              }}
            >
              💡 Điều này giúp bảo vệ các cài đặt quan trọng
            </Text>
          </VStack>
        </MotiView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: screenWidth - 48,
    maxWidth: 400,
    borderRadius: 30,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
  },
  iconContainer: {
    backgroundColor: "white",
    borderRadius: 60,
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  mathProblemContainer: {
    backgroundColor: "#F0F9FF",
    borderRadius: 20,
    padding: 20,
    borderWidth: 3,
    borderColor: "#399918",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mathProblemText: {
    fontSize: 36,
    lineHeight: 38,
    fontWeight: "bold",
    color: "#1B4B07",
    fontFamily: "Baloo2_700Bold",
    textAlign: "center",
  },
  input: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    fontSize: 24,
    fontWeight: "bold",
    color: "#1B4B07",
    textAlign: "center",
    borderWidth: 2,
    borderColor: "#399918",
    fontFamily: "Baloo2_700Bold",
  },
  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  submitButton: {
    width: "100%",
    position: "relative",
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonShadow: {
    backgroundColor: "#2a800d",
    borderRadius: 16,
    position: "absolute",
    top: 4,
    left: 0,
    right: 0,
    height: "100%",
  },
  submitButtonTop: {
    backgroundColor: "#399918",
    borderRadius: 16,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Baloo2_700Bold",
  },
});
