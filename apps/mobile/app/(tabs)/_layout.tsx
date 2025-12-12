import { useState, memo } from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { TabView, SceneMap } from 'react-native-tab-view';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// Import tab screens
import DashboardScreen from './index';
import ChatListScreen from './chat';
import ProfileScreen from './profile';

const initialLayout = { width: Dimensions.get('window').width };

// Define routes
const routes = [
  { key: 'index', title: 'Dashboard', icon: 'home-outline' as const },
  { key: 'chat', title: 'Chat', icon: 'chatbubbles-outline' as const },
  { key: 'profile', title: 'Profile', icon: 'person-outline' as const },
];

// Memoize screen components to prevent re-renders
const MemoizedDashboard = memo(DashboardScreen);
const MemoizedChatList = memo(ChatListScreen);
const MemoizedProfile = memo(ProfileScreen);

// Use SceneMap for proper memoization
const renderScene = SceneMap({
  index: MemoizedDashboard,
  chat: MemoizedChatList,
  profile: MemoizedProfile,
});

// Custom Bottom Tab Bar
function CustomTabBar({ navigationState, jumpTo }: { navigationState: any; jumpTo: (key: string) => void }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {navigationState.routes.map((route: any, index: number) => {
        const isActive = navigationState.index === index;
        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tabItem}
            onPress={() => jumpTo(route.key)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={route.icon}
              size={24}
              color={isActive ? '#5a9470' : '#a69889'}
            />
            <Text
              style={[
                styles.tabLabel,
                { color: isActive ? '#5a9470' : '#a69889' },
              ]}
            >
              {route.title}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// Header component
function Header({ title }: { title: string }) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
}

export default function TabsLayout() {
  const [index, setIndex] = useState(0);

  // Get the header title based on current index
  const getHeaderTitle = () => {
    switch (index) {
      case 0:
        return 'Matcha';
      case 1:
        return 'Chat';
      case 2:
        return 'Profile';
      default:
        return 'Matcha';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title={getHeaderTitle()} />
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={initialLayout}
        renderTabBar={(props) => <CustomTabBar {...props} />}
        tabBarPosition="bottom"
        swipeEnabled={true}
        animationEnabled={true}
        lazy={true}
        lazyPreloadDistance={1}
        style={styles.tabView}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fefdfb',
  },
  header: {
    backgroundColor: '#fefdfb',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(104, 166, 125, 0.15)',
  },
  headerTitle: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 20,
    color: '#2d3a2e',
    textAlign: 'center',
  },
  tabView: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fefdfb',
    borderTopWidth: 1,
    borderTopColor: 'rgba(104, 166, 125, 0.15)',
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    marginTop: 2,
  },
});
