import { Tabs } from 'expo-router';
import { Play, Gauge, Settings, Bell } from 'lucide-react-native';
import { useDeviceOrientation } from '@/hooks/useDeviceOrientation';
import { Text } from 'react-native';

export default function TabLayout() {
  const { isTablet, isLandscape } = useDeviceOrientation();

  const tabs: TabScreenConfig[] = [
    {
      name: 'sessions',
      options: {
        title: 'Sessions',
        tabBarIcon: ({ color }) => (
          <Play size={isTablet ? 26 : 22} color={color} />
        ),
        tabBarLabel: ({ color }) => (
          <Text style={{
            fontSize: isTablet ? 14 : 12,
            fontFamily: 'Inter-Medium',
            marginTop: 4,
            marginBottom: 4,
            color: color,
          }}>
            Sessions
          </Text>
        ),
      },
    },
    {
      name: 'index',
      options: {
        title: 'Dashboard',
        tabBarIcon: ({ color }) => (
          <Gauge size={isTablet ? 26 : 22} color={color} />
        ),
        tabBarLabel: ({ color }) => (
          <Text style={{
            fontSize: isTablet ? 14 : 12,
            fontFamily: 'Inter-Medium',
            marginTop: 4,
            marginBottom: 4,
            color: color,
          }}>
            Dashboard
          </Text>
        ),
      },
    },
    {
      name: 'settings',
      options: {
        title: 'Settings',
        tabBarIcon: ({ color }) => (
          <Settings size={isTablet ? 26 : 22} color={color} />
        ),
        tabBarLabel: ({ color }) => (
          <Text style={{
            fontSize: isTablet ? 14 : 12,
            fontFamily: 'Inter-Medium',
            marginTop: 4,
            marginBottom: 4,
            color: color,
          }}>
            Settings
          </Text>
        ),
      },
    },
    {
      name: 'alerts',
      options: {
        title: 'Alerts',
        tabBarIcon: ({ color }) => (
          <Bell size={isTablet ? 26 : 22} color={color} />
        ),
        tabBarLabel: ({ color }) => (
          <Text style={{
            fontSize: isTablet ? 14 : 12,
            fontFamily: 'Inter-Medium',
            marginTop: 4,
            marginBottom: 4,
            color: color,
          }}>
            Alerts
          </Text>
        ),
      },
    },
  ];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1e40af',
          borderTopColor: '#3b82f6',
          borderTopWidth: 1,
          height: isTablet ? (isLandscape ? 70 : 90) : 80,
          paddingBottom: isTablet ? (isLandscape ? 12 : 24) : 20,
          paddingTop: isTablet ? (isLandscape ? 8 : 16) : 12,
          paddingHorizontal: isTablet ? (isLandscape ? 24 : 16) : 8,
        },
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: '#93c5fd',
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={tab.options}
        />
      ))}
    </Tabs>
  );
}

interface TabScreenConfig {
  name: string;
  options: {
    title: string;
    tabBarIcon: (props: { color: string }) => React.ReactNode;
    tabBarLabel: (props: { color: string }) => React.ReactNode;
  };
}