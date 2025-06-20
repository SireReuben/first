import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { Wifi, MapPin, Settings, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import { useNetworkPermissions } from '@/hooks/useNetworkPermissions';

interface NetworkPermissionGuardProps {
  children: React.ReactNode;
}

export function NetworkPermissionGuard({ children }: NetworkPermissionGuardProps) {
  const {
    hasLocationPermission,
    hasNetworkAccess,
    isLocationEnabled,
    permissionStatus,
    requestPermissions,
    checkNetworkConnection,
  } = useNetworkPermissions();

  const [showPermissionScreen, setShowPermissionScreen] = useState(false);
  const [isRequestingPermissions, setIsRequestingPermissions] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') {
      setShowPermissionScreen(false);
      return;
    }

    // Show permission screen if we don't have required permissions
    const needsPermissions = !hasLocationPermission || !isLocationEnabled || !hasNetworkAccess;
    setShowPermissionScreen(needsPermissions);
  }, [hasLocationPermission, isLocationEnabled, hasNetworkAccess]);

  const handleRequestPermissions = async () => {
    if (isRequestingPermissions) return;
    
    setIsRequestingPermissions(true);
    
    try {
      const granted = await requestPermissions();
      if (granted) {
        const networkOk = await checkNetworkConnection();
        if (networkOk) {
          setShowPermissionScreen(false);
        }
      }
    } catch (error) {
      console.error('Permission request failed:', error);
      Alert.alert(
        'Permission Error',
        'Failed to request permissions. Please try again or grant permissions manually in device settings.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsRequestingPermissions(false);
    }
  };

  const handleNetworkHelp = () => {
    Alert.alert(
      'Network Connection Help',
      'To connect to your AEROSPIN device:\n\n' +
      '1. Make sure your AEROSPIN device is powered on\n' +
      '2. Go to Wi-Fi settings on your phone\n' +
      '3. Connect to "AEROSPIN CONTROL" network\n' +
      '4. Return to this app\n\n' +
      'Note: On Android 10+, location permission is required to scan for Wi-Fi networks.',
      [{ text: 'OK' }]
    );
  };

  const handleSkipPermissions = () => {
    Alert.alert(
      'Skip Permissions',
      'You can continue without permissions, but device detection may not work properly. You can manually connect to the AEROSPIN device later.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Continue Anyway', 
          onPress: () => setShowPermissionScreen(false)
        }
      ]
    );
  };

  if (Platform.OS === 'web' || !showPermissionScreen) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Wifi size={64} color="#3b82f6" />
        </View>

        <Text style={styles.title}>Network Setup Required</Text>
        <Text style={styles.description}>
          AEROSPIN Control needs network permissions to connect to your device.
        </Text>

        <View style={styles.permissionsList}>
          <View style={[styles.permissionItem, hasLocationPermission ? styles.permissionGranted : styles.permissionDenied]}>
            <MapPin size={20} color={hasLocationPermission ? '#22c55e' : '#ef4444'} />
            <Text style={[styles.permissionText, hasLocationPermission ? styles.permissionGrantedText : styles.permissionDeniedText]}>
              Location Permission {hasLocationPermission ? '✓' : '✗'}
            </Text>
          </View>

          <View style={[styles.permissionItem, isLocationEnabled ? styles.permissionGranted : styles.permissionDenied]}>
            <Settings size={20} color={isLocationEnabled ? '#22c55e' : '#ef4444'} />
            <Text style={[styles.permissionText, isLocationEnabled ? styles.permissionGrantedText : styles.permissionDeniedText]}>
              Location Services {isLocationEnabled ? '✓' : '✗'}
            </Text>
          </View>

          <View style={[styles.permissionItem, hasNetworkAccess ? styles.permissionGranted : styles.permissionDenied]}>
            <Wifi size={20} color={hasNetworkAccess ? '#22c55e' : '#ef4444'} />
            <Text style={[styles.permissionText, hasNetworkAccess ? styles.permissionGrantedText : styles.permissionDeniedText]}>
              Network Access {hasNetworkAccess ? '✓' : '✗'}
            </Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <AlertTriangle size={20} color="#f59e0b" />
          <Text style={styles.infoText}>
            Android 10+ requires location permission to scan for Wi-Fi networks. 
            This is a system requirement, not an app limitation.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.primaryButton, isRequestingPermissions && styles.disabledButton]}
            onPress={handleRequestPermissions}
            disabled={isRequestingPermissions}
          >
            <Text style={styles.primaryButtonText}>
              {isRequestingPermissions ? 'Requesting...' : 'Grant Permissions'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleNetworkHelp}
          >
            <Text style={styles.secondaryButtonText}>Connection Help</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkipPermissions}
          >
            <Text style={styles.skipButtonText}>Continue Without Permissions</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>
          Once permissions are granted, connect to "AEROSPIN CONTROL" Wi-Fi network to continue.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    margin: 16,
    maxWidth: 400,
    width: '100%',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    elevation: 4,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  permissionsList: {
    marginBottom: 24,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  permissionGranted: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  permissionDenied: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  permissionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginLeft: 12,
  },
  permissionGrantedText: {
    color: '#166534',
  },
  permissionDeniedText: {
    color: '#dc2626',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#fffbeb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  infoText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#92400e',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
  },
  secondaryButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  skipButton: {
    backgroundColor: '#fef2f2',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  skipButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#dc2626',
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 16,
  },
});