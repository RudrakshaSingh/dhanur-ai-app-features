import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import { COLORS, BORDER_RADIUS, SPACING, TYPOGRAPHY } from '../styles/theme';

export default function CaptionDisplay({ captions, isListening }) {
  const scrollViewRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isListening) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  return (
    <Animated.View 
      style={[
        styles.container,
        isListening && { transform: [{ scale: pulseAnim }] }
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.indicator, isListening && styles.indicatorActive]} />
        <Text style={styles.headerText}>
          {isListening ? 'Listening...' : 'Captions'}
        </Text>
      </View>
      
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {captions.length === 0 ? (
          <Text style={styles.placeholder}>
            Your speech will appear here...
          </Text>
        ) : (
          captions.map((caption, index) => (
            <View key={index} style={styles.captionItem}>
              <Text style={styles.captionText}>{caption}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceLight,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.textMuted,
    marginRight: SPACING.sm,
  },
  indicatorActive: {
    backgroundColor: COLORS.success,
  },
  headerText: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSizes.sm,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  placeholder: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSizes.md,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
  captionItem: {
    marginBottom: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  captionText: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSizes.lg,
    lineHeight: 28,
  },
});
