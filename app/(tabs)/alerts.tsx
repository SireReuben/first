import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusHeader } from '@/components/StatusHeader';
import { AlertsList } from '@/components/AlertsList';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { useAlerts } from '@/hooks/useAlerts';
import { useDeviceState } from '@/hooks/useDeviceState';

export default function AlertsScreen() {
  const { 
    alerts, 
    unreadCount, 
    isConnected: alertsConnected,
    markAsRead, 
    deleteAlert, 
    clearAllAlerts, 
    markAllAsRead 
  } = useAlerts();
  
  const { isConnected: deviceConnected } = useDeviceState();

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
          <ConnectionStatus isConnected={deviceConnected} />
          
          <View style={styles.card}>
            <View style={styles.headerContainer}>
              <Text style={styles.sectionTitle}>System Alerts</Text>
              {unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
                </View>
              )}
            </View>
            
            <Text style={styles.sectionDescription}>
              Real-time notifications from your AEROSPIN device and app
            </Text>
            
            <AlertsList 
              alerts={alerts}
              onMarkAsRead={markAsRead}
              onDeleteAlert={deleteAlert}
              onClearAll={clearAllAlerts}
              onMarkAllAsRead={markAllAsRead}
            />
          </View>

          {/* Alert Statistics */}
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Alert Statistics</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{alerts.length}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{unreadCount}</Text>
                <Text style={styles.statLabel}>Unread</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {alerts.filter(a => a.type === 'error').length}
                </Text>
                <Text style={styles.statLabel}>Errors</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {alerts.filter(a => a.source === 'device').length}
                </Text>
                <Text style={styles.statLabel}>Device</Text>
              </View>
            </View>
          </View>

          {/* Connection Status Info */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Alert System Status</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Device Connection:</Text>
              <Text style={[
                styles.infoValue,
                { color: deviceConnected ? '#22c55e' : '#ef4444' }
              ]}>
                {deviceConnected ? 'Connected' : 'Disconnected'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Alert Monitoring:</Text>
              <Text style={[styles.infoValue, { color: '#22c55e' }]}>
                Active
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Update Frequency:</Text>
              <Text style={styles.infoValue}>Every 10 seconds</Text>
            </View>
          </View>
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
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1e40af',
  },
  unreadBadge: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 12,
  },
  unreadBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  sectionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  statsCard: {
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
  statsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1e40af',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#374151',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6b7280',
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
  },
});