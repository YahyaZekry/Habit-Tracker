import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Habit, useHabits } from '../context/HabitContext';
import { COLORS, HABIT_COLORS } from '../utils/colors';
import { useAppTheme } from '../context/ThemeContext';

interface HabitFormProps {
  initialData?: Habit;
  onClose: () => void;
}

export const HabitForm: React.FC<HabitFormProps> = ({
  initialData,
  onClose,
}) => {
  const { addHabit, updateHabit } = useHabits();
  const { currentTheme: theme, effectiveTheme } = useAppTheme();

  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(
    initialData?.description || ''
  );
  const [goalCount, setGoalCount] = useState(
    initialData?.goalCount.toString() || '1'
  );
  // const [goalPeriod, setGoalPeriod] = useState<'day' | 'week' | 'month'>(
  //   initialData?.goalPeriod || 'day'
  // ); // Removed goalPeriod state
  const [color, setColor] = useState(initialData?.color || HABIT_COLORS[0]);
  const [nameError, setNameError] = useState('');

  const validateForm = () => {
    let isValid = true;

    if (!name.trim()) {
      setNameError('Name is required');
      isValid = false;
    } else {
      setNameError('');
    }

    return isValid;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const parsedGoalCount = parseInt(goalCount, 10) || 1;

    if (initialData) {
      updateHabit({
        ...initialData,
        name: name.trim(),
        description: description.trim(),
        goalCount: parsedGoalCount,
        goalPeriod: 'day', // Hardcoded to 'day'
        color,
      });
    } else {
      addHabit({
        name: name.trim(),
        description: description.trim(),
        goalCount: parsedGoalCount,
        goalPeriod: 'day', // Hardcoded to 'day'
        color,
      });
    }

    onClose();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoidView}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={[
            styles.container,
            { backgroundColor: theme.background.paper },
          ]}
        >
          <Text style={[styles.title, { color: theme.text.primary }]}>
            {initialData ? 'Edit Habit' : 'New Habit'}
          </Text>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.text.secondary }]}>
              Name
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.text.primary,
                  backgroundColor:
                    effectiveTheme === 'dark'
                      ? COLORS.grey[800]
                      : COLORS.grey[100],
                  borderColor: nameError
                    ? COLORS.error.main
                    : effectiveTheme === 'dark'
                    ? COLORS.grey[700]
                    : COLORS.grey[300],
                },
              ]}
              value={name}
              onChangeText={setName}
              placeholder="Enter habit name"
              placeholderTextColor={theme.text.disabled}
              maxLength={50}
            />
            {nameError ? (
              <Text style={styles.errorText}>{nameError}</Text>
            ) : null}
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.text.secondary }]}>
              Description (optional)
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  color: theme.text.primary,
                  backgroundColor:
                    effectiveTheme === 'dark'
                      ? COLORS.grey[800]
                      : COLORS.grey[100],
                  borderColor:
                    effectiveTheme === 'dark'
                      ? COLORS.grey[700]
                      : COLORS.grey[300],
                },
              ]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter a description"
              placeholderTextColor={theme.text.disabled}
              multiline
              maxLength={200}
            />
          </View>

          <View style={[styles.formRow, { alignItems: 'flex-end' }]}>
            {/* Reverted to flex-end, removed comment */}
            <View style={[styles.formGroup, { flex: 0.4, marginRight: 8 }]}>
              <Text style={[styles.label, { color: theme.text.secondary }]}>
                Goal
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: theme.text.primary,
                    backgroundColor:
                      effectiveTheme === 'dark'
                        ? COLORS.grey[800]
                        : COLORS.grey[100],
                    borderColor:
                      effectiveTheme === 'dark'
                        ? COLORS.grey[700]
                        : COLORS.grey[300],
                  },
                ]}
                value={goalCount}
                onChangeText={(text) =>
                  setGoalCount(text.replace(/[^0-9]/g, ''))
                }
                keyboardType="numeric"
                maxLength={3}
              />
            </View>
            <View
              style={[
                styles.formGroup, // Removed marginBottom: 0
                { flex: 0.6 },
              ]}
            >
              <Text
                style={[
                  styles.inputSuffix,
                  {
                    color: theme.text.primary,
                    marginLeft: 0,
                    // paddingTop: 0, // Effectively removing paddingTop: 2
                  },
                ]}
              >
                Days
              </Text>
            </View>
            {/* 
              The entire Period selection UI was here. It has been removed.
              <View style={[styles.formGroup, { flex: 2 }]}>
                <Text style={[styles.label, { color: theme.text.secondary }]}>Period</Text>
                <View style={styles.segmentedContainer}>
                  ...
                </View>
              </View>
            */}
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.text.secondary }]}>
              Color
            </Text>
            <View style={styles.colorPicker}>
              {HABIT_COLORS.map((colorOption) => (
                <TouchableOpacity
                  key={colorOption}
                  style={[
                    styles.colorOption,
                    { backgroundColor: colorOption },
                    color === colorOption && styles.colorOptionSelected,
                  ]}
                  onPress={() => setColor(colorOption)}
                />
              ))}
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.submitButton,
                { backgroundColor: COLORS.primary.main },
              ]}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>
                {initialData ? 'Save Changes' : 'Create Habit'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  container: {
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 16,
    // alignItems: 'flex-end', // Can be added here or inline
  },
  inputSuffix: {
    // New style for "Days" label
    fontSize: 16,
    // marginLeft: 8, // Keep if desired, or adjust as needed
    // alignSelf: 'flex-end', // Ensures it aligns with the bottom of the row if items have different heights
    // paddingBottom: 10, // Approximate alignment with TextInput's text
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  segmentedContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
  },
  segmentedButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentedButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    margin: 6,
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    marginRight: 12,
    backgroundColor: 'transparent',
  },
  submitButton: {
    marginLeft: 12,
  },
  cancelButtonText: {
    color: COLORS.grey[500],
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: COLORS.error.main,
    fontSize: 12,
    marginTop: 4,
  },
});
