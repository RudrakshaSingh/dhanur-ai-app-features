import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS, BORDER_RADIUS, SPACING, TYPOGRAPHY } from '../styles/theme';

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export default function SpeedControl({ currentSpeed, onSpeedChange }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Playback Speed</Text>
      <View style={styles.buttonsContainer}>
        {SPEED_OPTIONS.map((speed) => {
          const isActive = currentSpeed === speed;
          return (
            <TouchableOpacity
              key={speed}
              onPress={() => onSpeedChange(speed)}
              activeOpacity={0.7}
            >
              {isActive ? (
                <LinearGradient
                  colors={GRADIENTS.primary}
                  style={styles.button}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={[styles.buttonText, styles.buttonTextActive]}>
                    {speed}x
                  </Text>
                </LinearGradient>
              ) : (
                <View style={[styles.button, styles.buttonInactive]}>
                  <Text style={styles.buttonText}>{speed}x</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    marginHorizontal: SPACING.md,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSizes.sm,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    minWidth: 50,
    alignItems: 'center',
  },
  buttonInactive: {
    backgroundColor: COLORS.surfaceLight,
  },
  buttonText: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSizes.sm,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
  },
  buttonTextActive: {
    color: COLORS.textPrimary,
  },
});
