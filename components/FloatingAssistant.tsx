import { useAi } from "@/hooks/useAi";
import { useSpeechRecognize } from "@/hooks/useSpeechRecognize";
import useTTS from "@/hooks/useTTS";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Image, Pressable } from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";

// Constants
const SCREEN_DIMENSIONS = Dimensions.get("window");
const SCREEN_WIDTH = SCREEN_DIMENSIONS.width;
const SCREEN_HEIGHT = SCREEN_DIMENSIONS.height;

const BUTTON_SIZES = {
  main: 60,
  secondary: 50,
} as const;

const ANIMATION_CONFIG = {
  springTension: 100,
  springFriction: 8,
  bounceDuration: 100,
  pulseDuration: 1000,
  pulseDelay: 3000,
  longPressDelay: 200,
} as const;

const POSITIONING = {
  initialX: SCREEN_WIDTH - 80,
  initialY: SCREEN_HEIGHT - 200,
  edgeMargin: 20,
  minY: 100,
  maxY: SCREEN_HEIGHT - 250,
  dragThreshold: 10,
  micOffset: -80,
  chatOffset: -140,
} as const;

const COLORS = {
  main: {
    expanded: "#FFE6F2",
    normal: "#FFFFFF",
    border: "#D72654",
    borderExpanded: "#FF69B4",
    shadow: "#D72654",
  },
  mic: {
    recording: "#FF6B35",
    normal: "#FFE066",
    shadow: "#FFB347",
    icon: "#FFB347",
    iconRecording: "#FF6B35",
  },
  chat: {
    background: "#A8E6CF",
    shadow: "#7FD3A6",
    icon: "#399918",
  },
  overlay: "rgba(215, 38, 84, 0.05)",
  white: "#FFF",
} as const;

// Types
interface Position {
  x: number;
  y: number;
}

interface AnimationRefs {
  expansion: Animated.Value;
  bounce: Animated.Value;
  pulse: Animated.Value;
  translateX: Animated.Value;
  translateY: Animated.Value;
}

interface GestureState {
  isDragging: boolean;
  dragStartTime: number;
  longPressTimer: NodeJS.Timeout | null;
  initialPosition: Position;
  currentPosition: Position;
}

// Custom hook for animations
const useFloatingAssistantAnimations = (): AnimationRefs => {
  const animations = useRef<AnimationRefs>({
    expansion: new Animated.Value(0),
    bounce: new Animated.Value(1),
    pulse: new Animated.Value(1),
    translateX: new Animated.Value(POSITIONING.initialX),
    translateY: new Animated.Value(POSITIONING.initialY),
  }).current;

  return animations;
};

