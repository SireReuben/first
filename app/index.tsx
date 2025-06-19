import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { WifiStatus } from '@/components/WifiStatus';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useDeviceState } from '@/hooks/useDeviceState';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [logoAnim] = useState(new Animated.Value(0));
  const { isConnected } = useDeviceState();
  const [showManualConnect, setShowManualConnect] = useState(false);

  useEffect(() => {
    // Start welcome animation sequence
    Animated.sequence([
      // First animate the logo
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      // Then animate the rest of the content
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ])
    ]).start();

    // Show manual connect option after 5 seconds if not connected
    const timer = setTimeout(() => {
      if (!isConnected) {
        setShowManualConnect(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [isConnected]);

  // Auto-navigate when connected
  useEffect(() => {
    if (isConnected) {
      const timer = setTimeout(() => {
        router.replace('/(tabs)/sessions');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isConnected]);

  const handleManualConnect = () => {
    router.replace('/(tabs)/sessions');
  };

  return (
    <LinearGradient
      colors={['#1e3a8a', '#3b82f6', '#60a5fa']}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.header}>
          <Animated.View 
            style={[
              styles.logoContainer,
              {
                opacity: logoAnim,
                transform: [{
                  scale: logoAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                  })
                }]
              }
            ]}
          >
            <Image 
              source={require('@/assets/images/Aerospin-1-300x200.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>
          
          <Text style={styles.title}>Welcome to</Text>
          <Text style={styles.brand}>AEROSPIN</Text>
          <Text style={styles.subtitle}>CONTROL SYSTEM</Text>
        </View>

        <View style={styles.middle}>
          <WifiStatus isConnected={isConnected} />
          
          {!isConnected && !showManualConnect && (
            <LoadingSpinner isVisible={true} />
          )}
          
          {isConnected && (
            <Animated.View style={styles.successMessage}>
              <Text style={styles.successText}>Connected Successfully!</Text>
              <Text style={styles.loadingText}>Loading Session Manager...</Text>
            </Animated.View>
          )}

          {!isConnected && showManualConnect && (
            <View style={styles.manualConnectContainer}>
              <Text style={styles.manualConnectText}>
                Unable to auto-connect to device
              </Text>
              <Text style={styles.manualConnectSubtext}>
                Make sure you're connected to "AEROSPIN CONTROL" WiFi network
              </Text>
              <TouchableOpacity 
                style={styles.manualConnectButton}
                onPress={handleManualConnect}
              >
                <Text style={styles.manualConnectButtonText}>
                  Continue Anyway
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.tagline}>
            REVOLUTIONIZING CONNECTIVITY,
          </Text>
          <Text style={styles.tagline}>
            ONE FIBER AT A TIME.
          </Text>
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
    width: '100%',
  },
  header: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logo: {
    width: 120,
    height: 80,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Regular',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  brand: {
    fontSize: 42,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 3,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#e0f2fe',
    textAlign: 'center',
    letterSpacing: 1,
  },
  middle: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  successMessage: {
    alignItems: 'center',
    marginTop: 24,
  },
  successText: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
    marginBottom: 8,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#e0f2fe',
  },
  manualConnectContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  manualConnectText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  manualConnectSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#e0f2fe',
    textAlign: 'center',
    marginBottom: 24,
  },
  manualConnectButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  manualConnectButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
  },
  footer: {
    alignItems: 'center',
  },
  tagline: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#e0f2fe',
    textAlign: 'center',
    letterSpacing: 1,
  },
});