import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { theme } from '../theme';

interface ProgressBarProps {
  progress: number;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <View style={styles.container}>
      <MotiView
        animate={{ width: `${progress}%` }}
        transition={{ type: 'timing', duration: 100 }}
        style={[styles.fill, { backgroundColor: theme.colors.primary }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 6,
    backgroundColor: theme.colors.surface,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
}); 