// Custom hook for gesture handling
const useGestureHandling = (
  animations: AnimationRefs,
  isExpanded: boolean,
  setIsExpanded: (expanded: boolean) => void
) => {
  const gestureState = useRef<GestureState>({
    isDragging: false,
    dragStartTime: 0,
    longPressTimer: null,
    initialPosition: { x: 0, y: 0 },
    currentPosition: { x: POSITIONING.initialX, y: POSITIONING.initialY },
  });

  // Listen to animated values
  useEffect(() => {
    const xListener = animations.translateX.addListener(({ value }) => {
      gestureState.current.currentPosition.x = value;
    });
    const yListener = animations.translateY.addListener(({ value }) => {
      gestureState.current.currentPosition.y = value;
    });

    return () => {
      animations.translateX.removeListener(xListener);
      animations.translateY.removeListener(yListener);
    };
  }, [animations]);

  const closeExpandedMenu = useCallback(() => {
    if (isExpanded) {
      setIsExpanded(false);
      Animated.spring(animations.expansion, {
        toValue: 0,
        useNativeDriver: true,
        tension: ANIMATION_CONFIG.springTension,
        friction: ANIMATION_CONFIG.springFriction,
      }).start();
    }
  }, [isExpanded, setIsExpanded, animations.expansion]);

  const snapToEdge = useCallback(
    (currentX: number, currentY: number) => {
      let finalX = currentX;
      let finalY = currentY;

      // Constrain Y within screen bounds
      if (finalY < POSITIONING.minY) finalY = POSITIONING.minY;
      if (finalY > POSITIONING.maxY) finalY = POSITIONING.maxY;

      // Snap to left or right edge
      const centerX = SCREEN_WIDTH / 2;
      finalX = currentX < centerX ? POSITIONING.edgeMargin : SCREEN_WIDTH - 80;

      // Animate to final position
      Animated.parallel([
        Animated.spring(animations.translateX, {
          toValue: finalX,
          useNativeDriver: true,
          tension: ANIMATION_CONFIG.springTension,
          friction: ANIMATION_CONFIG.springFriction,
        }),
        Animated.spring(animations.translateY, {
          toValue: finalY,
          useNativeDriver: true,
          tension: ANIMATION_CONFIG.springTension,
          friction: ANIMATION_CONFIG.springFriction,
        }),
      ]).start(() => {
        setTimeout(() => {
          gestureState.current.isDragging = false;
        }, 100);
      });
    },
    [animations]
  );

  const onGestureEvent = useCallback(
    (event: any) => {
      if (gestureState.current.isDragging) {
        const { translationX, translationY } = event.nativeEvent;
        const newX = gestureState.current.initialPosition.x + translationX;
        const newY = gestureState.current.initialPosition.y + translationY;

        animations.translateX.setValue(newX);
        animations.translateY.setValue(newY);
      }
    },
    [animations]
  );

  const onHandlerStateChange = useCallback(
    (event: any) => {
      const { state, translationX, translationY } = event.nativeEvent;

      if (state === State.BEGAN) {
        gestureState.current.dragStartTime = Date.now();
        gestureState.current.isDragging = false;
        gestureState.current.initialPosition = {
          ...gestureState.current.currentPosition,
        };

        // Start long press timer
        gestureState.current.longPressTimer = setTimeout(() => {
          gestureState.current.isDragging = true;
          closeExpandedMenu();
        }, ANIMATION_CONFIG.longPressDelay);
      } else if (state === State.ACTIVE) {
        // Check for significant movement
        if (
          Math.abs(translationX) > POSITIONING.dragThreshold ||
          Math.abs(translationY) > POSITIONING.dragThreshold
        ) {
          if (gestureState.current.longPressTimer) {
            clearTimeout(gestureState.current.longPressTimer);
            gestureState.current.longPressTimer = null;
          }

          if (!gestureState.current.isDragging) {
            gestureState.current.initialPosition = {
              ...gestureState.current.currentPosition,
            };
            gestureState.current.isDragging = true;
          }
          closeExpandedMenu();
        }
      } else if (state === State.END || state === State.CANCELLED) {
        if (gestureState.current.longPressTimer) {
          clearTimeout(gestureState.current.longPressTimer);
          gestureState.current.longPressTimer = null;
        }

        if (gestureState.current.isDragging) {
          const currentX =
            gestureState.current.initialPosition.x + translationX;
          const currentY =
            gestureState.current.initialPosition.y + translationY;
          snapToEdge(currentX, currentY);
        } else {
          setTimeout(() => {
            gestureState.current.isDragging = false;
          }, 50);
        }
      }
    },
    [closeExpandedMenu, snapToEdge]
  );

  return {
    onGestureEvent,
    onHandlerStateChange,
    isDragging: () => gestureState.current.isDragging,
  };
};

// Custom hook for pulse animation
const usePulseAnimation = (pulseAnimation: Animated.Value) => {
  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.1,
          duration: ANIMATION_CONFIG.pulseDuration,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: ANIMATION_CONFIG.pulseDuration,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTimeout(pulse, ANIMATION_CONFIG.pulseDelay);
      });
    };

    const timer = setTimeout(pulse, 2000);
    return () => clearTimeout(timer);
  }, [pulseAnimation]);
};

