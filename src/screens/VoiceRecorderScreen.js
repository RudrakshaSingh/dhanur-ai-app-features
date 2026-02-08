import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';

import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../styles/theme';

export default function VoiceRecorderScreen({ navigation }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasPermission, setHasPermission] = useState(null);
  const recordingRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    checkPermission();
    loadRecordings();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const checkPermission = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const loadRecordings = async () => {
    try {
      const dir = FileSystem.documentDirectory + 'recordings/';
      const dirInfo = await FileSystem.getInfoAsync(dir);
      
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
        return;
      }

      const files = await FileSystem.readDirectoryAsync(dir);
      const recordingFiles = files
        .filter(f => f.endsWith('.m4a'))
        .map((file, index) => ({
          id: index.toString(),
          name: file,
          uri: dir + file,
          date: new Date().toLocaleDateString(),
        }));
      
      setRecordings(recordingFiles);
    } catch (error) {
      console.error('Error loading recordings:', error);
    }
  };

  const startRecording = async () => {
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Please grant microphone permission to record.');
      return;
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      recordingRef.current = recording;
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    try {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      setIsRecording(false);

      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        const uri = recordingRef.current.getURI();
        
        // Save to recordings directory
        const dir = FileSystem.documentDirectory + 'recordings/';
        const fileName = `recording_${Date.now()}.m4a`;
        const newUri = dir + fileName;
        
        await FileSystem.moveAsync({
          from: uri,
          to: newUri,
        });

        recordingRef.current = null;
        
        // Reload recordings list
        loadRecordings();
        
        Alert.alert('Success', 'Recording saved!');
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to save recording');
    }
  };

  const deleteRecording = async (recording) => {
    try {
      await FileSystem.deleteAsync(recording.uri);
      loadRecordings();
    } catch (error) {
      console.error('Error deleting recording:', error);
    }
  };

  const playRecording = (recording) => {
    // Navigate to player with the recording URI
    navigation.navigate('Player', { recordingUri: recording.uri, recordingName: recording.name });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderRecordingItem = ({ item }) => (
    <View style={styles.recordingItem}>
      <TouchableOpacity 
        style={styles.recordingInfo}
        onPress={() => playRecording(item)}
      >
        <Ionicons name="musical-note" size={24} color={COLORS.primary} />
        <View style={styles.recordingDetails}>
          <Text style={styles.recordingName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.recordingDate}>{item.date}</Text>
        </View>
      </TouchableOpacity>
      
      <View style={styles.recordingActions}>
        <TouchableOpacity onPress={() => playRecording(item)} style={styles.actionBtn}>
          <Ionicons name="play" size={20} color={COLORS.success} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteRecording(item)} style={styles.actionBtn}>
          <Ionicons name="trash" size={20} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={GRADIENTS.dark} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Voice Recorder</Text>
          <Text style={styles.subtitle}>Record audio to play in the player</Text>
        </View>

        {/* Recording Section */}
        <View style={styles.recordSection}>
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>{formatTime(recordingTime)}</Text>
            {isRecording && (
              <View style={styles.recordingIndicator}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingLabel}>Recording...</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            onPress={isRecording ? stopRecording : startRecording}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isRecording ? GRADIENTS.recording : GRADIENTS.primary}
              style={styles.recordButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons
                name={isRecording ? 'stop' : 'mic'}
                size={48}
                color={COLORS.textPrimary}
              />
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.hint}>
            {isRecording ? 'Tap to stop recording' : 'Tap to start recording'}
          </Text>
        </View>

        {/* Recordings List */}
        <View style={styles.recordingsList}>
          <Text style={styles.listTitle}>Your Recordings</Text>
          
          {recordings.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="mic-off" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No recordings yet</Text>
              <Text style={styles.emptySubtext}>Record your first audio above</Text>
            </View>
          ) : (
            <FlatList
              data={recordings}
              renderItem={renderRecordingItem}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
            />
          )}
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
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSizes.md,
    color: COLORS.textSecondary,
  },
  recordSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  timerText: {
    fontSize: 48,
    fontWeight: '300',
    color: COLORS.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.error,
    marginRight: SPACING.sm,
  },
  recordingLabel: {
    color: COLORS.error,
    fontSize: TYPOGRAPHY.fontSizes.sm,
    fontWeight: '600',
  },
  recordButton: {
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
  hint: {
    marginTop: SPACING.lg,
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSizes.sm,
  },
  recordingsList: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  listTitle: {
    fontSize: TYPOGRAPHY.fontSizes.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  listContent: {
    paddingBottom: SPACING.lg,
  },
  recordingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  recordingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recordingDetails: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  recordingName: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSizes.md,
    fontWeight: '500',
  },
  recordingDate: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSizes.sm,
    marginTop: 2,
  },
  recordingActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionBtn: {
    padding: SPACING.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSizes.lg,
    marginTop: SPACING.md,
  },
  emptySubtext: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSizes.sm,
    marginTop: SPACING.xs,
  },
});
