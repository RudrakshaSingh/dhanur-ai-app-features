import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

import SpeedControl from '../components/SpeedControl';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../styles/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Sample video URL (replace with your own media)
const SAMPLE_VIDEO_URL = 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4';

export default function OverlayPlayerScreen() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMiniPlayer, setIsMiniPlayer] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    return () => {
      // Cleanup video on unmount
      if (videoRef.current) {
        videoRef.current.unloadAsync();
      }
    };
  }, []);

  const handlePlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setIsLoading(false);
      setIsPlaying(status.isPlaying);
      setPosition(status.positionMillis || 0);
      setDuration(status.durationMillis || 0);
    }
  };

  const togglePlayPause = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
    }
  };

  const handleSpeedChange = async (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      await videoRef.current.setRateAsync(speed, true);
    }
  };

  const handleSeek = async (value) => {
    if (videoRef.current) {
      await videoRef.current.setPositionAsync(value);
    }
  };

  const skipForward = async () => {
    if (videoRef.current) {
      const newPosition = Math.min(position + 10000, duration);
      await videoRef.current.setPositionAsync(newPosition);
    }
  };

  const skipBackward = async () => {
    if (videoRef.current) {
      const newPosition = Math.max(position - 10000, 0);
      await videoRef.current.setPositionAsync(newPosition);
    }
  };

  const toggleMiniPlayer = () => {
    setIsMiniPlayer(!isMiniPlayer);
  };

  const formatTime = (millis) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <LinearGradient colors={GRADIENTS.dark} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Overlay Player</Text>
          <Text style={styles.subtitle}>
            Media playback with speed control
          </Text>
        </View>

        {/* Video Player */}
        <View style={[styles.videoContainer, isMiniPlayer && styles.videoContainerMini]}>
          <Video
            ref={videoRef}
            source={{ uri: SAMPLE_VIDEO_URL }}
            style={styles.video}
            useNativeControls={false}
            resizeMode={ResizeMode.CONTAIN}
            isLooping
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
            rate={playbackSpeed}
          />
          
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <Ionicons name="reload" size={40} color={COLORS.primary} />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          )}

          {/* Mini Player Toggle */}
          <TouchableOpacity
            style={styles.miniToggle}
            onPress={toggleMiniPlayer}
          >
            <Ionicons
              name={isMiniPlayer ? 'expand' : 'contract'}
              size={20}
              color={COLORS.textPrimary}
            />
          </TouchableOpacity>
        </View>

        {/* Playback Controls */}
        <View style={styles.controlsContainer}>
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <Text style={styles.timeText}>{formatTime(position)}</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={duration}
              value={position}
              onSlidingComplete={handleSeek}
              minimumTrackTintColor={COLORS.primary}
              maximumTrackTintColor={COLORS.surfaceLight}
              thumbTintColor={COLORS.primary}
            />
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>

          {/* Playback Buttons */}
          <View style={styles.playbackButtons}>
            <TouchableOpacity onPress={skipBackward} style={styles.skipButton}>
              <Ionicons name="play-back" size={28} color={COLORS.textPrimary} />
              <Text style={styles.skipText}>10s</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={togglePlayPause} activeOpacity={0.8}>
              <LinearGradient
                colors={GRADIENTS.primary}
                style={styles.playButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={36}
                  color={COLORS.textPrimary}
                />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={skipForward} style={styles.skipButton}>
              <Ionicons name="play-forward" size={28} color={COLORS.textPrimary} />
              <Text style={styles.skipText}>10s</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Speed Control */}
        <SpeedControl
          currentSpeed={playbackSpeed}
          onSpeedChange={handleSpeedChange}
        />

        {/* Current Speed Display */}
        <View style={styles.speedDisplay}>
          <Ionicons name="speedometer" size={20} color={COLORS.primary} />
          <Text style={styles.speedDisplayText}>
            Current Speed: {playbackSpeed}x
          </Text>
        </View>

        {/* Additional Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="information-circle" size={20} color={COLORS.accent} />
            <Text style={styles.infoText}>
              Use the speed controls to adjust playback from 0.5x to 2x
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="resize" size={20} color={COLORS.accent} />
            <Text style={styles.infoText}>
              Tap the resize button for mini player mode
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSizes.xxl,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSizes.md,
    color: COLORS.textSecondary,
  },
  videoContainer: {
    marginHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    aspectRatio: 16 / 9,
  },
  videoContainerMini: {
    width: SCREEN_WIDTH * 0.5,
    alignSelf: 'flex-end',
    marginRight: SPACING.md,
  },
  video: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    fontSize: TYPOGRAPHY.fontSizes.sm,
  },
  miniToggle: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
  },
  controlsContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  slider: {
    flex: 1,
    marginHorizontal: SPACING.sm,
  },
  timeText: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSizes.xs,
    minWidth: 40,
    textAlign: 'center',
  },
  playbackButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xl,
  },
  skipButton: {
    alignItems: 'center',
  },
  skipText: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSizes.xs,
    marginTop: 2,
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  speedDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  speedDisplayText: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSizes.md,
    marginLeft: SPACING.sm,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  infoText: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSizes.sm,
    marginLeft: SPACING.sm,
    flex: 1,
  },
});
