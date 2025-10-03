import { Ionicons } from '@expo/vector-icons';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, Image, Pressable } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const FloatingAssistant = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));
  const [bounceAnimation] = useState(new Animated.Value(1));
  const [pulseAnimation] = useState(new Animated.Value(1));
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY, (status) => {
    console.log('Recorder status changed:', status);
  });
  const recorderState = useAudioRecorderState(recorder);
  const player = useAudioPlayer(null);
  const playerStatus = useAudioPlayerStatus(player);
  useEffect(() => {
    (async () => {
      const { status } = await requestRecordingPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Không được cấp quyền microphone');
      }
      // Cấu hình audio mode cho phép ghi âm
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true
      });
    })();
  }, []);
  const startRecording = async () => {
    // prepare + bắt đầu ghi
    await recorder.prepareToRecordAsync();
    recorder.record();
  };
  const stopRecording = async () => {
    await recorder.stop();
    console.log('Recorded file uri:', recorder.uri);
    // Sau khi dừng, load uri đó cho player
    player.replace(recorder.uri);
    playRecording();
  };
  const playRecording = () => {
    // Nếu đã có uri
    if (recorder.uri) {
      // reset nếu đã phát hết
      if (playerStatus.didJustFinish) {
        player.seekTo(0);
      }
      player.play();
    }
  };
  // Position animations for drag functionality
  const translateX = useRef(new Animated.Value(screenWidth - 80)).current; // Start at right side
  const translateY = useRef(new Animated.Value(screenHeight - 200)).current; // Start near bottom
  
  // Track current position values
  const currentPosition = useRef({ x: screenWidth - 80, y: screenHeight - 200 });
  
  // Track drag state and timing
  const isDragging = useRef(false);
  const dragStartTime = useRef(0);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  // Listen to animated values
  useEffect(() => {
    const xListener = translateX.addListener(({ value }) => {
      currentPosition.current.x = value;
    });
    const yListener = translateY.addListener(({ value }) => {
      currentPosition.current.y = value;
    });

    return () => {
      translateX.removeListener(xListener);
      translateY.removeListener(yListener);
    };
  }, []);

  // Gentle pulse animation for the main button to attract attention
  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Repeat after a delay
        setTimeout(pulse, 3000);
      });
    };
    
    const timer = setTimeout(pulse, 2000);
    return () => clearTimeout(timer);
  }, []);

  const toggleExpansion = () => {
    // Don't toggle if we were dragging
    if (isDragging.current) {
      isDragging.current = false;
      return;
    }

    const toValue = isExpanded ? 0 : 1;
    
    // Bounce animation for main button
    Animated.sequence([
      Animated.timing(bounceAnimation, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Expansion animation
    Animated.spring(animation, {
      toValue,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();

    setIsExpanded(!isExpanded);
  };

  // Store the initial position when drag starts
  const initialPosition = useRef({ x: 0, y: 0 });

  // Pan gesture handler for drag functionality - we'll handle this manually
  const onGestureEvent = (event: any) => {
    if (isDragging.current) {
      const { translationX, translationY } = event.nativeEvent;
      
      // Calculate new position relative to initial position
      const newX = initialPosition.current.x + translationX;
      const newY = initialPosition.current.y + translationY;
      
      // Update position
      translateX.setValue(newX);
      translateY.setValue(newY);
    }
  };

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.BEGAN) {
      dragStartTime.current = Date.now();
      isDragging.current = false;
      
      // Store current position as initial position
      initialPosition.current = {
        x: currentPosition.current.x,
        y: currentPosition.current.y,
      };
      
      // Start long press timer (1 second)
      longPressTimer.current = setTimeout(() => {
        isDragging.current = true;
        // Close expanded menu when starting drag
        if (isExpanded) {
          setIsExpanded(false);
          Animated.spring(animation, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }).start();
        }
      }, 200);
      
    } else if (event.nativeEvent.state === State.ACTIVE) {
      // If we moved significantly, also start dragging
      const { translationX: x, translationY: y } = event.nativeEvent;
      if (Math.abs(x) > 10 || Math.abs(y) > 10) {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
        
        if (!isDragging.current) {
          // Store current position as initial position when starting drag
          initialPosition.current = {
            x: currentPosition.current.x,
            y: currentPosition.current.y,
          };
          isDragging.current = true;
        }
        
        // Close expanded menu when dragging
        if (isExpanded) {
          setIsExpanded(false);
          Animated.spring(animation, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }).start();
        }
      }
      
    } else if (event.nativeEvent.state === State.END || event.nativeEvent.state === State.CANCELLED) {
      // Clear long press timer
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
      
      if (isDragging.current) {
        const { translationX, translationY } = event.nativeEvent;
        
        // Calculate current position
        const currentX = initialPosition.current.x + translationX;
        const currentY = initialPosition.current.y + translationY;
        
        let finalX = currentX;
        let finalY = currentY;
        
        // Constrain Y within screen bounds (keep some margin)
        const minY = 100;
        const maxY = screenHeight - 250;
        if (finalY < minY) finalY = minY;
        if (finalY > maxY) finalY = maxY;
        
        // Snap to left or right edge based on current position
        const centerX = screenWidth / 2;
        
        if (currentX < centerX) {
          // Snap to left edge
          finalX = 20;
        } else {
          // Snap to right edge  
          finalX = screenWidth - 80;
        }

        // Animate to final position
        Animated.parallel([
          Animated.spring(translateX, {
            toValue: finalX,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }),
          Animated.spring(translateY, {
            toValue: finalY,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }),
        ]).start(() => {
          // Reset dragging flag after animation
          setTimeout(() => {
            isDragging.current = false;
          }, 100);
        });
      } else {
        // Short tap - reset dragging flag
        setTimeout(() => {
          isDragging.current = false;
        }, 50);
      }
    }
  };

  const micTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -80],
  });

  const chatTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -140],
  });

  const buttonOpacity = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.5, 1],
  });

  const buttonScale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
      minPointers={1}
      maxPointers={1}
    >
      <Animated.View 
        style={{
          position: 'absolute',
          zIndex: 1000,
          transform: [
            { translateX },
            { translateY }
          ],
        }}
      >
        {/* Mic Button */}
        <Animated.View
        style={{
          position: 'absolute',
          transform: [
            { translateY: micTranslateY },
            { scale: buttonScale }
          ],
          opacity: buttonOpacity,
        }}
      >
         <Pressable
           onPress={() => {
             console.log('Mic pressed');
             if (recorderState.isRecording) {
              stopRecording();
             } else {
              startRecording();
             }
           }}
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: recorderState.isRecording ? '#FF6B35' : '#FFE066',
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: recorderState.isRecording ? '#FF6B35' : '#FFB347',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 8,
            elevation: 8,
            borderWidth: 2,
            borderColor: '#FFF',
          }}
        >
            <Ionicons name={recorderState.isRecording ? 'mic-off' : 'mic'} size={24} color={recorderState.isRecording ? '#FF6B35' : '#FFB347'} />
        </Pressable>
      </Animated.View>

      {/* Chat Button */}
      <Animated.View
        style={{
          position: 'absolute',
          transform: [
            { translateY: chatTranslateY },
            { scale: buttonScale }
          ],
          opacity: buttonOpacity,
        }}
      >
         <Pressable
           onPress={() => {
             console.log('Chat pressed');
             setIsExpanded(false); // Close menu after selection
             // Handle chat functionality
           }}
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: '#A8E6CF',
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#7FD3A6',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 8,
            elevation: 8,
            borderWidth: 2,
            borderColor: '#FFF',
          }}
        >
          <Ionicons name="chatbubble" size={24} color="#399918" />
        </Pressable>
      </Animated.View>

      {/* Main Assistant Button */}
      <Animated.View
        style={{
          transform: [
            { scale: bounceAnimation },
            { scale: pulseAnimation }
          ],
        }}
      >
        <Pressable
          onPress={toggleExpansion}
           style={{
             width: 60,
             height: 60,
             borderRadius: 30,
             backgroundColor: isExpanded ? '#FFE6F2' : '#FFFFFF',
             justifyContent: 'center',
             alignItems: 'center',
             shadowColor: '#D72654',
             shadowOffset: { width: 0, height: 6 },
             shadowOpacity: 0.4,
             shadowRadius: 12,
             elevation: 12,
             borderWidth: 3,
             borderColor: isExpanded ? '#FF69B4' : '#D72654',
           }}
        >
          <Image
            source={require('@/assets/images/assistant_icon.png')}
             style={{
               width: 50,
               height: 50,
               resizeMode: 'cover',
               borderRadius: 30,
               opacity: isExpanded ? 0.9 : 1,
             }}
          />
        </Pressable>
      </Animated.View>

      {/* Background overlay when expanded */}
      {/* {isExpanded && (
        <Animated.View
          style={{
            position: 'absolute',
            top: -150,
            left: -20,
            right: -20,
            bottom: -20,
            backgroundColor: 'rgba(215, 38, 84, 0.05)',
            borderRadius: 40,
            opacity: buttonOpacity,
          }}
         />
       )} */}
      </Animated.View>
    </PanGestureHandler>
   );
 };

export default FloatingAssistant;
