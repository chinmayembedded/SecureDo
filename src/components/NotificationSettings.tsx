import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
} from 'react-native';
import { MotiView } from 'moti';
import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../theme';

const REMINDER_SETTINGS_KEY = '@reminder_settings';

interface ReminderSettings {
  taskReminder: {
    enabled: boolean;
    time: number; // timestamp for time of day
  };
  reviewReminder: {
    enabled: boolean;
    time: number; // timestamp for time of day
  };
}

export function NotificationSettings() {
  const [settings, setSettings] = useState<ReminderSettings>({
    taskReminder: { enabled: false, time: new Date().setHours(9, 0, 0, 0) },
    reviewReminder: { enabled: false, time: new Date().setHours(21, 0, 0, 0) },
  });
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [activeReminder, setActiveReminder] = useState<'task' | 'review'>('task');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(REMINDER_SETTINGS_KEY);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading reminder settings:', error);
    }
  };

  const saveSettings = async (newSettings: ReminderSettings) => {
    try {
      // Only save to storage, don't schedule notifications here
      await AsyncStorage.setItem(REMINDER_SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving reminder settings:', error);
    }
  };

  const toggleReminder = async (type: 'task' | 'review') => {
    try {
      const newSettings = { ...settings };
      
      if (type === 'task') {
        newSettings.taskReminder.enabled = !newSettings.taskReminder.enabled;
        // Only cancel the notification when disabling
        if (!newSettings.taskReminder.enabled) {
          await Notifications.cancelScheduledNotificationAsync('task-reminder');
        }
        // Don't schedule here, only save the enabled state
      } else {
        newSettings.reviewReminder.enabled = !newSettings.reviewReminder.enabled;
        // Only cancel the notification when disabling
        if (!newSettings.reviewReminder.enabled) {
          await Notifications.cancelScheduledNotificationAsync('review-reminder');
        }
        // Don't schedule here, only save the enabled state
      }

      // Just save the settings
      await AsyncStorage.setItem(REMINDER_SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error toggling reminder:', error);
      Alert.alert('Error', 'Failed to update notification settings');
    }
  };

  const scheduleRecurringNotification = async (
    title: string,
    body: string,
    timeOfDay: number,
    identifier: string
  ) => {
    try {
      // Cancel any existing notification with this identifier
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Extract hours and minutes from the timeOfDay
      const scheduledTime = new Date(timeOfDay);
      const hours = scheduledTime.getHours();
      const minutes = scheduledTime.getMinutes();

      // Schedule the new notification with exact daily timing
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          priority: 'high',
        },
        trigger: {
          hour: hours,
          minute: minutes,
          repeats: true,
          seconds: 0, // Ensure exact timing
        },
        identifier,
      });

      console.log(`Scheduled ${identifier} for ${hours}:${minutes} daily`);
    } catch (error) {
      console.error('Error scheduling notification:', error);
      Alert.alert('Error', 'Failed to schedule notification');
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newSettings = { ...settings };
      
      if (activeReminder === 'task') {
        newSettings.taskReminder.time = selectedTime.getTime();
        // Schedule only if enabled
        if (newSettings.taskReminder.enabled) {
          scheduleRecurringNotification(
            "🌅 Plan Your Day",
            "Take a moment to set your goals and tasks for today. A well-planned day leads to better productivity!",
            newSettings.taskReminder.time,
            'task-reminder'
          );
        }
      } else {
        newSettings.reviewReminder.time = selectedTime.getTime();
        // Schedule only if enabled
        if (newSettings.reviewReminder.enabled) {
          scheduleRecurringNotification(
            "🌙 Daily Progress Review",
            "Time to review your accomplishments! Check off completed tasks and reflect on your day's progress.",
            newSettings.reviewReminder.time,
            'review-reminder'
          );
        }
      }

      // Save settings
      AsyncStorage.setItem(REMINDER_SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>NOTIFICATION SETTINGS</Text>

      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 100 }}
        style={styles.card}
      >
        <View style={styles.reminderItem}>
          <View style={styles.reminderHeader}>
            <Text style={styles.reminderTitle}>Daily Task Planning</Text>
            <Switch
              value={settings.taskReminder.enabled}
              onValueChange={() => toggleReminder('task')}
            />
          </View>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => {
              setActiveReminder('task');
              setShowTimePicker(true);
            }}
          >
            <Feather name="clock" size={20} color={theme.colors.text} />
            <Text style={styles.timeText}>
              {new Date(settings.taskReminder.time).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </TouchableOpacity>
        </View>
      </MotiView>

      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 200 }}
        style={styles.card}
      >
        <View style={styles.reminderItem}>
          <View style={styles.reminderHeader}>
            <Text style={styles.reminderTitle}>Daily Review</Text>
            <Switch
              value={settings.reviewReminder.enabled}
              onValueChange={() => toggleReminder('review')}
            />
          </View>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => {
              setActiveReminder('review');
              setShowTimePicker(true);
            }}
          >
            <Feather name="clock" size={20} color={theme.colors.text} />
            <Text style={styles.timeText}>
              {new Date(settings.reviewReminder.time).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </TouchableOpacity>
        </View>
      </MotiView>

      {showTimePicker && (
        <DateTimePicker
          value={new Date(
            activeReminder === 'task'
              ? settings.taskReminder.time
              : settings.reviewReminder.time
          )}
          mode="time"
          is24Hour={true}
          onChange={handleTimeChange}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    letterSpacing: 1,
    fontWeight: '500',
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  reminderItem: {
    gap: theme.spacing.md,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reminderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  timeText: {
    marginLeft: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
  },
}); 