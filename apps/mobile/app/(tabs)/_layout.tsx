import { useState, memo } from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { TabView, SceneMap } from 'react-native-tab-view';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// Import tab screens
import DashboardScreen from './index';
import JournalScreen from './chat';
import FocusScreen from './profile';

const initialLayout = { width: Dimensions.get('window').width };

// Define routes
const routes = [
  { key: 'index', title: 'الرئيسية', icon: 'home-outline' as const },
  { key: 'chat', title: 'اليوميات', icon: 'book-outline' as const },
  { key: 'profile', title: 'التركيز', icon: 'checkbox-outline' as const },
];

// Memoize screen components to prevent re-renders
const MemoizedDashboard = memo(DashboardScreen);
const MemoizedJournal = memo(JournalScreen);
const MemoizedFocus = memo(FocusScreen);

// Use SceneMap for proper memoization
const renderScene = SceneMap({
  index: MemoizedDashboard,
  chat: MemoizedJournal,
  profile: MemoizedFocus,
});

// Custom Bottom Tab Bar with small icons
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
              size={20}
              color={isActive ? '#5a9470' : '#c4b8ab'}
            />
            <Text
              style={[
                styles.tabLabel,
                isActive && styles.tabLabelActive,
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
        return 'WA3i';
      case 1:
        return 'اليوميات';
      case 2:
        return 'التركيز';
      default:
        return 'WA3i';
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
    paddingTop: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  tabLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 11,
    color: '#c4b8ab',
    marginTop: 4,
  },
  tabLabelActive: {
    color: '#5a9470',
  },
});
