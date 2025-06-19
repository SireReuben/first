import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusHeader } from '@/components/StatusHeader';
import { SessionControls } from '@/components/SessionControls';
import { SessionReport } from '@/components/SessionReport';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { OfflineNotice } from '@/components/OfflineNotice';
import { useDeviceState } from '@/hooks/useDeviceState';

export default function SessionsScreen() {
  const { deviceState, sessionData, isConnected, startSession, endSession } = useDeviceState();

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
          <ConnectionStatus isConnected={isConnected} />
          
          {!isConnected && <OfflineNotice />}
          
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Session Management</Text>
            <Text style={styles.sectionDescription}>
              Start a session to begin device control and monitoring
            </Text>
            <SessionControls
              sessionActive={deviceState.sessionActive}
              onStartSession={startSession}
              onEndSession={endSession}
              isConnected={isConnected}
            />
          </View>

          {deviceState.sessionActive && (
            <SessionReport sessionData={sessionData} />
          )}

          {!deviceState.sessionActive && (
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Ready to Start</Text>
              <Text style={styles.infoText}>
                • Ensure device is powered on{'\n'}
                • Connect to "AEROSPIN CONTROL" WiFi{'\n'}
                • Start a session to access controls{'\n'}
                • Dashboard will be available during active sessions
              </Text>
            </View>
          )}
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
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1e40af',
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
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
  infoTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    lineHeight: 20,
  },
});