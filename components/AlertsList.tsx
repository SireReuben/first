import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert as RNAlert } from 'react-native';
import { CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, Circle as XCircle, Info, Trash2, Eye, EyeOff } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

interface Alert {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  source: 'local' | 'device';
}

interface AlertsListProps {
  alerts: Alert[];
  onMarkAsRead: (alertId: string) => void;
  onDeleteAlert: (alertId: string) => void;
  onClearAll: () => void;
  onMarkAllAsRead: () => void;
}

export function AlertsList({ 
  alerts, 
  onMarkAsRead, 
  onDeleteAlert, 
  onClearAll, 
  onMarkAllAsRead 
}: AlertsListProps) {
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
        return { bg: '#f0fdf4', border: '#22c55e' };
      case 'warning':
        return { bg: '#fffbeb', border: '#f59e0b' };
      case 'error':
        return { bg: '#fef2f2', border: '#ef4444' };
      default:
        return { bg: '#eff6ff', border: '#3b82f6' };
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleDeleteAlert = (alertId: string, alertTitle: string) => {
    RNAlert.alert(
      'Delete Alert',
      `Are you sure you want to delete "${alertTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => onDeleteAlert(alertId)
        },
      ]
    );
  };

  const handleClearAll = () => {
    if (alerts.length === 0) return;
    
    RNAlert.alert(
      'Clear All Alerts',
      `Are you sure you want to delete all ${alerts.length} alerts? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: onClearAll
        },
      ]
    );
  };

  const unreadCount = alerts.filter(alert => !alert.read).length;

  if (alerts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Info size={48} color="#9ca3af" />
        <Text style={styles.emptyText}>No alerts at this time</Text>
        <Text style={styles.emptySubtext}>System is operating normally</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Alert Actions Header */}
      <View style={styles.actionsHeader}>
        <View style={styles.alertCount}>
          <Text style={styles.alertCountText}>
            {alerts.length} alerts {unreadCount > 0 && `(${unreadCount} unread)`}
          </Text>
        </View>
        <View style={styles.actionButtons}>
          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onMarkAllAsRead}
            >
              <Eye size={16} color="#6b7280" />
              <Text style={styles.actionButtonText}>Mark All Read</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleClearAll}
          >
            <Trash2 size={16} color="#ef4444" />
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Clear All</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Alerts List */}
      <ScrollView 
        style={styles.alertsList} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.alertsContent}
      >
        {alerts.map((alert) => {
          const colors = getAlertColor(alert.type);
          const opacity = useSharedValue(1);
          
          const animatedStyle = useAnimatedStyle(() => ({
            opacity: opacity.value,
            transform: [{ scale: opacity.value }],
          }));

          return (
            <Animated.View
              key={alert.id}
              style={[
                styles.alertItem,
                {
                  backgroundColor: colors.bg,
                  borderLeftColor: colors.border,
                  opacity: alert.read ? 0.7 : 1,
                },
                animatedStyle,
              ]}
            >
              {/* Unread Indicator */}
              {!alert.read && <View style={styles.unreadIndicator} />}
              
              {/* Alert Content */}
              <TouchableOpacity
                style={styles.alertContent}
                onPress={() => onMarkAsRead(alert.id)}
                activeOpacity={0.7}
              >
                <View style={styles.alertHeader}>
                  <View style={styles.alertIconTitle}>
                    {getAlertIcon(alert.type)}
                    <View style={styles.alertTitleContainer}>
                      <Text style={[
                        styles.alertTitle,
                        !alert.read && styles.unreadTitle
                      ]}>
                        {alert.title}
                      </Text>
                      <View style={styles.alertMeta}>
                        <Text style={styles.alertSource}>
                          {alert.source === 'device' ? '🔧 Device' : '📱 App'}
                        </Text>
                        <Text style={styles.alertTimestamp}>
                          {formatTimestamp(alert.timestamp)}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  {/* Alert Actions */}
                  <View style={styles.alertActions}>
                    <TouchableOpacity
                      style={styles.alertActionButton}
                      onPress={() => onMarkAsRead(alert.id)}
                    >
                      {alert.read ? (
                        <EyeOff size={16} color="#6b7280" />
                      ) : (
                        <Eye size={16} color="#3b82f6" />
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.alertActionButton}
                      onPress={() => handleDeleteAlert(alert.id, alert.title)}
                    >
                      <Trash2 size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
                
                <Text style={styles.alertMessage}>{alert.message}</Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  actionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  alertCount: {
    flex: 1,
  },
  alertCountText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
  },
  actionButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6b7280',
    marginLeft: 4,
  },
  deleteButtonText: {
    color: '#ef4444',
  },
  alertsList: {
    flex: 1,
    maxHeight: 500,
  },
  alertsContent: {
    paddingBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 48,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
  alertItem: {
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  unreadIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
    zIndex: 1,
  },
  alertContent: {
    padding: 16,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  alertIconTitle: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  alertTitleContainer: {
    marginLeft: 12,
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginBottom: 4,
  },
  unreadTitle: {
    fontFamily: 'Inter-Bold',
    color: '#1f2937',
  },
  alertMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertSource: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6b7280',
  },
  alertTimestamp: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9ca3af',
  },
  alertActions: {
    flexDirection: 'row',
    gap: 8,
  },
  alertActionButton: {
    padding: 4,
  },
  alertMessage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#4b5563',
    lineHeight: 20,
  },
});