// Custom hook for expansion toggle
const useExpansionToggle = (
  isExpanded: boolean,
  setIsExpanded: (expanded: boolean) => void,
  animations: AnimationRefs,
  isDragging: () => boolean
) => {
  const toggleExpansion = useCallback(() => {
    // Don't toggle if we were dragging
    if (isDragging()) {
      return;
    }

    const toValue = isExpanded ? 0 : 1;

    // Bounce animation for main button
    Animated.sequence([
      Animated.timing(animations.bounce, {
        toValue: 0.9,
        duration: ANIMATION_CONFIG.bounceDuration,
        useNativeDriver: true,
      }),
      Animated.timing(animations.bounce, {
        toValue: 1,
        duration: ANIMATION_CONFIG.bounceDuration,
        useNativeDriver: true,
      }),
    ]).start();

    // Expansion animation
    Animated.spring(animations.expansion, {
      toValue,
      useNativeDriver: true,
      tension: ANIMATION_CONFIG.springTension,
      friction: ANIMATION_CONFIG.springFriction,
    }).start();

    setIsExpanded(!isExpanded);
  }, [isExpanded, setIsExpanded, animations, isDragging]);

  return toggleExpansion;
};

// Action Button Component
interface ActionButtonProps {
  onPress: () => void;
  icon: string;
  backgroundColor: string;
  shadowColor: string;
  iconColor: string;
  style?: any;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  onPress,
  icon,
  backgroundColor,
  shadowColor,
  iconColor,
  style,
}) => (
  <Pressable
    onPress={onPress}
    style={[
      {
        width: BUTTON_SIZES.secondary,
        height: BUTTON_SIZES.secondary,
        borderRadius: BUTTON_SIZES.secondary / 2,
        backgroundColor,
        justifyContent: "center",
        alignItems: "center",
        shadowColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
        borderWidth: 2,
        borderColor: COLORS.white,
      },
      style,
    ]}
  >
    <Ionicons name={icon as any} size={24} color={iconColor} />
  </Pressable>
);

// Main Button Component
interface MainButtonProps {
  onPress: () => void;
  isExpanded: boolean;
  bounceAnimation: Animated.Value;
  pulseAnimation: Animated.Value;
}

const MainButton: React.FC<MainButtonProps> = ({
  onPress,
  isExpanded,
  bounceAnimation,
  pulseAnimation,
}) => (
  <Animated.View
    style={{
      transform: [{ scale: bounceAnimation }, { scale: pulseAnimation }],
    }}
  >
    <Pressable
      onPress={onPress}
      style={{
        width: BUTTON_SIZES.main,
        height: BUTTON_SIZES.main,
        borderRadius: BUTTON_SIZES.main / 2,
        backgroundColor: isExpanded ? COLORS.main.expanded : COLORS.main.normal,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: COLORS.main.shadow,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 12,
        borderWidth: 3,
        borderColor: isExpanded
          ? COLORS.main.borderExpanded
          : COLORS.main.border,
      }}
    >
      <Image
        source={require("@/assets/images/assistant_icon.png")}
        style={{
          width: 50,
          height: 50,
          resizeMode: "cover",
          borderRadius: 30,
          opacity: isExpanded ? 0.9 : 1,
        }}
      />
    </Pressable>
  </Animated.View>
);

// Mic Button Component
interface MicButtonProps {
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  style?: any;
}

const MicButton: React.FC<MicButtonProps> = ({
  isRecording,
  onStartRecording,
  onStopRecording,
  style,
}) => (
  <ActionButton
    onPress={isRecording ? onStopRecording : onStartRecording}
    icon={isRecording ? "mic-off" : "mic"}
    backgroundColor={isRecording ? COLORS.mic.recording : COLORS.mic.normal}
    shadowColor={isRecording ? COLORS.mic.recording : COLORS.mic.shadow}
    iconColor={isRecording ? COLORS.mic.iconRecording : COLORS.mic.icon}
    style={style}
  />
);

// Chat Button Component
interface ChatButtonProps {
  onPress: () => void;
  style?: any;
}

const ChatButton: React.FC<ChatButtonProps> = ({ onPress, style }) => (
  <ActionButton
    onPress={onPress}
    icon="chatbubble"
    backgroundColor={COLORS.chat.background}
    shadowColor={COLORS.chat.shadow}
    iconColor={COLORS.chat.icon}
    style={style}
  />
);

