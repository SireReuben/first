import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusHeader } from '@/components/StatusHeader';
import { AlertsList } from '@/components/AlertsList';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';
import { useAlerts } from '@/hooks/useAlerts';
import { useDeviceState } from '@/hooks/useDeviceState';
import { useDeviceOrientation } from '@/hooks/useDeviceOrientation';

interface Alert {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  source: 'local' | 'device';
}

interface AlertStatProps {
  count: number;
  label: string;
  isTablet?: boolean;
  highlight?: boolean;
}

const AlertStat = ({ count, label, isTablet, highlight }: AlertStatProps) => (
  <View style={[styles.statItem, isTablet && styles.tabletStatItem]}>
    <Text style={[
      styles.statValue, 
      isTablet && styles.tabletStatValue,
      highlight && styles.highlightValue
    ]}>
      {count}
    </Text>
    <Text style={[styles.statLabel, isTablet && styles.tabletStatLabel]}>
      {label}
    </Text>
  </View>
);

const AlertStatsSection = ({ alerts, unreadCount, isTablet }: {
  alerts: Alert[];
  unreadCount: number;
  isTablet: boolean;
}) => {
  const stats = useMemo(() => [
    { count: alerts.length, label: 'Total' },
    { count: unreadCount, label: 'Unread', highlight: unreadCount > 0 },
    { count: alerts.filter(a => a.type === 'error').length, label: 'Errors', highlight: true },
    { count: alerts.filter(a => a.source === 'device').length, label: 'Device' }
  ], [alerts, unreadCount]);

  return (
    <View style={[styles.statsCard, isTablet && styles.tabletStatsCard]}>
      <Text style={[styles.statsTitle, isTablet && styles.tabletStatsTitle]}>
        Alert Statistics
      </Text>
      <View style={[styles.statsGrid, isTablet && styles.tabletStatsGrid]}>
        {stats.map((stat) => (
          <AlertStat
            key={stat.label}
            count={stat.count}
            label={stat.label}
            isTablet={isTablet}
            highlight={stat.highlight}
          />
        ))}
      </View>
    </View>
  );
};

export default function AlertsScreen() {
  const { 
    alerts, 
    unreadCount, 
    isConnected: alertsConnected,
    markAsRead, 
    deleteAlert, 
    clearAllAlerts, 
    markAllAsRead,
    refreshAlerts
  } = useAlerts();
  
  const { isConnected: deviceConnected } = useDeviceState();
  const { isTablet, isLandscape, screenType } = useDeviceOrientation();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    refreshAlerts().finally(() => setRefreshing(false));
  }, [refreshAlerts]);

  const isLandscapeTablet = isTablet && isLandscape && screenType !== 'phone';
  const errorCount = useMemo(() => alerts.filter(a => a.type === 'error').length, [alerts]);
  const deviceAlertCount = useMemo(() => alerts.filter(a => a.source === 'device').length, [alerts]);

  return (
    <LinearGradient
      colors={['#1e3a8a', '#3b82f6']}
      locations={[0, 0.7]}
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
                <ConnectionStatus isConnected={deviceConnected} />
                <View style={[styles.card, isTablet && styles.tabletCard]}>
                  <View style={styles.headerContainer}>
                    <Text style={[styles.sectionTitle, isTablet && styles.tabletSectionTitle]}>
                      System Alerts
                    </Text>
                    {unreadCount > 0 && (
                      <View style={[styles.unreadBadge, isTablet && styles.tabletUnreadBadge]}>
                        <Text style={[styles.unreadBadgeText, isTablet && styles.tabletUnreadBadgeText]}>
                          {unreadCount}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.sectionDescription, isTablet && styles.tabletSectionDescription]}>
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
              </View>

              {isLandscapeTablet && (
                <View style={styles.rightColumn}>
                  <AlertStatsSection 
                    alerts={alerts} 
                    unreadCount={unreadCount} 
                    isTablet={isTablet} 
                  />
                  <View style={[styles.infoCard, isTablet && styles.tabletInfoCard]}>
                    <Text style={[styles.infoTitle, isTablet && styles.tabletInfoTitle]}>
                      Alert System Status
                    </Text>
                    <View style={styles.infoRow}>
                      <Text style={[styles.infoLabel, isTablet && styles.tabletInfoLabel]}>
                        Device Connection:
                      </Text>
                      <Text style={[
                        styles.infoValue,
                        isTablet && styles.tabletInfoValue,
                        { color: deviceConnected ? '#22c55e' : '#ef4444' }
                      ]}>
                        {deviceConnected ? 'Connected' : 'Disconnected'}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={[styles.infoLabel, isTablet && styles.tabletInfoLabel]}>
                        Alert Monitoring:
                      </Text>
                      <Text style={[
                        styles.infoValue,
                        isTablet && styles.tabletInfoValue,
                        { color: '#22c55e' }
                      ]}>
                        Active
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={[styles.infoLabel, isTablet && styles.tabletInfoLabel]}>
                        Update Frequency:
                      </Text>
                      <Text style={[styles.infoValue, isTablet && styles.tabletInfoValue]}>
                        Every 10 seconds
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>

            {!isLandscapeTablet && (
              <>
                <AlertStatsSection 
                  alerts={alerts} 
                  unreadCount={unreadCount} 
                  isTablet={isTablet} 
                />
                <View style={[styles.infoCard, isTablet && styles.tabletInfoCard]}>
                  <Text style={[styles.infoTitle, isTablet && styles.tabletInfoTitle]}>
                    Alert System Status
                  </Text>
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, isTablet && styles.tabletInfoLabel]}>
                      Device Connection:
                    </Text>
                    <Text style={[
                      styles.infoValue,
                      isTablet && styles.tabletInfoValue,
                      { color: deviceConnected ? '#22c55e' : '#ef4444' }
                    ]}>
                      {deviceConnected ? 'Connected' : 'Disconnected'}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, isTablet && styles.tabletInfoLabel]}>
                      Alert Monitoring:
                    </Text>
                    <Text style={[
                      styles.infoValue,
                      isTablet && styles.tabletInfoValue,
                      { color: '#22c55e' }
                    ]}>
                      Active
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, isTablet && styles.tabletInfoLabel]}>
                      Update Frequency:
                    </Text>
                    <Text style={[styles.infoValue, isTablet && styles.tabletInfoValue]}>
                      Every 10 seconds
                    </Text>
                  </View>
                </View>
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
    flex: 2,
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
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  tabletSectionTitle: {
    fontSize: 24,
  },
  unreadBadge: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 12,
  },
  tabletUnreadBadge: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 16,
  },
  unreadBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  tabletUnreadBadgeText: {
    fontSize: 14,
  },
  sectionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  tabletSectionDescription: {
    fontSize: 16,
    marginBottom: 24,
  },
  statsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
  },
  tabletStatsCard: {
    padding: 24,
    borderRadius: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1e40af',
    marginBottom: 16,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  tabletStatsTitle: {
    fontSize: 22,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  tabletStatsGrid: {
    flexDirection: 'column',
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  tabletStatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#374151',
    marginBottom: 4,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  tabletStatValue: {
    fontSize: 28,
    marginBottom: 0,
  },
  highlightValue: {
    color: '#ef4444',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6b7280',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  tabletStatLabel: {
    fontSize: 16,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tabletInfoCard: {
    padding: 20,
    borderRadius: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  tabletInfoTitle: {
    fontSize: 20,
    marginBottom: 16,
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
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  tabletInfoLabel: {
    fontSize: 16,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  tabletInfoValue: {
    fontSize: 16,
  },
});