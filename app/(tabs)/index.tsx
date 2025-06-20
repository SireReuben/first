import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusHeader } from '@/components/StatusHeader';
import { DeviceControls } from '@/components/DeviceControls';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { SessionRequiredNotice } from '@/components/SessionRequiredNotice';
import { useDeviceState } from '@/hooks/useDeviceState';
import { useAlerts } from '@/hooks/useAlerts';

export default function DashboardScreen() {
  const { 
    deviceState, 
    isConnected, 
    updateDeviceState, 
    emergencyStop, 
    resetDevice, 
    releaseBrake 
  } = useDeviceState();
  
  const { addOperationAlert, addSafetyAlert } = useAlerts();

  // Enhanced device control handlers with alert integration
  const handleUpdateDeviceState = async (updates: Partial<typeof deviceState>) => {
    await updateDeviceState(updates);
    
    // Add operation alerts
    Object.entries(updates).forEach(([key, value]) => {
      if (key === 'direction' && value !== 'None') {
        addOperationAlert(`Motor direction set to ${value}`, 'success');
      } else if (key === 'brake' && value !== 'None') {
        addOperationAlert(`${value} brake applied`, 'success');
      } else if (key === 'speed' && typeof value === 'number') {
        addOperationAlert(`Motor speed set to ${value}%`, 'success');
      }
    });
  };

  const handleEmergencyStop = async () => {
    await emergencyStop();
    addSafetyAlert('Emergency stop activated - All operations halted');
  };

  const handleResetDevice = async () => {
    await resetDevice();
    addOperationAlert('Device reset completed', 'success');
  };

  const handleReleaseBrake = async () => {
    await releaseBrake();
    addOperationAlert('Brake released', 'success');
  };

  // Show session required notice if no active session
  if (!deviceState.sessionActive) {
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
            <SessionRequiredNotice />
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

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
          
          <View style={styles.statusCard}>
            <Text style={styles.sectionTitle}>Live Device Status</Text>
            <View style={styles.statusGrid}>
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Direction</Text>
                <Text style={[
                  styles.statusValue,
                  deviceState.direction !== 'None' && styles.statusValueActive
                ]}>
                  {deviceState.direction}
                </Text>
              </View>
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Brake</Text>
                <Text style={[
                  styles.statusValue,
                  deviceState.brake !== 'None' && styles.statusValueActive
                ]}>
                  {deviceState.brake}
                </Text>
              </View>
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Speed</Text>
                <Text style={[
                  styles.statusValue,
                  deviceState.speed > 0 && styles.statusValueActive
                ]}>
                  {deviceState.speed}%
                </Text>
              </View>
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Session</Text>
                <Text style={[styles.statusValue, styles.statusValueActive]}>
                  Active
                </Text>
              </View>
            </View>
          </View>

          <DeviceControls 
            deviceState={deviceState}
            onUpdateState={handleUpdateDeviceState}
            onEmergencyStop={handleEmergencyStop}
            onReset={handleResetDevice}
            onReleaseBrake={handleReleaseBrake}
            disabled={!isConnected}
          />

          <View style={styles.warningCard}>
            <Text style={styles.warningTitle}>⚠️ Safety Notice</Text>
            <Text style={styles.warningText}>
              Always ensure proper safety protocols are followed when operating the device. 
              Monitor all operations and be prepared to use emergency stop if needed.
              The brake position will be preserved during emergency stops and device resets.
            </Text>
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
  statusCard: {
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
    marginBottom: 16,
    textAlign: 'center',
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statusItem: {
    width: '48%',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#6b7280',
  },
  statusValueActive: {
    color: '#1e40af',
  },
  warningCard: {
    backgroundColor: 'rgba(254, 242, 242, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  warningTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#dc2626',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#7f1d1d',
    lineHeight: 20,
  },
});