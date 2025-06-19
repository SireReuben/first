import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, Circle as XCircle, Info } from 'lucide-react-native';

interface Alert {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  timestamp: string;
}

interface AlertsListProps {
  alerts: Alert[];
}

export function AlertsList({ alerts }: AlertsListProps) {
  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} color="#22c55e" />;
      case 'warning':
        return <AlertTriangle size={20} color="#f59e0b" />;
      case 'error':
        return <XCircle size={20} color="#ef4444" />;
      default:
        return <Info size={20} color="#3b82f6" />;
    }
  };

  const getAlertColor = (type: Alert['type']) => {
    switch (type) {
      case 'success':
        return '#f0fdf4';
      case 'warning':
        return '#fffbeb';
      case 'error':
        return '#fef2f2';
      default:
        return '#eff6ff';
    }
  };

  if (alerts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No alerts at this time</Text>
        <Text style={styles.emptySubtext}>System is operating normally</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {alerts.map((alert) => (
        <View
          key={alert.id}
          style={[
            styles.alertItem,
            { backgroundColor: getAlertColor(alert.type) }
          ]}
        >
          <View style={styles.alertHeader}>
            {getAlertIcon(alert.type)}
            <Text style={styles.alertMessage}>{alert.message}</Text>
          </View>
          <Text style={styles.alertTimestamp}>{alert.timestamp}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: 400,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
  alertItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  alertMessage: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginLeft: 12,
    flex: 1,
  },
  alertTimestamp: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    textAlign: 'right',
  },
});