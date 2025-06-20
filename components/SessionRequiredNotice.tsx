import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Play, Lock } from 'lucide-react-native';
import { router } from 'expo-router';

export function SessionRequiredNotice() {
  const handleGoToSessions = () => {
    router.push('/(tabs)/sessions');
  };

  const benefits = [
    'Ensures safe operation with proper initialization',
    'Logs all device operations for safety compliance',
    'Prevents accidental device activation',
    'Provides structured start/stop procedures'
  ];

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Lock size={48} color="#6b7280" />
      </View>
      
      <Text style={styles.title}>Session Required</Text>
      <Text style={styles.description}>
        Dashboard controls are only available during an active session. 
        Start a session to access device controls and monitoring.
      </Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={handleGoToSessions}
      >
        <Play size={20} color="#ffffff" />
        <Text style={styles.buttonText}>Go to Session Manager</Text>
      </TouchableOpacity>
      
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Why Sessions?</Text>
        <View style={styles.benefitsList}>
          {benefits.map((benefit, index) => (
            <Text key={index} style={styles.infoText}>
              • {benefit}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 4,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22c55e',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 24,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
    marginLeft: 8,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  infoBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#374151',
    marginBottom: 8,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  benefitsList: {
    gap: 4,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    lineHeight: 20,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});