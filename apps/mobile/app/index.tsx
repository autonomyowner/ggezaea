import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useUserStore } from '../stores/userStore';

export default function Index() {
  const { hasCompletedOnboarding } = useUserStore();

  // Show onboarding for new users, otherwise go straight to main app
  // No auth required - users can explore the app freely
  if (!hasCompletedOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  // Go directly to main app tabs
  return <Redirect href="/(tabs)" />;
}
