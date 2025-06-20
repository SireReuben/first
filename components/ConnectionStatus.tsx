import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Circle, RefreshCw, Wifi, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import { useDeviceState } from '@/hooks/useDeviceState';

interface ConnectionStatusProps {
  isConnected: boolean;
}

export function ConnectionStatus({ isConnected }: ConnectionStatusProps) {
  const { 
    connectionAttempts, 
    networkInfo, 
    currentEndpoint, 
    checkConnection 
  } = useDeviceState();

  const handleRetryConnection = async () => {
    await checkConnection();
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        <Circle 
          size={12} 
          color={isConnected ? '#22c55e' : '#ef4444'} 
          fill={isConnected ? '#22c55e' : '#ef4444'}
        />
        <Text style={styles.statusText}>
          {isConnected ? 'Device Connected' : 'Device Disconnected'}
        </Text>
        {!isConnected && (
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={handleRetryConnection}
          >
            <RefreshCw size={14} color="#3b82f6" />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Show additional connection info for debugging */}
      {(!isConnected || connectionAttempts > 0) && (
        <View style={styles.debugInfo}>
          {connectionAttempts > 0 && (
            <View style={styles.debugRow}>
              <AlertTriangle size={12} color="#f59e0b" />
              <Text style={styles.debugText}>
                Connection attempts: {String(connectionAttempts)}
              </Text>
            </View>
          )}
          
          {networkInfo && (
            <View style={styles.debugRow}>
              <Wifi size={12} color="#6b7280" />
              <Text style={styles.debugText}>
                {String(networkInfo)}
              </Text>
            </View>
          )}
          
          {currentEndpoint && (
            <View style={styles.debugRow}>
              <Circle size={8} color="#6b7280" />
              <Text style={styles.debugText}>
                Endpoint: {String(currentEndpoint)}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
    marginLeft: 8,
    flex: 1,
    textAlign: 'center',
  },
  retryButton: {
    padding: 4,
    marginLeft: 8,
  },
  debugInfo: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  debugRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  debugText: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 6,
  },
});