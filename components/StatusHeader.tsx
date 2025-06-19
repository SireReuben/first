import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

export function StatusHeader() {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image 
          source={require('@/assets/images/Aerospin-1-300x200.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.title}>AEROSPIN</Text>
      <Text style={styles.subtitle}>GLOBAL CONTROL</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 16,
  },
  logoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 8,
    marginBottom: 12,
  },
  logo: {
    width: 60,
    height: 40,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#e0f2fe',
    letterSpacing: 1,
  },
});