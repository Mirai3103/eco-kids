import { Box } from '@/components/ui/box';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import PageFlipper from '@laffy1309/react-native-page-flipper';
import { Image } from 'expo-image';
import React, { useRef, useState } from 'react';
import { Alert, Dimensions, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Sample data for the page flipper
const sampleImages = [
  'https://picsum.photos/400/600?random=1',
  'https://picsum.photos/400/600?random=2',
  'https://picsum.photos/400/600?random=3',
  'https://picsum.photos/400/600?random=4',
  'https://picsum.photos/400/600?random=5',
  'https://picsum.photos/400/600?random=6',
  'https://picsum.photos/400/600?random=7',
  'https://picsum.photos/400/600?random=8',
];

const sampleTextPages = [
  { title: 'Page 1', content: 'This is the first page of our demo. The page flipper creates a realistic book-like experience.' },
  { title: 'Page 2', content: 'You can swipe or tap to flip pages. The animation is smooth and natural.' },
  { title: 'Page 3', content: 'This component works great for digital books, magazines, or any paginated content.' },
  { title: 'Page 4', content: 'It supports both portrait and landscape orientations.' },
  { title: 'Page 5', content: 'You can customize the page size and styling to fit your needs.' },
];

export default function Demo() {
  const [portrait, setPortrait] = useState(true);
  const [singleImageMode, setSingleImageMode] = useState(true);
  const [enabled, setEnabled] = useState(true);
  const [pressable, setPressable] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [demoType, setDemoType] = useState<'images' | 'text'>('images');
  
  const pageFlipperRef = useRef<any>(null);

  const renderImagePage = (imageUrl: string) => (
    <View style={styles.pageContainer}>
      <Image 
        source={{ uri: imageUrl }} 
        style={styles.pageImage}
        contentFit="cover"
      />
    </View>
  );

  const renderTextPage = (pageData: { title: string; content: string }) => (
    <View style={styles.textPageContainer}>
      <Heading size="xl" style={styles.pageTitle}>{pageData.title}</Heading>
      <Text size="md" style={styles.pageContent}>{pageData.content}</Text>
    </View>
  );

  const goToPage = (pageIndex: number) => {
    if (pageFlipperRef.current) {
      pageFlipperRef.current.goToPage(pageIndex);
    }
  };

  const nextPage = () => {
    if (pageFlipperRef.current) {
      pageFlipperRef.current.nextPage();
    }
  };

  const previousPage = () => {
    if (pageFlipperRef.current) {
      pageFlipperRef.current.previousPage();
    }
  };

  const handleFlippedEnd = (pageIndex: number) => {
    setCurrentPage(pageIndex);
  };

  const handleEndReached = () => {
    Alert.alert('End Reached', 'You have reached the last page!');
  };

  const currentData = demoType === 'images' ? sampleImages : sampleTextPages;
  const pageSize = portrait 
    ? { width: 300, height: 400 }
    : { width: 400, height: 300 };

  return (
    <SafeAreaView style={styles.container}>
      <VStack space="md" style={styles.content}>
        <Heading size="2xl" style={styles.title}>
          Page Flipper Demo
        </Heading>
        
        {/* Controls */}
        <Box style={styles.controlsContainer}>
          <VStack space="sm">
            <HStack space="md" style={styles.switchRow}>
              <Text size="sm">Portrait Mode:</Text>
              <Switch
                value={portrait}
                onValueChange={setPortrait}
              />
            </HStack>
            
            <HStack space="md" style={styles.switchRow}>
              <Text size="sm">Single Image Mode:</Text>
              <Switch
                value={singleImageMode}
                onValueChange={setSingleImageMode}
              />
            </HStack>
            
            <HStack space="md" style={styles.switchRow}>
              <Text size="sm">Gestures Enabled:</Text>
              <Switch
                value={enabled}
                onValueChange={setEnabled}
              />
            </HStack>
            
            <HStack space="md" style={styles.switchRow}>
              <Text size="sm">Tap to Flip:</Text>
              <Switch
                value={pressable}
                onValueChange={setPressable}
              />
            </HStack>
            
            <HStack space="md" style={styles.switchRow}>
              <Button
                size="sm"
                variant={demoType === 'images' ? 'solid' : 'outline'}
                onPress={() => setDemoType('images')}
              >
                <Text>Images</Text>
              </Button>
              <Button
                size="sm"
                variant={demoType === 'text' ? 'solid' : 'outline'}
                onPress={() => setDemoType('text')}
              >
                <Text>Text</Text>
              </Button>
            </HStack>
          </VStack>
        </Box>

        {/* Page Flipper */}
        <Box style={styles.flipperContainer}>
          {demoType === 'images' ? (
            <PageFlipper
              ref={pageFlipperRef}
              data={sampleImages}
              pageSize={pageSize}
              portrait={portrait}
              singleImageMode={singleImageMode}
              enabled={enabled}
              pressable={pressable}
              renderPage={(data: string) => renderImagePage(data)}
              contentContainerStyle={styles.contentContainer}
              onFlippedEnd={handleFlippedEnd}
            />
          ) : (
            <PageFlipper
              ref={pageFlipperRef}
              data={sampleTextPages.map(page => JSON.stringify(page))}
              pageSize={pageSize}
              portrait={portrait}
              singleImageMode={singleImageMode}
              enabled={enabled}
              pressable={pressable}
              renderPage={(data: string) => {
                const pageData = JSON.parse(data);
                return renderTextPage(pageData);
              }}
              contentContainerStyle={styles.contentContainer}
              onFlippedEnd={handleFlippedEnd}
            />
          )}
        </Box>

        {/* Navigation Controls */}
        <Box style={styles.navigationContainer}>
          <HStack space="md" style={styles.navigationRow}>
            <Button
              size="sm"
              onPress={previousPage}
              variant="outline"
            >
              <Text>Previous</Text>
            </Button>
            
            <Text size="sm" style={styles.pageIndicator}>
              {currentPage + 1} / {currentData.length}
            </Text>
            
            <Button
              size="sm"
              onPress={nextPage}
              variant="outline"
            >
              <Text>Next</Text>
            </Button>
          </HStack>
          
          <HStack space="xs" style={styles.pageButtons}>
            {currentData.map((_, index) => (
              <Button
                key={index}
                size="xs"
                variant={index === currentPage ? 'solid' : 'outline'}
                onPress={() => goToPage(index)}
                style={styles.pageButton}
              >
                <Text size="xs">{index + 1}</Text>
              </Button>
            ))}
          </HStack>
        </Box>

        {/* Instructions */}
        <Box style={styles.instructionsContainer}>
          <Text size="sm" style={styles.instructions}>
            • Swipe or tap to flip pages{'\n'}
            • Use controls above to customize behavior{'\n'}
            • Toggle between image and text demos{'\n'}
            • Try different orientations and modes
          </Text>
        </Box>
      </VStack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  controlsContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  switchRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: 200,
  },
  flipperContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    marginBottom: 16,
  },
  contentContainer: {
    flex: 1,
  },
  pageContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  pageImage: {
    width: '100%',
    height: '100%',
  },
  textPageContainer: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageTitle: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  pageContent: {
    textAlign: 'center',
    lineHeight: 24,
    color: '#666',
  },
  navigationContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 16,
  },
  navigationRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  pageIndicator: {
    fontWeight: 'bold',
    color: '#333',
  },
  pageButtons: {
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  pageButton: {
    minWidth: 32,
    marginHorizontal: 2,
  },
  instructionsContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  instructions: {
    color: '#666',
    lineHeight: 20,
  },
});
