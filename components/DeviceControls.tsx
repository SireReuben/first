import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { ArrowUp, ArrowDown, Square, Play, Pause, TriangleAlert as AlertTriangle } from 'lucide-react-native';

interface DeviceState {
  direction: string;
  brake: string;
  speed: number;
  sessionActive: boolean;
}

interface DeviceControlsProps {
  deviceState: DeviceState;
  onUpdateState: (updates: Partial<DeviceState>) => void;
  onEmergencyStop: () => void;
  onReset: () => void;
  disabled: boolean;
}

export function DeviceControls({ deviceState, onUpdateState, onEmergencyStop, onReset, disabled }: DeviceControlsProps) {
  const handleDirectionChange = (direction: string) => {
    if (disabled) return;
    
    Alert.alert(
      'Confirm Direction Change',
      `Set motor direction to ${direction}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => onUpdateState({ direction }) 
        },
      ]
    );
  };

  const handleBrakeChange = (brake: string) => {
    if (disabled) return;
    
    const currentBrake = deviceState.brake;
    const newBrake = currentBrake === brake ? 'None' : brake;
    
    Alert.alert(
      'Confirm Brake Operation',
      `${newBrake === 'None' ? 'Release' : 'Apply'} ${brake.toLowerCase()} brake?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => onUpdateState({ brake: newBrake }) 
        },
      ]
    );
  };

  const handleSpeedChange = (speed: number) => {
    if (disabled) return;
    
    Alert.alert(
      'Confirm Speed Change',
      `Set motor speed to ${speed}%?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => onUpdateState({ speed }) 
        },
      ]
    );
  };

  const handleEmergencyStop = () => {
    Alert.alert(
      'EMERGENCY STOP',
      'This will immediately stop all motor operations, set speed to 0, and apply pull brake. This action cannot be undone. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'EMERGENCY STOP', 
          style: 'destructive',
          onPress: onEmergencyStop
        },
      ]
    );
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Device',
      'This will reset the Arduino device, restart all systems, and end the current session. The device will need to reconnect. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset Device', 
          style: 'destructive',
          onPress: onReset
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Device Controls</Text>
      
      {/* Emergency Controls */}
      <View style={styles.emergencySection}>
        <TouchableOpacity
          style={[styles.emergencyButton, disabled && styles.disabledButton]}
          onPress={handleEmergencyStop}
          disabled={disabled}
        >
          <Square size={24} color="#ffffff" />
          <Text style={styles.emergencyButtonText}>EMERGENCY STOP</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.resetButton, disabled && styles.disabledButton]}
          onPress={handleReset}
          disabled={disabled}
        >
          <AlertTriangle size={20} color="#ffffff" />
          <Text style={styles.resetButtonText}>RESET DEVICE</Text>
        </TouchableOpacity>
      </View>
      
      {/* Direction Controls */}
      <View style={styles.controlSection}>
        <Text style={styles.controlLabel}>Motor Direction</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.controlButton,
              styles.directionButton,
              deviceState.direction === 'Forward' && styles.activeButton,
              disabled && styles.disabledButton,
            ]}
            onPress={() => handleDirectionChange('Forward')}
            disabled={disabled}
          >
            <ArrowUp size={20} color="#ffffff" />
            <Text style={styles.buttonText}>Forward</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.controlButton,
              styles.directionButton,
              deviceState.direction === 'Reverse' && styles.activeButton,
              disabled && styles.disabledButton,
            ]}
            onPress={() => handleDirectionChange('Reverse')}
            disabled={disabled}
          >
            <ArrowDown size={20} color="#ffffff" />
            <Text style={styles.buttonText}>Reverse</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Brake Controls */}
      <View style={styles.controlSection}>
        <Text style={styles.controlLabel}>Brake Control</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.controlButton,
              styles.brakeButton,
              deviceState.brake === 'Pull' && styles.activeBrakeButton,
              disabled && styles.disabledButton,
            ]}
            onPress={() => handleBrakeChange('Pull')}
            disabled={disabled}
          >
            <Text style={styles.buttonText}>
              {deviceState.brake === 'Pull' ? 'Release Pull' : 'Pull Brake'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.controlButton,
              styles.brakeButton,
              deviceState.brake === 'Push' && styles.activeBrakeButton,
              disabled && styles.disabledButton,
            ]}
            onPress={() => handleBrakeChange('Push')}
            disabled={disabled}
          >
            <Text style={styles.buttonText}>
              {deviceState.brake === 'Push' ? 'Release Push' : 'Push Brake'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Speed Controls */}
      <View style={styles.controlSection}>
        <Text style={styles.controlLabel}>Motor Speed</Text>
        <View style={styles.speedContainer}>
          <View style={styles.speedBar}>
            <View 
              style={[
                styles.speedFill,
                { width: `${deviceState.speed}%` }
              ]} 
            />
          </View>
          <Text style={styles.speedText}>{deviceState.speed}%</Text>
        </View>
        
        <View style={styles.speedButtons}>
          {[0, 25, 50, 75, 100].map((speed) => (
            <TouchableOpacity
              key={speed}
              style={[
                styles.speedButton,
                deviceState.speed === speed && styles.activeSpeedButton,
                disabled && styles.disabledButton,
              ]}
              onPress={() => handleSpeedChange(speed)}
              disabled={disabled}
            >
              <Text style={[
                styles.speedButtonText,
                deviceState.speed === speed && styles.activeSpeedButtonText
              ]}>
                {speed}%
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {disabled && (
        <View style={styles.disabledNotice}>
          <Text style={styles.disabledNoticeText}>
            Controls disabled - Device not connected or session not active
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1e40af',
    marginBottom: 16,
    textAlign: 'center',
  },
  emergencySection: {
    marginBottom: 24,
    gap: 12,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc2626',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  emergencyButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginLeft: 8,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f59e0b',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resetButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginLeft: 8,
  },
  controlSection: {
    marginBottom: 24,
  },
  controlLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    minWidth: 120,
  },
  directionButton: {
    backgroundColor: '#22c55e',
  },
  brakeButton: {
    backgroundColor: '#06b6d4',
  },
  activeButton: {
    backgroundColor: '#ef4444',
  },
  activeBrakeButton: {
    backgroundColor: '#f59e0b',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
    marginLeft: 4,
  },
  speedContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  speedBar: {
    width: '100%',
    height: 20,
    backgroundColor: '#e5e7eb',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 8,
  },
  speedFill: {
    height: '100%',
    backgroundColor: '#ef4444',
    borderRadius: 10,
  },
  speedText: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#ef4444',
  },
  speedButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  speedButton: {
    backgroundColor: '#f59e0b',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  activeSpeedButton: {
    backgroundColor: '#1e40af',
  },
  speedButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
  },
  activeSpeedButtonText: {
    color: '#ffffff',
    fontFamily: 'Inter-Bold',
  },
  disabledNotice: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  disabledNoticeText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6b7280',
    textAlign: 'center',
  },
});