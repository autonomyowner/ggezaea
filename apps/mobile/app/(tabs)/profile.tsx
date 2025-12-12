import { View, Text, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../stores/userStore';
import { useNotifications } from '../../hooks/useNotifications';

function SettingItem({ icon, title, subtitle, onPress, rightElement }: {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}) {
  return (
    <TouchableOpacity
      style={{ flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#f5ebe0' }}
      onPress={onPress}
      disabled={!onPress && !rightElement}
    >
      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#dcedde', alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={icon as any} size={20} color="#5a9470" />
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{ fontWeight: '500', color: '#2d3a2e' }}>{title}</Text>
        {subtitle && <Text style={{ color: '#a69889', fontSize: 14 }}>{subtitle}</Text>}
      </View>
      {rightElement ? rightElement : onPress && <Ionicons name="chevron-forward" size={20} color="#d9d0c5" />}
    </TouchableOpacity>
  );
}

// Guest profile header
function GuestHeader() {
  const router = useRouter();

  return (
    <View style={{ alignItems: 'center', padding: 24, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#f5ebe0' }}>
      <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#f5ebe0', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
        <Ionicons name="person-outline" size={36} color="#a69889" />
      </View>
      <Text style={{ fontSize: 20, fontWeight: '600', color: '#2d3a2e' }}>Guest User</Text>
      <Text style={{ color: '#a69889', marginTop: 4 }}>Sign in to save your data</Text>

      <View style={{ flexDirection: 'row', gap: 12, marginTop: 16, width: '100%' }}>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: '#5a9470', borderRadius: 12, paddingVertical: 12, alignItems: 'center' }}
          onPress={() => router.push('/(auth)/signup')}
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>Sign Up</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'white', borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#5a9470' }}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={{ color: '#5a9470', fontWeight: '600' }}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Authenticated user header
function AuthHeader() {
  const { user } = useUser();

  const userEmail = user?.emailAddresses[0]?.emailAddress || 'user@example.com';
  const userName = user?.firstName || 'Matcha User';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <View style={{ alignItems: 'center', padding: 24, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#f5ebe0' }}>
      <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#dcedde', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
        <Text style={{ fontSize: 32, fontFamily: 'DMSerifDisplay_400Regular', color: '#5a9470' }}>{userInitial}</Text>
      </View>
      <Text style={{ fontSize: 20, fontWeight: '600', color: '#2d3a2e' }}>{userName}</Text>
      <Text style={{ color: '#a69889' }}>{userEmail}</Text>
      <View style={{ marginTop: 12, paddingHorizontal: 16, paddingVertical: 4, borderRadius: 12, backgroundColor: '#f5ebe0' }}>
        <Text style={{ fontWeight: '600', color: '#5a5347' }}>FREE Plan</Text>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const { signOut, isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const {
    totalMessages,
    totalSessions,
    currentStreak,
    longestStreak,
    resetUserData,
  } = useUserStore();
  const {
    settings: notificationSettings,
    permissionGranted,
    isLoading: notificationsLoading,
    isSaving: notificationsSaving,
    toggleNotifications,
    toggleStreakWarnings,
    toggleMotivational,
    sendTestNotification,
  } = useNotifications();

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'This will clear all your mood history, streaks, and preferences. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetUserData();
            Alert.alert('Done', 'Your data has been reset.');
          },
        },
      ]
    );
  };

  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : null;

  return (
    <View style={{ flex: 1, backgroundColor: '#fefdfb' }}>
      <ScrollView>
        {/* Header - different for guest vs authenticated */}
        {isSignedIn ? <AuthHeader /> : <GuestHeader />}

        {/* Upgrade prompt - only for authenticated users */}
        {isSignedIn && (
          <TouchableOpacity
            style={{ margin: 16, backgroundColor: '#5a9470', borderRadius: 16, padding: 16 }}
            onPress={() => Alert.alert('Upgrade', 'Upgrade feature coming soon!')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: 'white', fontWeight: '600', fontSize: 18 }}>Upgrade to Pro</Text>
                <Text style={{ color: '#dcedde', marginTop: 4 }}>Unlimited chats and deeper analysis</Text>
              </View>
              <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }}>
                <Text style={{ color: 'white', fontWeight: '600' }}>$5/mo</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Stats - available for everyone (local data) */}
        <View style={{ paddingHorizontal: 16, marginTop: isSignedIn ? 0 : 16, marginBottom: 8 }}>
          <Text style={{ color: '#a69889', fontWeight: '500', fontSize: 12, textTransform: 'uppercase' }}>Your Stats</Text>
        </View>
        <View style={{ flexDirection: 'row', backgroundColor: 'white', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#f5ebe0' }}>
          <View style={{ flex: 1, alignItems: 'center', paddingVertical: 16, borderRightWidth: 1, borderRightColor: '#f5ebe0' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#5a9470' }}>{totalMessages}</Text>
            <Text style={{ color: '#a69889', fontSize: 14 }}>Messages</Text>
          </View>
          <View style={{ flex: 1, alignItems: 'center', paddingVertical: 16, borderRightWidth: 1, borderRightColor: '#f5ebe0' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#5a9470' }}>{totalSessions}</Text>
            <Text style={{ color: '#a69889', fontSize: 14 }}>Sessions</Text>
          </View>
          <View style={{ flex: 1, alignItems: 'center', paddingVertical: 16 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#c97d52' }}>{currentStreak}</Text>
            <Text style={{ color: '#a69889', fontSize: 14 }}>Day Streak</Text>
          </View>
        </View>

        {longestStreak > 0 && (
          <View style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#fff8f0', borderBottomWidth: 1, borderBottomColor: '#f5ebe0' }}>
            <Text style={{ color: '#c97d52', textAlign: 'center' }}>
              Best streak: {longestStreak} days
            </Text>
          </View>
        )}

        {/* Guest benefits prompt */}
        {!isSignedIn && (
          <View style={{ margin: 16, padding: 16, backgroundColor: '#dcedde', borderRadius: 12 }}>
            <Text style={{ color: '#3d654c', fontWeight: '600', marginBottom: 8 }}>
              Create an account to unlock:
            </Text>
            <View style={{ gap: 6 }}>
              <Text style={{ color: '#3d654c' }}>- AI chat conversations</Text>
              <Text style={{ color: '#3d654c' }}>- Emotional analysis & insights</Text>
              <Text style={{ color: '#3d654c' }}>- Cloud backup of your data</Text>
              <Text style={{ color: '#3d654c' }}>- Sync across all devices</Text>
            </View>
          </View>
        )}

        <View style={{ paddingHorizontal: 16, marginTop: 24, marginBottom: 8 }}>
          <Text style={{ color: '#a69889', fontWeight: '500', fontSize: 12, textTransform: 'uppercase' }}>Notifications</Text>
        </View>
        {!permissionGranted && (
          <View style={{ backgroundColor: '#fff8f0', padding: 12, marginHorizontal: 16, borderRadius: 8, marginBottom: 8 }}>
            <Text style={{ color: '#c97d52', fontSize: 13 }}>
              Enable notifications in your device settings to receive reminders.
            </Text>
          </View>
        )}
        <SettingItem
          icon="notifications-outline"
          title="Push Notifications"
          subtitle="Daily reminders and updates"
          rightElement={
            <Switch
              value={notificationSettings?.enabled ?? false}
              onValueChange={toggleNotifications}
              trackColor={{ false: '#e5ddd5', true: '#5a9470' }}
              thumbColor="white"
              disabled={!permissionGranted || notificationsLoading || notificationsSaving}
            />
          }
        />
        <SettingItem
          icon="flame-outline"
          title="Streak Reminders"
          subtitle="Don't lose your streak"
          rightElement={
            <Switch
              value={notificationSettings?.streakWarningsEnabled ?? false}
              onValueChange={toggleStreakWarnings}
              trackColor={{ false: '#e5ddd5', true: '#5a9470' }}
              thumbColor="white"
              disabled={!permissionGranted || !notificationSettings?.enabled || notificationsLoading || notificationsSaving}
            />
          }
        />
        <SettingItem
          icon="heart-outline"
          title="Daily Motivation"
          subtitle="Uplifting messages"
          rightElement={
            <Switch
              value={notificationSettings?.motivationalEnabled ?? false}
              onValueChange={toggleMotivational}
              trackColor={{ false: '#e5ddd5', true: '#5a9470' }}
              thumbColor="white"
              disabled={!permissionGranted || !notificationSettings?.enabled || notificationsLoading || notificationsSaving}
            />
          }
        />
        <SettingItem
          icon="paper-plane-outline"
          title="Test Notification"
          subtitle="Send a test notification"
          onPress={() => {
            sendTestNotification();
            Alert.alert('Sent!', 'Check your notifications.');
          }}
        />

        {/* Account section - only for authenticated users */}
        {isSignedIn && (
          <>
            <View style={{ paddingHorizontal: 16, marginTop: 24, marginBottom: 8 }}>
              <Text style={{ color: '#a69889', fontWeight: '500', fontSize: 12, textTransform: 'uppercase' }}>Account</Text>
            </View>
            {memberSince && (
              <SettingItem icon="person-outline" title="Member Since" subtitle={memberSince} />
            )}
            <SettingItem icon="mail-outline" title="Email" subtitle={user?.emailAddresses[0]?.emailAddress} />
          </>
        )}

        <View style={{ paddingHorizontal: 16, marginTop: 24, marginBottom: 8 }}>
          <Text style={{ color: '#a69889', fontWeight: '500', fontSize: 12, textTransform: 'uppercase' }}>Support</Text>
        </View>
        <SettingItem icon="help-circle-outline" title="Help and FAQ" onPress={() => Alert.alert('Help', 'Help section coming soon!')} />
        <SettingItem icon="document-text-outline" title="Terms of Service" onPress={() => router.push('/terms')} />
        <SettingItem icon="shield-outline" title="Privacy Policy" onPress={() => router.push('/privacy')} />

        <View style={{ paddingHorizontal: 16, marginTop: 24, marginBottom: 8 }}>
          <Text style={{ color: '#a69889', fontWeight: '500', fontSize: 12, textTransform: 'uppercase' }}>Danger Zone</Text>
        </View>
        <SettingItem icon="trash-outline" title="Reset Local Data" subtitle="Clear mood history and streaks" onPress={handleResetData} />

        {/* Sign out - only for authenticated users */}
        {isSignedIn && (
          <TouchableOpacity
            style={{ margin: 16, padding: 16, backgroundColor: '#fef2f2', borderRadius: 12, alignItems: 'center' }}
            onPress={handleSignOut}
          >
            <Text style={{ color: '#dc2626', fontWeight: '600' }}>Sign Out</Text>
          </TouchableOpacity>
        )}

        <View style={{ alignItems: 'center', paddingVertical: 24 }}>
          <Text style={{ color: '#d9d0c5' }}>Matcha v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}
