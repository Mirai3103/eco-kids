import { Feather, Ionicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  StatusBar,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Tts from 'react-native-tts';
// GlueStack UI Components
import LoadingScreen from "@/components/LoadingScreen";
import { Center } from "@/components/ui/center";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { getQuizByStoryIdQueryOptions } from "@/lib/queries/quiz.query";
import theme from "@/lib/theme";
import { Answer } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useAudioPlayer } from "expo-audio";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");





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

// 3D Answer Button matching app design system
const Answer3DButton = ({
  option,
  index,
  isSelected,
  isAnswered,
  onPress,
}: {
  option: Answer;
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
      return isSelected ? theme.palette.primary[200] : "white";
    }
    if (option.is_correct) {
      return "#E8F5E8"; // Light green for correct
    }
    if (isSelected && !option.is_correct) {
      return "#FCDCE0"; // Light red for incorrect selection
    }
    return "white";
  };

  const getBorderColor = () => {
    if (!isAnswered) {
      return isSelected ? theme.palette.primary[400] : "#E5E7EB";
    }
    if (option.is_correct) {
      return theme.palette.primary[400];
    }
    if (isSelected && !option.is_correct) {
      return theme.palette.error[400];
    }
    return "#E5E7EB";
  };

  const getShadowColor = () => {
    if (!isAnswered) {
      return isSelected ? theme.palette.primary[400] : "#000";
    }
    if (option.is_correct) {
      return theme.palette.primary[400];
    }
    if (isSelected && !option.is_correct) {
      return theme.palette.error[400];
    }
    return "#000";
  };

  const getIcon = () => {
    if (!isAnswered) return null;
    if (option.is_correct) {
      return <Feather name="check-circle" size={24} color={theme.palette.primary[500]} />;
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
        marginBottom: 12,
      }}
    >
      <Pressable
        onPress={isAnswered ? undefined : onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isAnswered}
      >
        <View style={{ position: "relative" }}>
          {/* Shadow/Bottom layer - 3D effect */}
          <View
            style={{
              backgroundColor: getBorderColor(),
              borderRadius: 20,
              position: "absolute",
              top: 6,
              left: 0,
              right: 0,
              height: "100%",
            }}
          />
          {/* Top layer */}
          <View
            style={{
              backgroundColor: getBackgroundColor(),
              borderRadius: 20,
              borderWidth: 2,
              borderColor: getBorderColor(),
              padding: 20,
              minHeight: 80,
              shadowColor: getShadowColor(),
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            <HStack space="md" className="items-center">
              {/* Letter Badge */}
              <View
                style={{
                  backgroundColor: isSelected ? theme.palette.primary[400] : theme.palette.primary[100],
                  borderRadius: 20,
                  width: 40,
                  height: 40,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 2,
                  borderColor: theme.palette.primary[400],
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: "Baloo2_700Bold",
                    color: isSelected ? "white" : theme.palette.primary[600],
                  }}
                >
                  {String.fromCharCode(65 + index)}
                </Text>
              </View>

              {/* Option Image (if available) */}
              {/* {option.image_url && (
                <View
                  style={{
                    borderRadius: 12,
                    overflow: "hidden",
                    borderWidth: 2,
                    borderColor: "#E5E7EB",
                  }}
                >
                  <ExpoImage
                    source={{ uri: option.image_url }}
                    style={{
                      width: 60,
                      height: 60,
                    }}
                    alt={`Option ${index + 1}`}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                  />
                </View>
              )} */}

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
                {option.content}
              </Text>

              {/* Result Icon */}
              {getIcon()}
            </HStack>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

// Progress Bar matching app design system
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

// Fun Audio Button Component
const AudioButton = ({
  audioUrl,
  size = 60,
  content,
}: {
  audioUrl?: string;
  size?: number;
  content: string;
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  const player = useAudioPlayer({
    uri: audioUrl || "",
  });

  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotateAnim.stopAnimation();
      rotateAnim.setValue(0);
    }
  }, [isPlaying]);

  const handlePress = async () => {
    if (!audioUrl){
      Tts.speak(content);
      return;
    }
    
    try {
      if (isPlaying) {
        await player.pause();
        setIsPlaying(false);
      } else {
        await player.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.log("Audio playback error:", error);
    }
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // if (!audioUrl) return null;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={{ position: "relative" }}>
          {/* Shadow layer */}
          <View
            style={{
              backgroundColor: isPlaying ? theme.palette.primary[500] : theme.palette.secondary[500],
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
              backgroundColor: isPlaying ? theme.palette.primary[400] : theme.palette.secondary[400],
              width: size,
              height: size,
              borderRadius: size / 2,
              justifyContent: "center",
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            <Animated.View style={{ transform: [{ rotate: rotation }] }}>
              <Ionicons
                name={isPlaying ? "pause" : "volume-high"}
                size={size * 0.4}
                color="white"
              />
            </Animated.View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

// Question Card matching app design system
const QuestionCard = ({
  question,
  imageUrl,
  audioUrl,
  questionNumber,
  totalQuestions,
}: {
  question: string;
  imageUrl?: string;
  audioUrl?: string;
  questionNumber: number;
  totalQuestions: number;
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [questionNumber]);

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
      }}
    >
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
        {/* Question Header with Audio Button */}
        <HStack className="justify-between items-center mb-4">
          <Text
            style={{
              color: "#1B4B07",
              fontSize: 16,
              fontFamily: "Baloo2_700Bold",
            }}
          >
            Câu hỏi {questionNumber}/{totalQuestions}
          </Text>
          
          <AudioButton audioUrl={audioUrl} size={48} content={question} /> 
        </HStack>

        {/* Question Image (if available) */}
        {imageUrl && (
          <Center className="mb-4">
            <ExpoImage
              source={{ uri: imageUrl }}
              style={{
                width: screenWidth - 80,
                height: 180,
                borderRadius: 16,
              }}
              alt={`Question ${questionNumber}`}
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
          {question}
        </Text>
      </View>
    </Animated.View>
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
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.spring(bounceAnim, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.spring(bounceAnim, {
            toValue: 0,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
          }),
        ]),
        { iterations: 3 }
      ),
    ]).start();
  }, []);

  const percentage = (score / total) * 100;
  const getEmoji = () => {
    if (percentage >= 80) return "🎉";
    if (percentage >= 60) return "🌟";
    return "💪";
  };

  const getMessage = () => {
    if (percentage >= 80) return "Tuyệt vời!";
    if (percentage >= 60) return "Giỏi lắm!";
    return "Cố gắng thêm nhé!";
  };

  const getBackgroundColors = () => {
    if (percentage >= 80) return ["#4ECDC4", "#44A08D"];
    if (percentage >= 60) return ["#45B7D1", "#2980B9"];
    return ["#FF6B9D", "#E91E63"];
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
          {/* 3D Restart Button */}
          <Pressable onPress={onRestart}>
            <View style={{ position: "relative" }}>
              {/* Shadow layer */}
              <View
                style={{
                  backgroundColor: theme.palette.primary[500],
                  borderRadius: 16,
                  position: "absolute",
                  top: 4,
                  left: 0,
                  right: 0,
                  height: "100%",
                }}
              />
              {/* Top layer */}
              <View
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
              </View>
            </View>
          </Pressable>

          {/* 3D Back Button */}
          <Pressable onPress={onBack}>
            <View style={{ position: "relative" }}>
              {/* Shadow layer */}
              <View
                style={{
                  backgroundColor: "#4B5563",
                  borderRadius: 16,
                  position: "absolute",
                  top: 4,
                  left: 0,
                  right: 0,
                  height: "100%",
                }}
              />
              {/* Top layer */}
              <View
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
              </View>
            </View>
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
  const { data: quizData, isLoading } = useQuery(getQuizByStoryIdQueryOptions(storyId));
  const player = useAudioPlayer({
    uri: "",
  });

  const handleBack = () => {
    router.back();
  };

  const handleOptionPress = (optionIndex: number) => {
    if (isAnswered) return;

    setSelectedOption(optionIndex);
    Tts.engines().then(engines => console.log({engines}));
    Tts.voices().then(voices => console.log({voices}));
    Tts.speak(quizData![currentQuestion].answers[optionIndex].content!);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;
    
    setIsAnswered(true);
    const isCorrect = quizData![currentQuestion].answers[selectedOption].is_correct;
    
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
            <View style={{ paddingHorizontal: 24, marginBottom: 16 }}>
              <ProgressBar current={currentQuestion + 1} total={quizData.length} />
            </View>

            {/* Main Content */}
            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, padding: 16 }}>
              {/* Question Card */}
              <QuestionCard
                question={currentQuiz.content!}
                imageUrl={""}
                audioUrl={""}
                questionNumber={currentQuestion + 1}
                totalQuestions={quizData.length}
              />

              {/* Options */}
              <VStack space="sm" className="mb-6">
                {currentQuiz?.answers?.map((option, index) => (
                  <Answer3DButton
                    key={index}
                    option={option}
                    index={index}
                    isSelected={selectedOption === index}
                    isAnswered={isAnswered}
                    onPress={() => handleOptionPress(index)}
                  />
                ))}
              </VStack>

              {/* 3D Action Button */}
              <Center className="mb-8">
                <Pressable
                  onPress={!isAnswered ? handleSubmitAnswer : handleNextQuestion}
                  disabled={!isAnswered && selectedOption === null}
                >
                  <View style={{ position: "relative" }}>
                    {/* Shadow layer */}
                    <View
                      style={{
                        backgroundColor: (!isAnswered && selectedOption === null) 
                          ? "#9CA3AF" 
                          : !isAnswered 
                            ? theme.palette.primary[500] 
                            : theme.palette.primary[600],
                        borderRadius: 20,
                        position: "absolute",
                        top: 6,
                        left: 0,
                        right: 0,
                        height: "100%",
                      }}
                    />
                    {/* Top layer */}
                    <View
                      style={{
                        backgroundColor: (!isAnswered && selectedOption === null) 
                          ? "#D1D5DB" 
                          : !isAnswered 
                            ? theme.palette.primary[400] 
                            : theme.palette.primary[500],
                        borderRadius: 20,
                        paddingHorizontal: 40,
                        paddingVertical: 20,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.2,
                        shadowRadius: 8,
                        elevation: 6,
                        minWidth: 200,
                        alignItems: "center",
                      }}
                    >
                      <HStack space="sm" className="items-center justify-center">
                        <Feather 
                          name={!isAnswered ? "check" : (currentQuestion < quizData.length - 1 ? "chevron-right" : "flag")} 
                          size={20} 
                          color="white" 
                        />
                        <Text
                          style={{
                            color: "white",
                            fontSize: 18,
                            fontFamily: "Baloo2_700Bold",
                          }}
                        >
                          {!isAnswered
                            ? "Xác nhận"
                            : currentQuestion < quizData.length - 1
                              ? "Tiếp theo"
                              : "Kết quả"}
                        </Text>
                      </HStack>
                    </View>
                  </View>
                </Pressable>
              </Center>
            </ScrollView>
          </>
        )}
      </SafeAreaView>
    </View>
  );
}
