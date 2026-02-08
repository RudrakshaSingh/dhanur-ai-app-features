import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../styles/theme';

export default function MicControlScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('Checking...');
  const [audioLevel, setAudioLevel] = useState(0);
  const recordingRef = useRef(null);
  const meterInterval = useRef(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    checkPermission();
    return () => {
      releaseMicrophone();
    };
  }, []);

  useEffect(() => {
    if (isMicEnabled) {
      startMeteringAnimation();
    } else {
      stopMeteringAnimation();
    }
  }, [isMicEnabled]);

  const checkPermission = async () => {
    try {
      const { status } = await Audio.getPermissionsAsync();
      updatePermissionStatus(status);
    } catch (err) {
      console.error('Error checking permission:', err);
      setPermissionStatus('Error checking permission');
    }
  };

  const updatePermissionStatus = (status) => {
    setHasPermission(status === 'granted');
    switch (status) {
      case 'granted':
        setPermissionStatus('Microphone permission granted');
        break;
      case 'denied':
        setPermissionStatus('Microphone permission denied');
        break;
      case 'undetermined':
        setPermissionStatus('Permission not yet requested');
        break;
      default:
        setPermissionStatus('Unknown permission status');
    }
  };

  const requestPermission = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      updatePermissionStatus(status);
      
      if (status === 'denied') {
        Alert.alert(
          'Permission Denied',
          'Microphone access was denied. Please enable it in your device settings to use this feature.',
          [{ text: 'OK' }]
        );
      }
    } catch (err) {
      console.error('Error requesting permission:', err);
      Alert.alert('Error', 'Failed to request microphone permission');
    }
  };

  const toggleMicrophone = async () => {
    if (!hasPermission) {
      await requestPermission();
      return;
    }

    if (isMicEnabled) {
      await releaseMicrophone();
    } else {
      await enableMicrophone();
    }
  };

  const enableMicrophone = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setIsMicEnabled(true);
    } catch (err) {
      console.error('Error enabling microphone:', err);
      Alert.alert('Error', 'Failed to enable microphone');
    }
  };

  const releaseMicrophone = async () => {
    try {
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = null;
      }
      setIsMicEnabled(false);
      setAudioLevel(0);
    } catch (err) {
      console.error('Error releasing microphone:', err);
    }
  };

  const startMeteringAnimation = () => {
    // Simulate audio level metering
    meterInterval.current = setInterval(() => {
      const level = Math.random() * 100;
      setAudioLevel(level);
      
      Animated.spring(scaleAnim, {
        toValue: 1 + (level / 200),
        friction: 8,
        useNativeDriver: true,
      }).start();
    }, 100);
  };

  const stopMeteringAnimation = () => {
    if (meterInterval.current) {
      clearInterval(meterInterval.current);
      meterInterval.current = null;
    }
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const getPermissionIcon = () => {
    if (hasPermission === null) return 'help-circle';
    return hasPermission ? 'checkmark-circle' : 'close-circle';
  };

  const getPermissionColor = () => {
    if (hasPermission === null) return COLORS.textMuted;
    return hasPermission ? COLORS.success : COLORS.error;
  };

  return (
    <LinearGradient colors={GRADIENTS.dark} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Microphone Control</Text>
          <Text style={styles.subtitle}>
            Manage microphone permissions & input
          </Text>
        </View>

        {/* Permission Status Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="shield-checkmark" size={24} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Permission Status</Text>
          </View>
          
          <View style={styles.permissionRow}>
            <Ionicons 
              name={getPermissionIcon()} 
              size={20} 
              color={getPermissionColor()} 
            />
            <Text style={styles.permissionText}>{permissionStatus}</Text>
          </View>

          {!hasPermission && (
            <TouchableOpacity 
              style={styles.permissionButton}
              onPress={requestPermission}
            >
              <LinearGradient
                colors={GRADIENTS.primary}
                style={styles.permissionButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.permissionButtonText}>
                  Request Permission
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {/* Microphone Control */}
        <View style={styles.microphoneSection}>
          <Text style={styles.sectionTitle}>Microphone Input</Text>
          
          <View style={styles.micContainer}>
            <Animated.View 
              style={[
                styles.micBackground,
                isMicEnabled && styles.micBackgroundActive,
                { transform: [{ scale: scaleAnim }] }
              ]}
            />
            
            <TouchableOpacity
              onPress={toggleMicrophone}
              activeOpacity={0.8}
              style={styles.micButton}
            >
              <LinearGradient
                colors={isMicEnabled ? GRADIENTS.success : GRADIENTS.primary}
                style={styles.micButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons
                  name={isMicEnabled ? 'mic' : 'mic-off'}
                  size={48}
                  color={COLORS.textPrimary}
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <Text style={styles.micStatus}>
            {isMicEnabled ? 'Microphone Active' : 'Microphone Disabled'}
          </Text>

          {/* Audio Level Indicator */}
          {isMicEnabled && (
            <View style={styles.levelContainer}>
              <Text style={styles.levelLabel}>Input Level</Text>
              <View style={styles.levelBar}>
                <View 
                  style={[
                    styles.levelFill,
                    { width: `${audioLevel}%` }
                  ]} 
                />
              </View>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="flash" size={24} color={COLORS.accent} />
            <Text style={styles.cardTitle}>Quick Actions</Text>
          </View>
          
          <View style={styles.actionsRow}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={checkPermission}
            >
              <Ionicons name="refresh" size={24} color={COLORS.textPrimary} />
              <Text style={styles.actionButtonText}>Refresh Status</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, !isMicEnabled && styles.actionButtonDisabled]}
              onPress={releaseMicrophone}
              disabled={!isMicEnabled}
            >
              <Ionicons 
                name="power" 
                size={24} 
                color={isMicEnabled ? COLORS.error : COLORS.textMuted} 
              />
              <Text style={[
                styles.actionButtonText,
                !isMicEnabled && styles.actionButtonTextDisabled
              ]}>
                Release Mic
              </Text>
            </TouchableOpacity>
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
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.fontSizes.lg,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  permissionText: {
    fontSize: TYPOGRAPHY.fontSizes.md,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  permissionButton: {
    marginTop: SPACING.md,
  },
  permissionButtonGradient: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  permissionButtonText: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSizes.md,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
  },
  microphoneSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSizes.md,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.lg,
  },
  micContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  micBackground: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.surfaceLight,
  },
  micBackgroundActive: {
    backgroundColor: 'rgba(0, 230, 118, 0.2)',
  },
  micButton: {
    zIndex: 1,
  },
  micButtonGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  micStatus: {
    fontSize: TYPOGRAPHY.fontSizes.lg,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  levelContainer: {
    width: '80%',
    marginTop: SPACING.sm,
  },
  levelLabel: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  levelBar: {
    height: 8,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  levelFill: {
    height: '100%',
    backgroundColor: COLORS.success,
    borderRadius: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    padding: SPACING.md,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
  },
  actionButtonTextDisabled: {
    color: COLORS.textMuted,
  },
});
