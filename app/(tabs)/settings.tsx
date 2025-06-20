import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusHeader } from '@/components/StatusHeader';
import { SettingsSection } from '@/components/SettingsSection';
import { DeviceInfo } from '@/components/DeviceInfo';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';
import { useDeviceOrientation } from '@/hooks/useDeviceOrientation';

interface SettingItem {
  label: string;
  value: string;
}

export default function SettingsScreen() {
  const { isTablet, isLandscape, screenType } = useDeviceOrientation();
  const [refreshing, setRefreshing] = React.useState(false);

  const isLandscapeTablet = useMemo(
    () => isTablet && isLandscape && screenType !== 'phone',
    [isTablet, isLandscape, screenType]
  );

  const networkSettings = useMemo<SettingItem[]>(() => [
    { label: 'WiFi Network', value: 'AEROSPIN CONTROL' },
    { label: 'Connection Type', value: 'Local Network' },
    { label: 'Auto-Connect', value: 'Enabled' },
  ], []);

  const appSettings = useMemo<SettingItem[]>(() => [
    { label: 'App Version', value: '1.0.0' },
    { label: 'Build', value: '2025.01.01' },
    { label: 'Last Updated', value: 'Today' },
  ], []);

  const supportSettings = useMemo<SettingItem[]>(() => [
    { label: 'Help & Documentation', value: 'Available' },
    { label: 'Technical Support', value: '24/7' },
    { label: 'Emergency Contact', value: 'Active' },
  ], []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate refresh completion
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  return (
    <LinearGradient
      colors={['#1e3a8a', '#3b82f6']}
      locations={[0, 0.8]}
      useAngle={true}
      angle={145}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            isTablet && styles.tabletScrollContent
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#ffffff"
              colors={['#ffffff']}
            />
          }
        >
          <ResponsiveContainer>
            <View style={isLandscapeTablet ? styles.tabletLandscapeLayout : null}>
              <View style={[
                isLandscapeTablet ? styles.leftColumn : null,
                { marginBottom: isLandscapeTablet ? 0 : 16 }
              ]}>
                <StatusHeader />
                <SettingsSection 
                  title="Network Settings"
                  items={networkSettings}
                />
                <DeviceInfo />
              </View>

              {isLandscapeTablet && (
                <View style={styles.rightColumn}>
                  <SettingsSection 
                    title="Application"
                    items={appSettings}
                  />
                  <SettingsSection 
                    title="Support"
                    items={supportSettings}
                  />
                </View>
              )}
            </View>

            {!isLandscapeTablet && (
              <>
                <SettingsSection 
                  title="Application"
                  items={appSettings}
                />
                <SettingsSection 
                  title="Support"
                  items={supportSettings}
                />
              </>
            )}
          </ResponsiveContainer>
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
  tabletScrollContent: {
    padding: 24,
  },
  tabletLandscapeLayout: {
    flexDirection: 'row',
    gap: 24,
  },
  leftColumn: {
    flex: 1,
  },
  rightColumn: {
    flex: 1,
  },
});