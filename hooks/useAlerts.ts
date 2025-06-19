import { useState, useEffect } from 'react';

interface Alert {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  timestamp: string;
}

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'success',
      message: 'Device connected successfully',
      timestamp: new Date().toLocaleString(),
    },
    {
      id: '2',
      type: 'info',
      message: 'System initialization complete',
      timestamp: new Date(Date.now() - 60000).toLocaleString(),
    },
    {
      id: '3',
      type: 'warning',
      message: 'WiFi signal strength is moderate',
      timestamp: new Date(Date.now() - 120000).toLocaleString(),
    },
  ]);

  const addAlert = (type: Alert['type'], message: string) => {
    const newAlert: Alert = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date().toLocaleString(),
    };

    setAlerts(prev => [newAlert, ...prev].slice(0, 50)); // Keep only latest 50 alerts
  };

  useEffect(() => {
    // Simulate periodic system alerts
    const interval = setInterval(() => {
      const messages = [
        { type: 'info' as const, message: 'System health check completed' },
        { type: 'success' as const, message: 'Data sync successful' },
        { type: 'warning' as const, message: 'High motor temperature detected' },
      ];

      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      if (Math.random() > 0.7) { // 30% chance to add an alert
        addAlert(randomMessage.type, randomMessage.message);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return { alerts, addAlert };
}