// Background Overlay Component
interface BackgroundOverlayProps {
  isVisible: boolean;
  opacity: Animated.AnimatedInterpolation<number>;
}

const BackgroundOverlay: React.FC<BackgroundOverlayProps> = ({
  isVisible,
  opacity,
}) => {
  if (!isVisible) return null;

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: -150,
        left: -20,
        right: -20,
        bottom: -20,
        backgroundColor: COLORS.overlay,
        borderRadius: 40,
        opacity,
      }}
    />
  );
};

// Main Component
const FloatingAssistant = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const { playTTSOffline } = useTTS();
  const { messages, status, error, sendMessage } = useAi({
    onLLMGenerated(message) {
      playTTSOffline(message, "vi-VN");
    },
  });
  const { isRecording, startRecognize, stopRecognize, speechResults } =
    useSpeechRecognize({
      onSpeechStart() {
        console.log("Mic recording started");
      },
      onSpeechResults(e) {
        sendMessage(e.value[e.value.length - 1]);
      },
    });
  const animations = useFloatingAssistantAnimations();
  const gestureHandlers = useGestureHandling(
    animations,
    isExpanded,
    setIsExpanded
  );
  const toggleExpansion = useExpansionToggle(
    isExpanded,
    setIsExpanded,
    animations,
    gestureHandlers.isDragging
  );

  usePulseAnimation(animations.pulse);

  // Interpolated values for button positions and animations
  const micTranslateY = animations.expansion.interpolate({
    inputRange: [0, 1],
    outputRange: [0, POSITIONING.micOffset],
  });

  const chatTranslateY = animations.expansion.interpolate({
    inputRange: [0, 1],
    outputRange: [0, POSITIONING.chatOffset],
  });

  const buttonOpacity = animations.expansion.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.5, 1],
  });

  const buttonScale = animations.expansion.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  // Action handlers
  const handleMicStart = useCallback(() => {
    console.log("Mic recording started");
    if (isRecording) return;
    if (status === "streaming" || status === "submitted") return;
    startRecognize("vi-VN");
  }, [startRecognize, isRecording, status]);

  const handleMicStop = useCallback(() => {
    console.log("Mic recording stopped");
    stopRecognize();
  }, [stopRecognize]);

  const handleChatPress = useCallback(() => {
    console.log("Chat pressed");
    setIsExpanded(false);
    // Handle chat functionality here
  }, [setIsExpanded]);

  return (
    <PanGestureHandler
      onGestureEvent={gestureHandlers.onGestureEvent}
      onHandlerStateChange={gestureHandlers.onHandlerStateChange}
      minPointers={1}
      maxPointers={1}
    >
      <Animated.View
        style={{
          position: "absolute",
          zIndex: 1000,
          transform: [
            { translateX: animations.translateX },
            { translateY: animations.translateY },
          ],
        }}
      >
        {/* Background overlay when expanded */}
        <BackgroundOverlay isVisible={isExpanded} opacity={buttonOpacity} />

        {/* Mic Button */}
        <Animated.View
          style={{
            position: "absolute",
            transform: [{ translateY: micTranslateY }, { scale: buttonScale }],
            opacity: buttonOpacity,
          }}
        >
          <MicButton
            isRecording={isRecording}
            onStartRecording={handleMicStart}
            onStopRecording={handleMicStop}
          />
        </Animated.View>

        {/* Chat Button */}
        <Animated.View
          style={{
            position: "absolute",
            transform: [{ translateY: chatTranslateY }, { scale: buttonScale }],
            opacity: buttonOpacity,
          }}
        >
          <ChatButton onPress={handleChatPress} />
        </Animated.View>

        {/* Main Assistant Button */}
        <MainButton
          onPress={toggleExpansion}
          isExpanded={isExpanded}
          bounceAnimation={animations.bounce}
          pulseAnimation={animations.pulse}
        />
      </Animated.View>
    </PanGestureHandler>
  );
};

export default FloatingAssistant;
