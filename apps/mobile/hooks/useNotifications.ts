import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import {
  requestNotificationPermissions,
  getNotificationSettings,
  saveNotificationSettings,
  scheduleAllNotifications,
  cancelAllNotifications,
  cancelTodayStreakWarning,
  sendImmediateNotification,
  addNotificationResponseListener,
  addNotificationReceivedListener,
  NotificationSettings,
} from '../lib/notifications';

export function useNotifications() {
  const router = useRouter();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  // Initialize notifications
  useEffect(() => {
    async function init() {
      // Request permissions
      const granted = await requestNotificationPermissions();
      setPermissionGranted(granted);

      // Always load settings, even if permissions not granted
      const currentSettings = await getNotificationSettings();
      setSettings(currentSettings);

      if (granted) {
        // Schedule notifications
        await scheduleAllNotifications();
      }

      setIsLoading(false);
    }

    init();

    // Listen for notifications received while app is open
    notificationListener.current = addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
    });

    // Listen for notification taps
    responseListener.current = addNotificationResponseListener((response) => {
      const screen = response.notification.request.content.data?.screen;
      if (screen) {
        router.push(screen as any);
      }
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  // Toggle all notifications (optimistic UI)
  const toggleNotifications = useCallback(async (enabled: boolean) => {
    if (isSaving || !settings) return;

    // Optimistic update
    setSettings({ ...settings, enabled });
    setIsSaving(true);

    try {
      // Save settings first - this should always succeed
      await saveNotificationSettings({ enabled });
    } catch (error) {
      // Only revert if save fails
      setSettings(settings);
      console.error('Failed to save notification settings:', error);
      setIsSaving(false);
      return;
    }

    // Try to schedule/cancel - don't revert if this fails
    try {
      if (!enabled) {
        await cancelAllNotifications();
      } else {
        await scheduleAllNotifications();
      }
    } catch (error) {
      console.error('Failed to schedule notifications (settings saved):', error);
    }

    setIsSaving(false);
  }, [settings, isSaving]);

  // Set daily reminder time
  const setDailyReminderTime = useCallback(async (hour: number, minute: number) => {
    if (isSaving || !settings) return;

    setSettings({ ...settings, dailyReminderTime: { hour, minute } });
    setIsSaving(true);

    try {
      await saveNotificationSettings({ dailyReminderTime: { hour, minute } });
    } catch (error) {
      setSettings(settings);
      console.error('Failed to save reminder time:', error);
      setIsSaving(false);
      return;
    }

    try {
      await scheduleAllNotifications();
    } catch (error) {
      console.error('Failed to reschedule notifications:', error);
    }

    setIsSaving(false);
  }, [settings, isSaving]);

  // Toggle streak warnings (optimistic UI)
  const toggleStreakWarnings = useCallback(async (enabled: boolean) => {
    if (isSaving || !settings) return;

    setSettings({ ...settings, streakWarningsEnabled: enabled });
    setIsSaving(true);

    try {
      await saveNotificationSettings({ streakWarningsEnabled: enabled });
    } catch (error) {
      setSettings(settings);
      console.error('Failed to save streak warnings setting:', error);
      setIsSaving(false);
      return;
    }

    try {
      await scheduleAllNotifications();
    } catch (error) {
      console.error('Failed to reschedule notifications:', error);
    }

    setIsSaving(false);
  }, [settings, isSaving]);

  // Toggle motivational notifications (optimistic UI)
  const toggleMotivational = useCallback(async (enabled: boolean) => {
    if (isSaving || !settings) return;

    setSettings({ ...settings, motivationalEnabled: enabled });
    setIsSaving(true);

    try {
      await saveNotificationSettings({ motivationalEnabled: enabled });
    } catch (error) {
      setSettings(settings);
      console.error('Failed to save motivational setting:', error);
      setIsSaving(false);
      return;
    }

    try {
      await scheduleAllNotifications();
    } catch (error) {
      console.error('Failed to reschedule notifications:', error);
    }

    setIsSaving(false);
  }, [settings, isSaving]);

  // Call when user logs mood to cancel today's streak warning
  const onMoodLogged = async () => {
    await cancelTodayStreakWarning();
  };

  // Send test notification
  const sendTestNotification = async () => {
    await sendImmediateNotification(
      'Test Notification',
      'Notifications are working! 🎉'
    );
  };

  return {
    settings,
    permissionGranted,
    isLoading,
    isSaving,
    toggleNotifications,
    setDailyReminderTime,
    toggleStreakWarnings,
    toggleMotivational,
    onMoodLogged,
    sendTestNotification,
  };
}
