import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { COLORS, LIGHT_THEME, DARK_THEME } from '../utils/colors';

interface ProgressBarProps {
  progress: number; // 0 to 1
  height?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  color = COLORS.primary.main,
  backgroundColor,
  showPercentage = false,
  label,
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? DARK_THEME : LIGHT_THEME;
  
  // Make sure progress is between 0 and 1
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  
  // Default background color based on theme
  const bgColor = backgroundColor || (colorScheme === 'dark' ? COLORS.grey[700] : COLORS.grey[200]);
  
  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: theme.text.secondary }]}>
          {label}
        </Text>
      )}
      
      <View style={[styles.progressBarContainer, { backgroundColor: bgColor, height }]}>
        <View
          style={[
            styles.progressBar,
            {
              backgroundColor: color,
              width: `${clampedProgress * 100}%`,
              height,
            },
          ]}
        />
      </View>
      
      {showPercentage && (
        <Text style={[styles.percentageText, { color: theme.text.secondary }]}>
          {Math.round(clampedProgress * 100)}%
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
  },
  progressBarContainer: {
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
});