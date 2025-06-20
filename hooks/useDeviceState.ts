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
const CONNECTION_TIMEOUT = 8000; // Increased timeout for Android
const MAX_RETRY_ATTEMPTS = 5; // More retry attempts
const ARDUINO_NETWORK_PREFIX = '192.168.4.';

// Alternative endpoints to try if main fails
const FALLBACK_ENDPOINTS = [
  'http://192.168.4.1',
  'http://192.168.4.1:80',
  'http://aerospin.local',
  'http://192.168.1.1', // Some devices use this as fallback
];

// Invalid IP addresses that should not be used for connection attempts
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

  // Store brake position before reset/emergency stop
  const [previousBrakePosition, setPreviousBrakePosition] = useState<string>('None');

  // Enhanced network detection for Android
  const detectArduinoNetwork = useCallback(async (): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return ARDUINO_BASE_URL;
    }

    try {
      const networkState = await Network.getNetworkStateAsync();
      if (!networkState.isConnected) {
        setNetworkInfo('No network connection');
        return null;
      }

      // Get current IP address
      const ipAddress = await Network.getIpAddressAsync();
      setNetworkInfo(`Current IP: ${ipAddress}`);
      
      // Check if the IP address is invalid
      if (INVALID_IPS.includes(ipAddress)) {
        console.log('Invalid IP address detected:', ipAddress);
        setNetworkInfo(`Invalid IP detected: ${ipAddress} - using fallback endpoints`);
        return null;
      }
      
      // Check if we're on Arduino's network
      if (ipAddress.startsWith(ARDUINO_NETWORK_PREFIX)) {
        console.log('Detected Arduino network, IP:', ipAddress);
        return ARDUINO_BASE_URL;
      }

      // Try to detect if we're on a network that might have the Arduino
      // Some routers assign different IP ranges
      const ipParts = ipAddress.split('.');
      if (ipParts.length === 4) {
        const networkBase = `${ipParts[0]}.${ipParts[1]}.${ipParts[2]}.`;
        const possibleArduinoIP = `http://${networkBase}1`;
        console.log('Trying alternative Arduino IP:', possibleArduinoIP);
        return possibleArduinoIP;
      }

      setNetworkInfo(`Not on Arduino network. IP: ${ipAddress}`);
      return null;
    } catch (error) {
      console.log('Network detection error:', error);
      setNetworkInfo('Network detection failed');
      return null;
    }
  }, []);

  // Enhanced connection check with multiple strategies
  const checkConnection = useCallback(async (retryCount = 0): Promise<boolean> => {
    try {
      // First, detect the correct network and endpoint
      const detectedEndpoint = await detectArduinoNetwork();
      if (!detectedEndpoint && Platform.OS !== 'web') {
        console.log('Arduino network not detected');
        setIsConnected(false);
        return false;
      }

      const endpointToUse = detectedEndpoint || currentEndpoint;
      
      // Try multiple endpoints if the primary fails
      const endpointsToTry = detectedEndpoint ? [detectedEndpoint] : FALLBACK_ENDPOINTS;
      
      for (const endpoint of endpointsToTry) {
        try {
          console.log(`Attempting connection to: ${endpoint}`);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), CONNECTION_TIMEOUT);
          
          const response = await fetch(`${endpoint}/ping`, {
            method: 'GET',
            signal: controller.signal,
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0',
              'Accept': 'text/plain, */*',
            },
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            console.log(`Successfully connected to: ${endpoint}`);
            setCurrentEndpoint(endpoint);
            setIsConnected(true);
            setConnectionAttempts(0);
            setLastConnectionCheck(new Date());
            await fetchDeviceStatus(endpoint);
            return true;
          } else {
            console.log(`HTTP error ${response.status} from ${endpoint}`);
          }
        } catch (endpointError) {
          console.log(`Failed to connect to ${endpoint}:`, endpointError);
          continue; // Try next endpoint
        }
      }
      
      // If all endpoints failed and we have retries left
      if (retryCount < MAX_RETRY_ATTEMPTS) {
        console.log(`All endpoints failed, retrying in ${(retryCount + 1) * 2} seconds...`);
        const delay = (retryCount + 1) * 2000; // Progressive delay
        await new Promise(resolve => setTimeout(resolve, delay));
        return checkConnection(retryCount + 1);
      }
      
      setIsConnected(false);
      setConnectionAttempts(prev => prev + 1);
      return false;
      
    } catch (error) {
      console.log(`Connection check failed:`, error);
      
      if (retryCount < MAX_RETRY_ATTEMPTS) {
        const delay = (retryCount + 1) * 2000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return checkConnection(retryCount + 1);
      }
      
      setIsConnected(false);
      setConnectionAttempts(prev => prev + 1);
      return false;
    }
  }, [currentEndpoint, detectArduinoNetwork]);

  const fetchDeviceStatus = useCallback(async (endpoint?: string) => {
    const endpointToUse = endpoint || currentEndpoint;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CONNECTION_TIMEOUT);
      
      const response = await fetch(`${endpointToUse}/status`, {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const statusText = await response.text();
        parseDeviceStatus(statusText);
      }
    } catch (error) {
      console.log('Failed to fetch device status:', error);
    }
  }, [currentEndpoint]);

  // Enhanced connection monitoring with adaptive intervals
  useEffect(() => {
    let connectionCheckInterval: NodeJS.Timeout;
    let isComponentMounted = true;

    const startConnectionMonitoring = async () => {
      if (!isComponentMounted) return;

      // Initial connection check with longer delay for Android
      setTimeout(async () => {
        if (isComponentMounted) {
          console.log('Starting initial connection check...');
          await checkConnection();
        }
      }, Platform.OS === 'android' ? 3000 : 2000);

      // Set up periodic connection monitoring with adaptive intervals
      setTimeout(() => {
        if (isComponentMounted) {
          const interval = isConnected ? 30000 : 15000; // Less frequent when connected
          console.log(`Setting up connection monitoring every ${interval}ms`);
          
          connectionCheckInterval = setInterval(async () => {
            if (isComponentMounted) {
              await checkConnection();
            }
          }, interval);
        }
      }, 8000);
    };

    startConnectionMonitoring();

    return () => {
      isComponentMounted = false;
      if (connectionCheckInterval) {
        clearInterval(connectionCheckInterval);
      }
    };
  }, [checkConnection, isConnected]);

  // Session data updates with optimized intervals
  useEffect(() => {
    if (!deviceState.sessionActive) return;

    let durationInterval: NodeJS.Timeout;
    let sessionInterval: NodeJS.Timeout;
    let isComponentMounted = true;

    const updateSessionData = () => {
      if (!isComponentMounted) return;
      
      setSessionData(prev => ({
        ...prev,
        duration: calculateDuration(prev.startTime),
      }));
    };

    durationInterval = setInterval(updateSessionData, 1000);

    if (isConnected) {
      const fetchSessionLog = async () => {
        if (!isComponentMounted) return;

        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), CONNECTION_TIMEOUT);
          
          const response = await fetch(`${currentEndpoint}/getSessionLog`, {
            signal: controller.signal,
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0',
            },
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok && isComponentMounted) {
            const logData = await response.text();
            const events = logData.split('\n').filter(line => line.trim());
            
            setSessionData(prev => ({
              ...prev,
              events,
            }));
          }
        } catch (error) {
          console.log('Failed to fetch session log:', error);
        }
      };

      sessionInterval = setInterval(fetchSessionLog, 20000); // Less frequent polling
    }

    return () => {
      isComponentMounted = false;
      if (durationInterval) clearInterval(durationInterval);
      if (sessionInterval) clearInterval(sessionInterval);
    };
  }, [deviceState.sessionActive, isConnected, currentEndpoint]);

  const parseDeviceStatus = useCallback((statusText: string) => {
    const lines = statusText.split('\n');
    const updates: Partial<DeviceState> = {};

    lines.forEach(line => {
      if (line.startsWith('Direction: ')) {
        updates.direction = line.replace('Direction: ', '');
      } else if (line.startsWith('Brake: ')) {
        updates.brake = line.replace('Brake: ', '');
      } else if (line.startsWith('Speed: ')) {
        updates.speed = parseInt(line.replace('Speed: ', '')) || 0;
      } else if (line.startsWith('Session: ')) {
        updates.sessionActive = line.replace('Session: ', '') === 'Active';
      }
    });

    setDeviceState(prev => ({ ...prev, ...updates }));
  }, []);

  const addSessionEvent = useCallback((event: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const eventWithTime = `${timestamp}: ${event}`;
    
    setSessionData(prev => ({
      ...prev,
      events: [...prev.events, eventWithTime],
    }));
  }, []);

  const sendArduinoCommand = useCallback(async (endpoint: string, timeout: number = CONNECTION_TIMEOUT) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(`${currentEndpoint}${endpoint}`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Arduino command failed: ${response.status}`);
      }
      
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }, [currentEndpoint]);

  const updateDeviceState = useCallback(async (updates: Partial<DeviceState>) => {
    // Store previous brake position before any changes
    if (updates.brake !== undefined && deviceState.brake !== 'None') {
      setPreviousBrakePosition(deviceState.brake);
    }

    // Update local state immediately for smooth UI
    setDeviceState(prev => ({ ...prev, ...updates }));

    // Log the change if session is active
    if (deviceState.sessionActive) {
      Object.entries(updates).forEach(([key, value]) => {
        if (key !== 'sessionActive') {
          addSessionEvent(`${key} changed to ${value}`);
        }
      });
    }

    if (!isConnected) {
      addSessionEvent('Operating in offline mode - changes saved locally');
      return;
    }

    try {
      if (updates.direction !== undefined) {
        await sendArduinoCommand(`/direction?state=${updates.direction.toLowerCase()}`);
      }
      
      if (updates.brake !== undefined) {
        const action = updates.brake.toLowerCase();
        const state = updates.brake === 'None' ? 'off' : 'on';
        await sendArduinoCommand(`/brake?action=${action}&state=${state}`);
      }
      
      if (updates.speed !== undefined) {
        await sendArduinoCommand(`/speed?value=${updates.speed}`);
      }
    } catch (error) {
      console.log('Device update failed, continuing in offline mode:', error);
      addSessionEvent('Device communication lost - operating offline');
    }
  }, [deviceState, isConnected, sendArduinoCommand, addSessionEvent]);

  const startSession = useCallback(async () => {
    const sessionStartTime = new Date().toLocaleString();
    
    setDeviceState(prev => ({ ...prev, sessionActive: true }));
    setSessionData({
      startTime: sessionStartTime,
      duration: '00:00:00',
      events: [
        `Session started at ${sessionStartTime}`,
        `Network info: ${networkInfo}`,
        `Using endpoint: ${currentEndpoint}`,
      ],
    });

    if (!isConnected) {
      addSessionEvent('Operating in offline mode');
      return;
    }

    try {
      await sendArduinoCommand('/startSession');
      addSessionEvent('Connected to device successfully');
    } catch (error) {
      addSessionEvent('Device connection lost - continuing offline');
    }
  }, [isConnected, sendArduinoCommand, addSessionEvent, networkInfo, currentEndpoint]);

  const endSession = useCallback(async () => {
    addSessionEvent(`Session ended at ${new Date().toLocaleString()}`);

    if (isConnected) {
      try {
        const response = await sendArduinoCommand('/endSession');
        if (response.ok) {
          const logData = await response.text();
          console.log('Session ended. Final log:', logData);
          addSessionEvent('Session data saved to device');
        }
      } catch (error) {
        console.log('Session ended offline');
        addSessionEvent('Session ended offline - data saved locally');
      }
    }

    setTimeout(() => {
      setDeviceState(prev => ({ 
        ...prev, 
        sessionActive: false,
        direction: 'None',
        speed: 0,
        // Keep brake position as is when ending session
      }));
    }, 100);
  }, [isConnected, sendArduinoCommand, addSessionEvent]);

  const resetDevice = useCallback(async () => {
    // Store current brake position before reset
    const currentBrake = deviceState.brake;
    setPreviousBrakePosition(currentBrake);

    if (deviceState.sessionActive) {
      addSessionEvent(`Device reset initiated - preserving brake position: ${currentBrake}`);
      await endSession();
    }

    // Reset state but preserve brake position
    setDeviceState(prev => ({
      direction: 'None',
      brake: currentBrake, // Preserve brake position during reset
      speed: 0,
      sessionActive: false,
    }));

    if (isConnected) {
      try {
        await sendArduinoCommand('/reset', 10000); // Longer timeout for reset
        
        // After reset, restore the brake position
        setTimeout(async () => {
          let reconnectAttempts = 0;
          const maxAttempts = 10; // More attempts for reset recovery
          
          const attemptReconnectAndRestore = async () => {
            try {
              const response = await sendArduinoCommand('/ping', 3000);
              if (response.ok) {
                setIsConnected(true);
                
                // Restore brake position after successful reconnection
                if (currentBrake !== 'None') {
                  try {
                    const action = currentBrake.toLowerCase();
                    await sendArduinoCommand(`/brake?action=${action}&state=on`, 5000);
                    addSessionEvent(`Device reset completed - brake position restored to: ${currentBrake}`);
                  } catch (brakeError) {
                    addSessionEvent(`Device reset completed - failed to restore brake position: ${currentBrake}`);
                  }
                } else {
                  addSessionEvent('Device reset completed - reconnected');
                }
                return;
              }
            } catch (error) {
              // Continue trying
            }
            
            reconnectAttempts++;
            if (reconnectAttempts < maxAttempts) {
              setTimeout(attemptReconnectAndRestore, 4000); // Longer delay between attempts
            } else {
              addSessionEvent(`Device reset completed - manual reconnection required. Brake position preserved locally: ${currentBrake}`);
            }
          };
          
          attemptReconnectAndRestore();
        }, 8000); // Longer initial delay for reset
        
      } catch (error) {
        console.log('Reset command failed, device may have restarted');
        addSessionEvent(`Reset command sent - device restarting. Brake position preserved: ${currentBrake}`);
        setIsConnected(false);
      }
    } else {
      addSessionEvent(`Device reset (offline mode) - brake position preserved: ${currentBrake}`);
    }

    setSessionData({
      startTime: '',
      duration: '',
      events: [],
    });
  }, [deviceState, isConnected, sendArduinoCommand, addSessionEvent, endSession]);

  const emergencyStop = useCallback(async () => {
    // Store current brake position before emergency stop
    const currentBrake = deviceState.brake;
    setPreviousBrakePosition(currentBrake);

    if (deviceState.sessionActive) {
      addSessionEvent(`EMERGENCY STOP ACTIVATED - preserving brake position: ${currentBrake}`);
    }

    // Emergency stop: set speed to 0, direction to None, but preserve brake position
    const emergencyState = {
      speed: 0,
      direction: 'None',
      // Keep current brake position instead of forcing pull
      brake: currentBrake,
    };

    setDeviceState(prev => ({ ...prev, ...emergencyState }));

    if (isConnected) {
      try {
        await sendArduinoCommand('/speed?value=0', 2000);
        await sendArduinoCommand('/direction?state=none', 2000);
        // Don't change brake position during emergency stop
        
        addSessionEvent(`Emergency stop commands sent to device - brake position maintained: ${currentBrake}`);
      } catch (error) {
        addSessionEvent(`Emergency stop - device communication failed, local stop applied. Brake position preserved: ${currentBrake}`);
      }
    } else {
      addSessionEvent(`Emergency stop applied (offline mode) - brake position preserved: ${currentBrake}`);
    }
  }, [deviceState, isConnected, sendArduinoCommand, addSessionEvent]);

  const releaseBrake = useCallback(async () => {
    await updateDeviceState({ brake: 'None' });
    if (deviceState.sessionActive) {
      addSessionEvent('Brake released');
    }
  }, [updateDeviceState, deviceState.sessionActive, addSessionEvent]);

  const calculateDuration = useCallback((startTime: string): string => {
    if (!startTime) return '00:00:00';
    
    const start = new Date(startTime);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  return {
    deviceState,
    isConnected,
    sessionData,
    connectionAttempts,
    lastConnectionCheck,
    networkInfo,
    currentEndpoint,
    updateDeviceState,
    startSession,
    endSession,
    resetDevice,
    emergencyStop,
    releaseBrake,
    previousBrakePosition,
    checkConnection,
  };
}