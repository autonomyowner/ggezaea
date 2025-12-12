import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Notification IDs for cancellation
const NOTIFICATION_IDS = {
  DAILY_CHECKIN: 'daily-checkin',
  STREAK_WARNING: 'streak-warning',
  WEEKLY_SUMMARY: 'weekly-summary',
  MOTIVATIONAL: 'motivational',
};

// Storage keys
const STORAGE_KEYS = {
  PUSH_TOKEN: 'matcha-push-token',
  NOTIFICATIONS_ENABLED: 'matcha-notifications-enabled',
  DAILY_REMINDER_TIME: 'matcha-daily-reminder-time',
  STREAK_WARNINGS_ENABLED: 'matcha-streak-warnings',
  MOTIVATIONAL_ENABLED: 'matcha-motivational',
};

// Motivational messages
const MOTIVATIONAL_MESSAGES = [
  { title: 'You matter', body: 'Taking time for yourself is not selfish, it\'s necessary.' },
  { title: 'Small steps count', body: 'Every moment of self-reflection is progress.' },
  { title: 'Be kind to yourself', body: 'You\'re doing better than you think.' },
  { title: 'Breathe', body: 'A moment of calm can change your whole day.' },
  { title: 'You\'re not alone', body: 'Matcha is here whenever you need support.' },
  { title: 'Celebrate yourself', body: 'You showed up today. That matters.' },
  { title: 'Growth takes time', body: 'Be patient with yourself on this journey.' },
  { title: 'Your feelings are valid', body: 'It\'s okay to feel what you\'re feeling.' },
];

export interface NotificationSettings {
  enabled: boolean;
  dailyReminderTime: { hour: number; minute: number };
  streakWarningsEnabled: boolean;
  motivationalEnabled: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  dailyReminderTime: { hour: 9, minute: 0 }, // 9:00 AM
  streakWarningsEnabled: true,
  motivationalEnabled: true,
};

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    console.log('Notifications only work on physical devices');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Notification permissions not granted');
    return false;
  }

  // Set up Android channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#5a9470',
    });

    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Daily Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#5a9470',
    });

    await Notifications.setNotificationChannelAsync('streaks', {
      name: 'Streak Alerts',
      importance: Notifications.AndroidImportance.DEFAULT,
      lightColor: '#c97d52',
    });
  }

  return true;
}

/**
 * Get the Expo push token
 */
export async function getPushToken(): Promise<string | null> {
  try {
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: 'your-project-id', // Replace with your Expo project ID
    });
    await AsyncStorage.setItem(STORAGE_KEYS.PUSH_TOKEN, token.data);
    return token.data;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
}

/**
 * Get notification settings
 */
export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const enabled = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED);
    const timeStr = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_REMINDER_TIME);
    const streakWarnings = await AsyncStorage.getItem(STORAGE_KEYS.STREAK_WARNINGS_ENABLED);
    const motivational = await AsyncStorage.getItem(STORAGE_KEYS.MOTIVATIONAL_ENABLED);

    return {
      enabled: enabled !== 'false',
      dailyReminderTime: timeStr ? JSON.parse(timeStr) : DEFAULT_SETTINGS.dailyReminderTime,
      streakWarningsEnabled: streakWarnings !== 'false',
      motivationalEnabled: motivational !== 'false',
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save notification settings (atomic write, no auto-rescheduling)
 */
export async function saveNotificationSettings(settings: Partial<NotificationSettings>): Promise<void> {
  const updates: [string, string][] = [];

  if (settings.enabled !== undefined) {
    updates.push([STORAGE_KEYS.NOTIFICATIONS_ENABLED, String(settings.enabled)]);
  }
  if (settings.dailyReminderTime) {
    updates.push([STORAGE_KEYS.DAILY_REMINDER_TIME, JSON.stringify(settings.dailyReminderTime)]);
  }
  if (settings.streakWarningsEnabled !== undefined) {
    updates.push([STORAGE_KEYS.STREAK_WARNINGS_ENABLED, String(settings.streakWarningsEnabled)]);
  }
  if (settings.motivationalEnabled !== undefined) {
    updates.push([STORAGE_KEYS.MOTIVATIONAL_ENABLED, String(settings.motivationalEnabled)]);
  }

  // Atomic write - all settings saved together
  if (updates.length > 0) {
    await AsyncStorage.multiSet(updates);
  }
}

/**
 * Schedule daily check-in reminder
 */
export async function scheduleDailyCheckIn(hour: number = 9, minute: number = 0): Promise<void> {
  // Cancel existing daily check-in
  await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_IDS.DAILY_CHECKIN).catch(() => {});

  const settings = await getNotificationSettings();
  if (!settings.enabled) return;

  await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_IDS.DAILY_CHECKIN,
    content: {
      title: 'How are you feeling today?',
      body: 'Take a moment to check in with yourself.',
      data: { screen: '/(tabs)' },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: 'reminders',
    },
  });
}

