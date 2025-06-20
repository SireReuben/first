import { useState, useEffect } from 'react';
import { Platform } from 'react-native';

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

// Use proxy for web, direct IP for native platforms
const ARDUINO_BASE_URL = Platform.OS === 'web' ? '/api' : 'http://192.168.4.1';

export function useDeviceState() {
  const [deviceState, setDeviceState] = useState<DeviceState>({
    direction: 'None',
    brake: 'None',
    speed: 0,
    sessionActive: false,
  });

  const [isConnected, setIsConnected] = useState(false);
  const [sessionData, setSessionData] = useState<SessionData>({
    startTime: '',
    duration: '',
    events: [],
  });

  // Check connection status with offline-first approach and better error handling
  useEffect(() => {
    let connectionCheckInterval: NodeJS.Timeout;
    let isComponentMounted = true;

    const checkConnection = async () => {
      // Don't run connection checks if component is unmounted
      if (!isComponentMounted) return;

      try {
        // Create AbortController for manual timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); // Shorter timeout for mobile
        
        const response = await fetch(`${ARDUINO_BASE_URL}/ping`, {
          method: 'GET',
          signal: controller.signal,
        });
        
        // Clear timeout if request completes successfully
        clearTimeout(timeoutId);
        
        if (response.ok && isComponentMounted) {
          setIsConnected(true);
          // Fetch current device status
          await fetchDeviceStatus();
        } else if (isComponentMounted) {
          setIsConnected(false);
        }
      } catch (error) {
        // Don't log connection errors in offline mode - this is expected
        if (isComponentMounted) {
          setIsConnected(false);
        }
      }
    };

    const fetchDeviceStatus = async () => {
      if (!isComponentMounted) return;

      try {
        // Create AbortController for manual timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        const response = await fetch(`${ARDUINO_BASE_URL}/status`, {
          signal: controller.signal,
        });
        
        // Clear timeout if request completes successfully
        clearTimeout(timeoutId);
        
        if (response.ok && isComponentMounted) {
          const statusText = await response.text();
          parseDeviceStatus(statusText);
        }
      } catch (error) {
        // Silent fail for offline operation
      }
    };

    // Initial connection check with delay to prevent blocking app startup
    const initialCheck = setTimeout(() => {
      if (isComponentMounted) {
        checkConnection();
      }
    }, 3000); // Increased delay for mobile

    // Set up periodic connection monitoring with longer intervals for mobile
    const startPeriodicChecks = setTimeout(() => {
      if (isComponentMounted) {
        connectionCheckInterval = setInterval(checkConnection, 20000); // Check every 20 seconds
      }
    }, 8000);

    return () => {
      isComponentMounted = false;
      clearTimeout(initialCheck);
      clearTimeout(startPeriodicChecks);
      if (connectionCheckInterval) {
        clearInterval(connectionCheckInterval);
      }
    };
  }, []);

  // Update session data when session is active
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

    // Update duration every second
    durationInterval = setInterval(updateSessionData, 1000);

    // Fetch session log if connected
    if (isConnected) {
      const fetchSessionLog = async () => {
        if (!isComponentMounted) return;

        try {
          // Create AbortController for manual timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000);
          
          const response = await fetch(`${ARDUINO_BASE_URL}/getSessionLog`, {
            signal: controller.signal,
          });
          
          // Clear timeout if request completes successfully
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
          // Silent fail for offline operation
        }
      };

      sessionInterval = setInterval(fetchSessionLog, 15000); // Less frequent updates for mobile
    }

    return () => {
      isComponentMounted = false;
      if (durationInterval) clearInterval(durationInterval);
      if (sessionInterval) clearInterval(sessionInterval);
    };
  }, [deviceState.sessionActive, isConnected]);

  const parseDeviceStatus = (statusText: string) => {
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
  };

  const addSessionEvent = (event: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const eventWithTime = `${timestamp}: ${event}`;
    
    setSessionData(prev => ({
      ...prev,
      events: [...prev.events, eventWithTime],
    }));
  };

  const updateDeviceState = async (updates: Partial<DeviceState>) => {
    // Always update local state first for immediate UI feedback
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
      return; // In offline mode, only update local state
    }

    try {
      // Send updates to Arduino with proper error handling
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
      // In case of network error, state is already updated locally
      console.log('Device update failed, continuing in offline mode');
      addSessionEvent('Device communication lost - operating offline');
    }
  };

  const sendArduinoCommand = async (endpoint: string, timeout: number = 3000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(`${ARDUINO_BASE_URL}${endpoint}`, {
        method: 'GET',
        signal: controller.signal,
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
  };

  const startSession = async () => {
    const sessionStartTime = new Date().toLocaleString();
    
    // Always update local state first for immediate UI feedback
    setDeviceState(prev => ({ ...prev, sessionActive: true }));
    setSessionData({
      startTime: sessionStartTime,
      duration: '00:00:00',
      events: [`Session started at ${sessionStartTime}`],
    });

    if (!isConnected) {
      // In offline mode, create a local session
      addSessionEvent('Operating in offline mode');
      return;
    }

    try {
      await sendArduinoCommand('/startSession');
      addSessionEvent('Connected to device successfully');
    } catch (error) {
      // Session continues in offline mode
      addSessionEvent('Device connection lost - continuing offline');
    }
  };

  const endSession = async () => {
    // Add final session event
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

    // Reset local state after a brief delay to allow final event to be added
    setTimeout(() => {
      setDeviceState(prev => ({ 
        ...prev, 
        sessionActive: false,
        direction: 'None',
        brake: 'None',
        speed: 0,
      }));
    }, 100);
  };

  const resetDevice = async () => {
    // Add reset event if session is active
    if (deviceState.sessionActive) {
      addSessionEvent('Emergency reset initiated');
      
      // End session first
      await endSession();
    }

    // Reset local state immediately for safety
    setDeviceState({
      direction: 'None',
      brake: 'None',
      speed: 0,
      sessionActive: false,
    });

    if (isConnected) {
      try {
        // Send reset command to Arduino with longer timeout for restart
        await sendArduinoCommand('/reset', 8000);
        
        // Wait for device to restart and reconnect
        setTimeout(async () => {
          // Try to reconnect after reset
          let reconnectAttempts = 0;
          const maxAttempts = 8;
          
          const attemptReconnect = async () => {
            try {
              const response = await sendArduinoCommand('/ping', 2000);
              if (response.ok) {
                setIsConnected(true);
                addSessionEvent('Device reset completed - reconnected');
                return;
              }
            } catch (error) {
              // Continue trying
            }
            
            reconnectAttempts++;
            if (reconnectAttempts < maxAttempts) {
              setTimeout(attemptReconnect, 3000); // Try again in 3 seconds
            } else {
              addSessionEvent('Device reset completed - manual reconnection required');
            }
          };
          
          attemptReconnect();
        }, 5000); // Wait 5 seconds for Arduino to restart
        
      } catch (error) {
        console.log('Reset command failed, device may have restarted');
        addSessionEvent('Reset command sent - device restarting');
        
        // Mark as disconnected since device is restarting
        setIsConnected(false);
      }
    } else {
      addSessionEvent('Device reset (offline mode)');
    }

    // Clear session data
    setSessionData({
      startTime: '',
      duration: '',
      events: [],
    });
  };

  const emergencyStop = async () => {
    // Log emergency stop
    if (deviceState.sessionActive) {
      addSessionEvent('EMERGENCY STOP ACTIVATED');
    }

    // Immediately stop all operations locally
    const emergencyState = {
      speed: 0,
      direction: 'None',
      brake: 'Pull', // Apply pull brake for safety
    };

    setDeviceState(prev => ({ ...prev, ...emergencyState }));

    if (isConnected) {
      try {
        // Send emergency commands in sequence with short timeouts for immediate response
        await sendArduinoCommand('/speed?value=0', 1500);
        await sendArduinoCommand('/direction?state=none', 1500);
        await sendArduinoCommand('/brake?action=pull&state=on', 1500);
        
        addSessionEvent('Emergency stop commands sent to device');
      } catch (error) {
        addSessionEvent('Emergency stop - device communication failed, local stop applied');
      }
    } else {
      addSessionEvent('Emergency stop applied (offline mode)');
    }
  };

  const calculateDuration = (startTime: string): string => {
    if (!startTime) return '00:00:00';
    
    const start = new Date(startTime);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    deviceState,
    isConnected,
    sessionData,
    updateDeviceState,
    startSession,
    endSession,
    resetDevice,
    emergencyStop,
  };
}