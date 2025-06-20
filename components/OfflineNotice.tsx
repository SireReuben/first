import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WifiOff, TriangleAlert as AlertTriangle } from 'lucide-react-native';

export function OfflineNotice() {
  const steps = [
    'Ensure device is powered on',
    'Connect to "AEROSPIN CONTROL" WiFi network',
    'Wait for automatic connection',
    'Session controls will be enabled when connected'
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <WifiOff size={20} color="#ef4444" />
        <Text style={styles.title}>Offline Mode</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.infoRow}>
          <AlertTriangle size={16} color="#f59e0b" />
          <Text style={styles.infoText}>
            Device not connected - Operating in offline mode
          </Text>
        </View>
        
        <Text style={styles.instructions}>
          To connect to your AEROSPIN device:
        </Text>
        
        <View style={styles.stepsList}>
          {steps.map((step, index) => (
            <Text key={index} style={styles.stepText}>
              {index + 1}. {step}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(254, 242, 242, 0.95)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#dc2626',
    marginLeft: 8,
  },
  content: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#b45309',
    marginLeft: 8,
    flex: 1,
  },
  instructions: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#7f1d1d',
    marginBottom: 4,
  },
  stepsList: {
    gap: 2,
  },
  stepText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#7f1d1d',
    lineHeight: 18,
  },
});