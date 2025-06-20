import { useState, useEffect } from 'react';
import { Platform, Alert, Linking } from 'react-native';
import * as Location from 'expo-location';
import * as Network from 'expo-network';

interface NetworkPermissions {
  hasLocationPermission: boolean;
  hasNetworkAccess: boolean;
  isLocationEnabled: boolean;
  permissionStatus: 'granted' | 'denied' | 'undetermined' | 'checking';
  requestPermissions: () => Promise<boolean>;
  checkNetworkConnection: () => Promise<boolean>;
}

export function useNetworkPermissions(): NetworkPermissions {
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [hasNetworkAccess, setHasNetworkAccess] = useState(false);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'undetermined' | 'checking'>('undetermined');

  const checkLocationPermission = async () => {
    if (Platform.OS === 'web') {
      setHasLocationPermission(true);
      setIsLocationEnabled(true);
      setPermissionStatus('granted');
      return true;
    }

    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      const enabled = await Location.hasServicesEnabledAsync();
      
      setHasLocationPermission(status === 'granted');
      setIsLocationEnabled(enabled);
      setPermissionStatus(status === 'granted' ? 'granted' : 'denied');
      
      return status === 'granted' && enabled;
    } catch (error) {
      console.error('Error checking location permission:', error);
      setPermissionStatus('denied');
      return false;
    }
  };

  const checkNetworkConnection = async (): Promise<boolean> => {
    try {
      const networkState = await Network.getNetworkStateAsync();
      const hasAccess = networkState.isConnected && networkState.isInternetReachable !== false;
      setHasNetworkAccess(hasAccess);
      return hasAccess;
    } catch (error) {
      console.error('Error checking network connection:', error);
      setHasNetworkAccess(false);
      return false;
    }
  };

  const requestPermissions = async (): Promise<boolean> => {
    if (Platform.OS === 'web') {
      return true;
    }

    setPermissionStatus('checking');

    try {
      // Check if location services are enabled first
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        setPermissionStatus('denied');
        setIsLocationEnabled(false);
        
        Alert.alert(
          'Location Services Required',
          'Please enable Location Services in your device settings to connect to AEROSPIN device. This is required by Android to scan for Wi-Fi networks.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Open Settings', 
              onPress: () => {
                try {
                  Linking.openSettings();
                } catch (error) {
                  console.error('Failed to open settings:', error);
                }
              }
            }
          ]
        );
        return false;
      }

      setIsLocationEnabled(true);

      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        setHasLocationPermission(true);
        setPermissionStatus('granted');
        
        // Also check network access
        await checkNetworkConnection();
        
        return true;
      } else {
        setHasLocationPermission(false);
        setPermissionStatus('denied');
        
        Alert.alert(
          'Permission Required',
          'Location permission is required to detect and connect to AEROSPIN device Wi-Fi network. This is a requirement on Android 10+ for Wi-Fi scanning.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Open Settings', 
              onPress: () => {
                try {
                  Linking.openSettings();
                } catch (error) {
                  console.error('Failed to open settings:', error);
                }
              }
            }
          ]
        );
        return false;
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      setPermissionStatus('denied');
      setHasLocationPermission(false);
      
      Alert.alert(
        'Permission Error',
        'Failed to request location permission. Please grant location permission manually in device settings.',
        [
          { text: 'OK' },
          { 
            text: 'Open Settings', 
            onPress: () => {
              try {
                Linking.openSettings();
              } catch (settingsError) {
                console.error('Failed to open settings:', settingsError);
              }
            }
          }
        ]
      );
      return false;
    }
  };

  useEffect(() => {
    const initializePermissions = async () => {
      try {
        await checkLocationPermission();
        await checkNetworkConnection();
      } catch (error) {
        console.error('Failed to initialize permissions:', error);
      }
    };

    initializePermissions();
  }, []);

  return {
    hasLocationPermission,
    hasNetworkAccess,
    isLocationEnabled,
    permissionStatus,
    requestPermissions,
    checkNetworkConnection,
  };
}