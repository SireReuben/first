import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusHeader } from '@/components/StatusHeader';
import { SessionControls } from '@/components/SessionControls';
import { SessionReport } from '@/components/SessionReport';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { OfflineNotice } from '@/components/OfflineNotice';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';
import { useDeviceState } from '@/hooks/useDeviceState';
import { useAlerts } from '@/hooks/useAlerts';
import { useDeviceOrientation } from '@/hooks/useDeviceOrientation';

export default function SessionsScreen() {
  const { 
    deviceState, 
    sessionData, 
    isConnected, 
    startSession, 
    endSession,
    refreshSessionData
  } = useDeviceState();
  
  const { addSessionAlert } = useAlerts();
  const { isTablet, isLandscape, screenType } = useDeviceOrientation();
  const [refreshing, setRefreshing] = React.useState(false);

  const isLandscapeTablet = useMemo(
    () => isTablet && isLandscape && screenType !== 'phone',
    [isTablet, isLandscape, screenType]
  );

  const handleStartSession = useCallback(async () => {
    try {
      await startSession();
      addSessionAlert('success', 'Session Started', 'Device control session initiated successfully');
    } catch (error) {
      addSessionAlert('error', 'Start Failed', 'Could not start session');
    }
  }, [startSession, addSessionAlert]);

  const handleEndSession = useCallback(async () => {
    try {
      await endSession();
      addSessionAlert('info', 'Session Ended', 'Device control session terminated and data saved');
    } catch (error) {
      addSessionAlert('error', 'End Failed', 'Could not properly end session');
    }
  }, [endSession, addSessionAlert]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshSessionData();
    setRefreshing(false);
  }, [refreshSessionData]);

  const readyInstructions = useMemo(() => [
    'Ensure device is powered on',
    'Connect to "AEROSPIN CONTROL" WiFi',
    'Start a session to access controls',
    'Dashboard will be available during active sessions',
    'Brake positions are preserved during operations'
  ], []);

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
                <ConnectionStatus isConnected={isConnected} />
                {!isConnected && <OfflineNotice />}
                <View style={[styles.card, isTablet && styles.tabletCard]}>
                  <Text style={[
                    styles.sectionTitle,
                    isTablet && styles.tabletSectionTitle,
                    styles.text
                  ]}>
                    Session Management
                  </Text>
                  <Text style={[
                    styles.sectionDescription,
                    isTablet && styles.tabletSectionDescription,
                    styles.text
                  ]}>
                    Start a session to begin device control and monitoring
                  </Text>
                  <SessionControls
                    sessionActive={deviceState.sessionActive}
                    onStartSession={handleStartSession}
                    onEndSession={handleEndSession}
                    isConnected={isConnected}
                  />
                </View>
                {!deviceState.sessionActive && (
                  <View style={[styles.infoCard, isTablet && styles.tabletInfoCard]}>
                    <Text style={[
                      styles.infoTitle,
                      isTablet && styles.tabletInfoTitle,
                      styles.text
                    ]}>
                      Ready to Start
                    </Text>
                    <View style={styles.instructionsList}>
                      {readyInstructions.map((instruction, index) => (
                        <Text key={index} style={[
                          styles.infoText,
                          isTablet && styles.tabletInfoText,
                          styles.text
                        ]}>
                          • {instruction}
                        </Text>
                      ))}
                    </View>
                  </View>
                )}
              </View>
              {isLandscapeTablet && deviceState.sessionActive && (
                <View style={styles.rightColumn}>
                  <SessionReport sessionData={sessionData} />
                </View>
              )}
            </View>
            {!isLandscapeTablet && deviceState.sessionActive && (
              <SessionReport sessionData={sessionData} />
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
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
  },
  tabletCard: {
    padding: 24,
    borderRadius: 20,
  },
  text: {
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1e40af',
    marginBottom: 8,
    textAlign: 'center',
  },
  tabletSectionTitle: {
    fontSize: 24,
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  tabletSectionDescription: {
    fontSize: 16,
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  tabletInfoCard: {
    padding: 24,
    borderRadius: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  tabletInfoTitle: {
    fontSize: 22,
    marginBottom: 16,
  },
  instructionsList: {
    gap: 4,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    lineHeight: 20,
  },
  tabletInfoText: {
    fontSize: 16,
    lineHeight: 24,
  },
});