import { Feather, Ionicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  StatusBar,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// GlueStack UI Components
import LoadingScreen from "@/components/LoadingScreen";
import { Center } from "@/components/ui/center";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import theme from "@/lib/theme";
import { useQuery } from "@tanstack/react-query";
import { ScrollView } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface IQuiz {
  id: string;
  question: string;
  audio_url?: string;
  image_url?: string;
  options: {
    text: string;
    audio_url?: string;
    image_url?: string;
    is_correct: boolean;
  }[];
  answer: string;
}

// Mock quiz data
async function getQuiz(storyId: string): Promise<IQuiz[]> {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return [
    {
      id: "1",
      question: "Chú ong nhỏ trong truyện làm gì để giúp bảo vệ môi trường?",
      image_url: "https://picsum.photos/400/300?random=1",
      audio_url: "https://essentials.pixfort.com/original/wp-content/uploads/sites/4/2020/02/skanews.wav",
      options: [
        {
          text: "Thu gom rác thải",
          is_correct: false,
          image_url: "https://picsum.photos/80/80?random=11",
        },
        {
          text: "Trồng nhiều hoa để ong khác có thức ăn",
          is_correct: true,
          image_url: "https://picsum.photos/80/80?random=12",
        },
        {
          text: "Dọn dẹp sông suối",
          is_correct: false,
          image_url: "https://picsum.photos/80/80?random=13",
        },
        {
          text: "Tiết kiệm nước",
          is_correct: false,
          image_url: "https://picsum.photos/80/80?random=14",
        },
      ],
      answer: "Trồng nhiều hoa để ong khác có thức ăn",
    },
    {
      id: "2",
      question: "Tại sao việc bảo vệ ong mật lại quan trọng với môi trường?",
      image_url: "https://picsum.photos/400/300?random=2",
      options: [
        {
          text: "Ong giúp thụ phấn cho cây trồng",
          is_correct: true,
          image_url: "https://picsum.photos/80/80?random=21",
        },
        {
          text: "Ong làm mật ngon",
          is_correct: false,
          image_url: "https://picsum.photos/80/80?random=22",
        },
        {
          text: "Ong bay đẹp",
          is_correct: false,
          image_url: "https://picsum.photos/80/80?random=23",
        },
        {
          text: "Ong không cắn người",
          is_correct: false,
          image_url: "https://picsum.photos/80/80?random=24",
        },
      ],
      answer: "Ong giúp thụ phấn cho cây trồng",
    },
    {
      id: "3",
      question: "Bé có thể làm gì để giúp bảo vệ môi trường như chú ong?",
      image_url: "https://picsum.photos/400/300?random=3",
      options: [
        {
          text: "Vứt rác bừa bãi",
          is_correct: false,
          image_url: "https://picsum.photos/80/80?random=31",
        },
        {
          text: "Trồng cây xanh và chăm sóc hoa",
          is_correct: true,
          image_url: "https://picsum.photos/80/80?random=32",
        },
        {
          text: "Dùng nhiều đồ nhựa",
          is_correct: false,
          image_url: "https://picsum.photos/80/80?random=33",
        },
        {
          text: "Lãng phí nước",
          is_correct: false,
          image_url: "https://picsum.photos/80/80?random=34",
        },
      ],
      answer: "Trồng cây xanh và chăm sóc hoa",
    },
  ];
}

// 3D Control Button Component
const ControlButton = ({
  icon,
  onPress,
  disabled = false,
  color = "#22C55E",
  size = 48,
  shadowColor = "#22C55E",
}: {
  icon: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
  color?: string;
  size?: number;
  shadowColor?: string;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!disabled) {
      Animated.spring(scaleAnim, {
        toValue: 0.9,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  };

  const darkerColor = disabled ? "#9CA3AF" : shadowColor;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <View style={{ position: "relative" }}>
          {/* Shadow/Bottom layer */}
          <View
            style={{
              backgroundColor: darkerColor,
              width: size,
              height: size,
              borderRadius: size / 2,
              position: "absolute",
              top: 3,
              left: 0,
            }}
          />
          {/* Top layer */}
          <View
            style={{
              backgroundColor: disabled ? "#D1D5DB" : color,
              width: size,
              height: size,
              borderRadius: size / 2,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {icon}
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
};

// Quiz Option Component
const QuizOption = ({
  option,
  index,
  isSelected,
  isAnswered,
  onPress,
}: {
  option: IQuiz["options"][0];
  index: number;
  isSelected: boolean;
  isAnswered: boolean;
  onPress: () => void;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay: index * 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    if (!isAnswered) {
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (!isAnswered) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  };

  const getBackgroundColor = () => {
    if (!isAnswered) {
      return isSelected ? "#E3F2FD" : "white";
    }
    if (option.is_correct) {
      return "#E8F5E8"; // Green for correct
    }
    if (isSelected && !option.is_correct) {
      return "#FCDCE0"; // Red for incorrect selection
    }
    return "white";
  };

  const getBorderColor = () => {
    if (!isAnswered) {
      return isSelected ? theme.palette.primary[400] : "#E5E7EB";
    }
    if (option.is_correct) {
      return theme.palette.success[400];
    }
    if (isSelected && !option.is_correct) {
      return theme.palette.error[400];
    }
    return "#E5E7EB";
  };

  const getIcon = () => {
    if (!isAnswered) return null;
    if (option.is_correct) {
      return <Feather name="check-circle" size={24} color={theme.palette.success[500]} />;
    }
    if (isSelected && !option.is_correct) {
      return <Feather name="x-circle" size={24} color={theme.palette.error[500]} />;
    }
    return null;
  };

  return (
    <Animated.View
      style={{
        opacity: opacityAnim,
        transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        marginBottom: 6,
      }}
    >
      <Pressable
        onPress={isAnswered ? undefined : onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isAnswered}
      >
        <View
          style={{
            backgroundColor: getBackgroundColor(),
            borderRadius: 16,
            borderWidth: 2,
            borderColor: getBorderColor(),
            padding: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <HStack space="md" className="items-center">
            {/* Option Image */}
            {option.image_url && (
              <ExpoImage
                source={{ uri: option.image_url }}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 12,
                }}
                alt={`Option ${index + 1}`}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
            )}

            {/* Option Text */}
            <Text
              style={{
                flex: 1,
                color: "#1B4B07",
                fontSize: 16,
                fontFamily: "NunitoSans_600SemiBold",
                lineHeight: 24,
              }}
            >
              {option.text}
            </Text>

            {/* Result Icon */}
            {getIcon()}
          </HStack>
        </View>
      </Pressable>
    </Animated.View>
  );
};

// Progress Bar Component
const ProgressBar = ({ current, total }: { current: number; total: number }) => {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (current / total) * 100,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [current, total]);

  const width = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <View
      style={{
        width: "100%",
        height: 8,
        backgroundColor: "#E5E7EB",
        borderRadius: 4,
        overflow: "hidden",
      }}
    >
      <Animated.View
        style={{
          width,
          height: "100%",
          backgroundColor: theme.palette.primary[400],
          borderRadius: 4,
        }}
      />
    </View>
  );
};

// Quiz Results Component
const QuizResults = ({
  score,
  total,
  onRestart,
  onBack,
}: {
  score: number;
  total: number;
  onRestart: () => void;
  onBack: () => void;
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, []);

  const percentage = (score / total) * 100;
  const getEmoji = () => {
    if (percentage >= 80) return "🎉";
    if (percentage >= 60) return "👍";
    return "💪";
  };

  const getMessage = () => {
    if (percentage >= 80) return "Xuất sắc!";
    if (percentage >= 60) return "Tốt lắm!";
    return "Cố gắng thêm nhé!";
  };

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
      }}
    >
      <View
        style={{
          backgroundColor: "white",
          borderRadius: 24,
          padding: 32,
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
          elevation: 10,
          width: "100%",
          maxWidth: 320,
        }}
      >
        <Text style={{ fontSize: 64, marginBottom: 16 }}>{getEmoji()}</Text>
        
        <Text
          style={{
            color: "#1B4B07",
            fontSize: 28,
            fontFamily: "Baloo2_700Bold",
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          {getMessage()}
        </Text>

        <Text
          style={{
            color: "#4A5568",
            fontSize: 18,
            fontFamily: "NunitoSans_600SemiBold",
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          Bé đã trả lời đúng {score}/{total} câu hỏi
        </Text>

        <VStack space="md" className="w-full">
          <Pressable
            onPress={onRestart}
            style={{
              backgroundColor: theme.palette.primary[400],
              borderRadius: 16,
              padding: 16,
              alignItems: "center",
              shadowColor: theme.palette.primary[400],
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: 18,
                fontFamily: "Baloo2_700Bold",
              }}
            >
              Làm lại Quiz
            </Text>
          </Pressable>

          <Pressable
            onPress={onBack}
            style={{
              backgroundColor: "#6B7280",
              borderRadius: 16,
              padding: 16,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: 16,
                fontFamily: "NunitoSans_600SemiBold",
              }}
            >
              Quay lại
            </Text>
          </Pressable>
        </VStack>
      </View>
    </Animated.View>
  );
};

export default function Quiz() {
  const params = useLocalSearchParams();
  const storyId = params.id as string;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);

  const { data: quizData, isLoading } = useQuery({
    queryKey: ["quiz", storyId],
    queryFn: () => getQuiz(storyId),
  });

  const handleBack = () => {
    router.back();
  };

  const handleOptionPress = (optionIndex: number) => {
    if (isAnswered) return;
    setSelectedOption(optionIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;
    
    setIsAnswered(true);
    const isCorrect = quizData![currentQuestion].options[selectedOption].is_correct;
    
    if (isCorrect) {
      setScore(score + 1);
    }
    
    setUserAnswers([...userAnswers, selectedOption]);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quizData!.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResults(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setShowResults(false);
    setUserAnswers([]);
  };

  if (isLoading) return <LoadingScreen isLoaded={!isLoading} message="Đang tải câu hỏi..." />;

  if (!quizData || quizData.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Không có câu hỏi nào cho truyện này</Text>
      </View>
    );
  }

  const currentQuiz = quizData[currentQuestion];

  return (
    <View style={{ flex: 1 }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Background Gradient */}
      <LinearGradient
        colors={["#EEF0FE", "#CAFEC3"]}
        style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      <SafeAreaView className="flex-1">
        {showResults ? (
          <QuizResults
            score={score}
            total={quizData.length}
            onRestart={handleRestartQuiz}
            onBack={handleBack}
          />
        ) : (
          <>
            {/* Header */}
            <HStack className="justify-between items-center px-6 py-4">
              <Pressable
                onPress={handleBack}
                style={{
                  backgroundColor: "white",
                  borderRadius: 20,
                  width: 40,
                  height: 40,
                  justifyContent: "center",
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <Ionicons name="arrow-back" size={20} color="#1B4B07" />
              </Pressable>

              <Text
                style={{
                  color: "#1B4B07",
                  fontSize: 18,
                  fontFamily: "Baloo2_700Bold",
                }}
              >
                Quiz - {currentQuestion + 1}/{quizData.length}
              </Text>

              <View style={{ width: 40 }} />
            </HStack>

            {/* Progress Bar */}
            <View style={{ paddingHorizontal: 24, marginBottom: 8 }}>
              <ProgressBar current={currentQuestion + 1} total={quizData.length} />
            </View>

            {/* Main Content */}
            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, padding: 16 }}>
              {/* Question Card */}
              <View
                style={{
                  backgroundColor: "white",
                  borderRadius: 20,
                  padding: 20,
                  marginBottom: 24,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.15,
                  shadowRadius: 16,
                  elevation: 10,
                }}
              >
                {/* Question Image */}
                {currentQuiz.image_url && (
                  <Center className="mb-8">
                    <ExpoImage
                      source={{ uri: currentQuiz.image_url }}
                      style={{
                        width: screenWidth - 80,
                        height: 180,
                        borderRadius: 16,
                      }}
                      alt={`Question ${currentQuestion + 1}`}
                      contentFit="cover"
                      cachePolicy="memory-disk"
                    />
                  </Center>
                )}

                {/* Question Text */}
                <Text
                  style={{
                    color: "#1B4B07",
                    fontSize: 20,
                    lineHeight: 28,
                    textAlign: "center",
                    fontFamily: "Baloo2_700Bold",
                  }}
                >
                  {currentQuiz.question}
                </Text>
              </View>

              {/* Options */}
              <VStack space="sm" style={{ flex: 1 }} className="mb-10">
                {currentQuiz.options.map((option, index) => (
                  <QuizOption
                    key={index}
                    option={option}
                    index={index}
                    isSelected={selectedOption === index}
                    isAnswered={isAnswered}
                    onPress={() => handleOptionPress(index)}
                  />
                ))}
              </VStack>


              {/* Bottom Controls */}
              {/* <View
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24,
                  paddingHorizontal: 24,
                  paddingVertical: 16,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: -4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 8,
                }}
              >
                <HStack className="justify-center items-center">
                  {!isAnswered ? (
                    <ControlButton
                      icon={<Feather name="check" size={24} color="white" />}
                      onPress={handleSubmitAnswer}
                      disabled={selectedOption === null}
                      color={selectedOption !== null ? theme.palette.primary[400] : "#9CA3AF"}
                      size={56}
                      shadowColor={selectedOption !== null ? theme.palette.primary[500] : "#6B7280"}
                    />
                  ) : (
                    <ControlButton
                      icon={
                        currentQuestion < quizData.length - 1 ? (
                          <Feather name="chevron-right" size={24} color="white" />
                        ) : (
                          <FontAwesome6 name="flag-checkered" size={20} color="white" />
                        )
                      }
                      onPress={handleNextQuestion}
                      color={theme.palette.primary[400]}
                      size={56}
                      shadowColor={theme.palette.primary[500]}
                    />
                  )}
                </HStack>

                <Text
                  style={{
                    textAlign: "center",
                    marginTop: 8,
                    color: "#6B7280",
                    fontSize: 14,
                    fontFamily: "NunitoSans_600SemiBold",
                  }}
                >
                  {!isAnswered
                    ? "Chọn đáp án và nhấn để xác nhận"
                    : currentQuestion < quizData.length - 1
                      ? "Nhấn để tiếp tục"
                      : "Nhấn để xem kết quả"}
                </Text>
              </View> */}
            </ScrollView>
          </>
        )}
      </SafeAreaView>
    </View>
  );
}
