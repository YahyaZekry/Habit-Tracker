import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Share,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Settings as SettingsIcon,
  Share2,
  Download,
  Upload,
  Info,
  Moon,
  Sun,
  Trash2,
} from 'lucide-react-native';
import { useHabits } from '../../context/HabitContext';
import { useAppTheme } from '../../context/ThemeContext';
import { COLORS } from '../../utils/colors';

export default function SettingsScreen() {
  const { habits, completions, exportData, importData } = useHabits();
  const { themeMode, setThemeMode, currentTheme: theme } = useAppTheme();

  const handleExportData = async () => {
    try {
      const jsonData = await exportData();

      if (Platform.OS === 'web') {
        // For web, create a download link
        Alert.alert('Export Data', 'Feature not available on web', [
          { text: 'OK' },
        ]);
        return;
      }

      await Share.share({
        message: jsonData,
        title: 'Habit Tracker Data',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const handleImportData = () => {
    Alert.alert(
      'Import Data',
      'Feature not fully implemented in this version. This would allow you to import previously exported data.',
      [{ text: 'OK' }]
    );
  };

  const renderSettingItem = (
    icon: React.ReactNode,
    title: string,
    description: string,
    action: () => void,
    destructive = false
  ) => (
    <TouchableOpacity style={styles.settingItem} onPress={action}>
      <View style={styles.settingIcon}>{icon}</View>
      <View style={styles.settingContent}>
        <Text
          style={[
            styles.settingTitle,
            { color: destructive ? COLORS.error.main : theme.text.primary },
          ]}
        >
          {title}
        </Text>
        <Text
          style={[styles.settingDescription, { color: theme.text.secondary }]}
        >
          {description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderThemeOption = (mode: 'light' | 'dark' | 'system') => {
    const isSelected = themeMode === mode;
    const icon =
      mode === 'dark' ? (
        <Moon size={22} color={isSelected ? '#FFFFFF' : theme.text.primary} />
      ) : mode === 'light' ? (
        <Sun size={22} color={isSelected ? '#FFFFFF' : theme.text.primary} />
      ) : (
        <SettingsIcon
          size={22}
          color={isSelected ? '#FFFFFF' : theme.text.primary}
        />
      );

    return (
      <TouchableOpacity
        style={[
          styles.themeOption,
          {
            backgroundColor: isSelected
              ? COLORS.primary.main
              : theme.background.paper,
            borderColor: isSelected ? COLORS.primary.main : COLORS.grey[300],
          },
        ]}
        onPress={() => setThemeMode(mode)}
      >
        <View style={styles.themeOptionContent}>
          {icon}
          <Text
            style={[
              styles.themeOptionText,
              { color: isSelected ? '#FFFFFF' : theme.text.primary },
            ]}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background.default }]}
      edges={['right', 'left']}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text.primary }]}>
          Settings
        </Text>
      </View>

      <ScrollView style={styles.settingsList}>
        <View style={styles.settingSection}>
          <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>
            Appearance
          </Text>

          <View style={styles.themeOptions}>
            {renderThemeOption('light')}
            {renderThemeOption('dark')}
            {renderThemeOption('system')}
          </View>
        </View>

        <View style={styles.settingSection}>
          <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>
            Data Management
          </Text>

          {renderSettingItem(
            <Download size={22} color={theme.text.primary} />,
            'Export Data',
            'Export all your habits and history as a file',
            handleExportData
          )}

          {renderSettingItem(
            <Upload size={22} color={theme.text.primary} />,
            'Import Data',
            'Import previously exported habit data',
            handleImportData
          )}

          {renderSettingItem(
            <Trash2 size={22} color={COLORS.error.main} />,
            'Clear All Data',
            'Delete all habits and history (cannot be undone)',
            () => {
              Alert.alert(
                'Clear All Data',
                'Are you sure you want to delete all your habits and history? This action cannot be undone.',
                [
                  {
                    text: 'Cancel',
                    style: 'cancel',
                  },
                  {
                    text: 'Clear All',
                    style: 'destructive',
                    onPress: () => {
                      Alert.alert(
                        'Info',
                        'This would clear all your data. Since this is a demo, the action is not implemented.'
                      );
                    },
                  },
                ]
              );
            },
            true
          )}
        </View>

        <View style={styles.settingSection}>
          <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>
            About
          </Text>

          {renderSettingItem(
            <Info size={22} color={theme.text.primary} />,
            'About This App',
            'Version 1.0.0',
            () => {
              Alert.alert(
                'About',
                'Habit Tracker\nVersion 1.0.0\n\nA minimalist habit tracking app to help you build consistency and achieve your goals.',
                [{ text: 'OK' }]
              );
            }
          )}
        </View>

        <View style={styles.stats}>
          <Text style={[styles.statsText, { color: theme.text.secondary }]}>
            {habits.length} habits • {completions.length} completions
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  themeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 8,
  },
  themeOption: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  themeOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeOptionText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  settingsList: {
    flex: 1,
  },
  settingSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginHorizontal: 20,
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  settingIcon: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingDescription: {
    fontSize: 14,
    marginTop: 2,
  },
  stats: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  statsText: {
    fontSize: 14,
  },
});
