import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Network from 'expo-network';

interface DeviceState {
  direction: string;
  brake: string;
  speed: number;
  sessionActive: boolean;
}

interface SessionData {
  startTime: string;
  duration: string;
  events: string[];
}

// Enhanced connection logic for Android with multiple fallback strategies
const ARDUINO_BASE_URL = Platform.OS === 'web' ? '/api' : 'http://192.168.4.1';
const CONNECTION_TIMEOUT = 3000;
const MAX_RETRY_ATTEMPTS = 2;
const ARDUINO_NETWORK_PREFIX = '192.168.4.';

const FALLBACK_ENDPOINTS = [
  'http://192.168.4.1',
  'http://192.168.4.1:80',
  'http://aerospin.local',
  'http://192.168.1.1',
];

const INVALID_IPS = ['0.0.0.0', '127.0.0.1', '0.0.0.1'];
export function useDeviceState() {
  const [deviceState, setDeviceState] = useState<DeviceState>({
    direction: 'None',
    brake: 'None',
    speed: 0,
    sessionActive: false,
  });

  const [isConnected, setIsConnected] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [lastConnectionCheck, setLastConnectionCheck] = useState<Date | null>(null);
  const [currentEndpoint, setCurrentEndpoint] = useState(ARDUINO_BASE_URL);
  const [networkInfo, setNetworkInfo] = useState<string>('');
  const [sessionData, setSessionData] = useState<SessionData>({
    startTime: '',
    duration: '',
    events: [],
  });

  const [previousBrakePosition, setPreviousBrakePosition] = useState<string>('None');

  const detectArduinoNetwork = useCallback(async (): Promise<string | null> => {
    if (Platform.OS === 'web') return null;

    try {
      const networkState = await Network.getNetworkStateAsync();
      const ipAddress = networkState?.details?.ipAddress as string;

      // Try to detect if we're on a network that might have the Arduino
      if (ipAddress && ipAddress.includes('.')) {
        const ipParts = ipAddress.split('.');

        if (ipParts.length === 4) {
          const networkBase = `${ipParts[0]}.${ipParts[1]}.${ipParts[2]}.`;
          const possibleArduinoIP = `http://${networkBase}1`;
          console.log('Trying alternative Arduino IP:', possibleArduinoIP);
          return possibleArduinoIP;
        } else {
          console.warn('IP address has an unexpected format:', ipAddress);
        }
      } else {
        console.warn('IP address is undefined or invalid:', ipAddress);
      }

      setNetworkInfo(`Not on Arduino network. IP: ${ipAddress}`);
      return null;
    } catch (error) {
      console.log('Network detection error:', error);
      setNetworkInfo('Network detection failed - using fallback');
      return null;
    }
  }, []);
