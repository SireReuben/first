import { Tabs } from 'expo-router';
import { 
  Play, 
  Gauge, 
  Settings, 
  Bell,
} from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1e40af',
          borderTopColor: '#3b82f6',
          borderTopWidth: 1,
          height: 80, // Increased height
          paddingBottom: 20, // Increased bottom padding
          paddingTop: 12, // Increased top padding
          paddingHorizontal: 8, // Added horizontal padding
        },
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: '#93c5fd',
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Inter-Medium',
          marginTop: 4, // Added margin between icon and label
          marginBottom: 4, // Added bottom margin
        },
        tabBarIconStyle: {
          marginTop: 4, // Added top margin for icons
        },
      }}
    >
      <Tabs.Screen
        name="sessions"
        options={{
          title: 'Sessions',
          tabBarIcon: ({ size, color }) => (
            <Play size={22} color={color} /> // Slightly smaller icon size
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ size, color }) => (
            <Gauge size={22} color={color} /> // Slightly smaller icon size
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ size, color }) => (
            <Settings size={22} color={color} /> // Slightly smaller icon size
          ),
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ size, color }) => (
            <Bell size={22} color={color} /> // Slightly smaller icon size
          ),
        }}
      />
    </Tabs>
  );
}