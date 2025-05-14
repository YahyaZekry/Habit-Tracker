import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { COLORS, LIGHT_THEME, DARK_THEME } from '../utils/colors';
import { Plus } from 'lucide-react-native';

interface EmptyStateProps {
  title: string;
  message: string;
  buttonText?: string;
  onButtonPress?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  buttonText,
  onButtonPress,
  icon,
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? DARK_THEME : LIGHT_THEME;
  
  return (
    <View style={styles.container}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      
      <Text style={[styles.title, { color: theme.text.primary }]}>
        {title}
      </Text>
      
      <Text style={[styles.message, { color: theme.text.secondary }]}>
        {message}
      </Text>
      
      {buttonText && onButtonPress && (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: COLORS.primary.main }]}
          onPress={onButtonPress}
        >
          <Plus size={18} color="#FFFFFF" />
          <Text style={styles.buttonText}>{buttonText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
});