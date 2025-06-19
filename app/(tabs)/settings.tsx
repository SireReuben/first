import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusHeader } from '@/components/StatusHeader';
import { SettingsSection } from '@/components/SettingsSection';
import { DeviceInfo } from '@/components/DeviceInfo';

export default function SettingsScreen() {
  return (
    <LinearGradient
      colors={['#1e3a8a', '#3b82f6']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <StatusHeader />
          
          <SettingsSection 
            title="Network Settings"
            items={[
              { label: 'WiFi Network', value: 'AEROSPIN CONTROL' },
              { label: 'Connection Type', value: 'Local Network' },
              { label: 'Auto-Connect', value: 'Enabled' },
            ]}
          />

          <DeviceInfo />

          <SettingsSection 
            title="Application"
            items={[
              { label: 'App Version', value: '1.0.0' },
              { label: 'Build', value: '2025.01.01' },
              { label: 'Last Updated', value: 'Today' },
            ]}
          />

          <SettingsSection 
            title="Support"
            items={[
              { label: 'Help & Documentation', value: 'Available' },
              { label: 'Technical Support', value: '24/7' },
              { label: 'Emergency Contact', value: 'Active' },
            ]}
          />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
});