/**
 * Schedule streak warning notification (sent at 8 PM if no activity)
 */
export async function scheduleStreakWarning(): Promise<void> {
  // Cancel existing streak warning
  await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_IDS.STREAK_WARNING).catch(() => {});

  const settings = await getNotificationSettings();
  if (!settings.enabled || !settings.streakWarningsEnabled) return;

  await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_IDS.STREAK_WARNING,
    content: {
      title: 'Don\'t lose your streak!',
      body: 'Log your mood before midnight to keep your streak going.',
      data: { screen: '/(tabs)' },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 20, // 8 PM
      minute: 0,
      channelId: 'streaks',
    },
  });
}

/**
 * Schedule weekly summary notification (Sundays at 10 AM)
 */
export async function scheduleWeeklySummary(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_IDS.WEEKLY_SUMMARY).catch(() => {});

  const settings = await getNotificationSettings();
  if (!settings.enabled) return;

  await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_IDS.WEEKLY_SUMMARY,
    content: {
      title: 'Your Weekly Insights',
      body: 'See how your week went and discover patterns.',
      data: { screen: '/(tabs)/profile' },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: 1, // Sunday
      hour: 10,
      minute: 0,
    },
  });
}

/**
 * Schedule random motivational notification
 */
export async function scheduleMotivationalNotification(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_IDS.MOTIVATIONAL).catch(() => {});

  const settings = await getNotificationSettings();
  if (!settings.enabled || !settings.motivationalEnabled) return;

  const message = MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];

  // Schedule for 2 PM daily
  await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_IDS.MOTIVATIONAL,
    content: {
      title: message.title,
      body: message.body,
      data: { screen: '/(tabs)' },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 14, // 2 PM
      minute: 0,
    },
  });
}

/**
 * Schedule all notifications based on settings
 */
export async function scheduleAllNotifications(): Promise<void> {
  const settings = await getNotificationSettings();

  if (!settings.enabled) {
    await cancelAllNotifications().catch(err => console.error('Failed to cancel notifications:', err));
    return;
  }

  // Schedule each notification type independently - one failure shouldn't break others
  try {
    await scheduleDailyCheckIn(settings.dailyReminderTime.hour, settings.dailyReminderTime.minute);
  } catch (error) {
    console.error('Failed to schedule daily check-in:', error);
  }

  try {
    await scheduleStreakWarning();
  } catch (error) {
    console.error('Failed to schedule streak warning:', error);
  }

  try {
    await scheduleWeeklySummary();
  } catch (error) {
    console.error('Failed to schedule weekly summary:', error);
  }

  try {
    await scheduleMotivationalNotification();
  } catch (error) {
    console.error('Failed to schedule motivational notification:', error);
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Send immediate notification (for testing)
 */
export async function sendImmediateNotification(title: string, body: string): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
    },
    trigger: null, // Immediate
  });
}

/**
 * Cancel streak warning for today (call when user logs mood)
 */
export async function cancelTodayStreakWarning(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_IDS.STREAK_WARNING).catch(() => {});

  // Reschedule for tomorrow (properly awaited)
  try {
    await scheduleStreakWarning();
  } catch (error) {
    console.error('Error rescheduling streak warning:', error);
  }
}

/**
 * Get all scheduled notifications (for debugging)
 */
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  return Notifications.getAllScheduledNotificationsAsync();
}

/**
 * Add notification response listener
 */
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Add notification received listener
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(callback);
}
