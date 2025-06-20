import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity, Image, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { WifiStatus } from '@/components/WifiStatus';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';
import { useDeviceState } from '@/hooks/useDeviceState';
import { useDeviceOrientation } from '@/hooks/useDeviceOrientation';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [logoAnim] = useState(new Animated.Value(0));
  const { isConnected } = useDeviceState();
  const [showManualConnect, setShowManualConnect] = useState(false);
  const { isTablet, isLandscape, screenType } = useDeviceOrientation();

  useEffect(() => {
    // Start welcome animation sequence immediately
    Animated.sequence([
      // First animate the logo
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      // Then animate the rest of the content
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
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

    // Show manual connect option after appropriate time based on platform
    const delay = Platform.OS === 'web' ? 5000 : 8000;
    const timer = setTimeout(() => {
      if (!isConnected) {
        setShowManualConnect(true);
      }
    }, delay);

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

  const getLayoutStyle = () => {
    if (isTablet && isLandscape && screenType !== 'phone') {
      return styles.tabletLandscapeLayout;
    }
    return null;
  };

  return (
    <LinearGradient
      colors={['#1e3a8a', '#3b82f6', '#60a5fa']}
      style={styles.container}
    >
      <ResponsiveContainer style={styles.responsiveContainer}>
        <Animated.View
          style={[
            styles.content,
            getLayoutStyle(),
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={[
            styles.header,
            isTablet && isLandscape && styles.tabletLandscapeHeader
          ]}>
            <Animated.View 
              style={[
                styles.logoContainer,
                isTablet && styles.tabletLogoContainer,
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
                style={[
                  styles.logo,
                  isTablet && styles.tabletLogo
                ]}
                resizeMode="contain"
              />
            </Animated.View>
            
            <Text style={[
              styles.title,
              isTablet && styles.tabletTitle
            ]}>
              Welcome to
            </Text>
            <Text style={[
              styles.brand,
              isTablet && styles.tabletBrand
            ]}>
              AEROSPIN
            </Text>
            <Text style={[
              styles.subtitle,
              isTablet && styles.tabletSubtitle
            ]}>
              CONTROL SYSTEM
            </Text>
          </View>

          <View style={[
            styles.middle,
            isTablet && isLandscape && styles.tabletLandscapeMiddle
          ]}>
            <WifiStatus isConnected={isConnected} />
            
            {!isConnected && !showManualConnect && (
              <LoadingSpinner isVisible={true} />
            )}
            
            {isConnected && (
              <Animated.View style={styles.successMessage}>
                <Text style={[
                  styles.successText,
                  isTablet && styles.tabletSuccessText
                ]}>
                  Connected Successfully!
                </Text>
                <Text style={[
                  styles.loadingText,
                  isTablet && styles.tabletLoadingText
                ]}>
                  Loading Session Manager...
                </Text>
              </Animated.View>
            )}

            {!isConnected && showManualConnect && (
              <View style={styles.manualConnectContainer}>
                <Text style={[
                  styles.manualConnectText,
                  isTablet && styles.tabletManualConnectText
                ]}>
                  Unable to auto-connect to device
                </Text>
                <Text style={[
                  styles.manualConnectSubtext,
                  isTablet && styles.tabletManualConnectSubtext
                ]}>
                  {Platform.OS === 'web' 
                    ? 'Make sure you\'re connected to "AEROSPIN CONTROL" WiFi network'
                    : 'Ensure your device WiFi is connected to "AEROSPIN CONTROL" network'
                  }
                </Text>
                <TouchableOpacity 
                  style={[
                    styles.manualConnectButton,
                    isTablet && styles.tabletManualConnectButton
                  ]}
                  onPress={handleManualConnect}
                >
                  <Text style={[
                    styles.manualConnectButtonText,
                    isTablet && styles.tabletManualConnectButtonText
                  ]}>
                    Continue Anyway
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={[
            styles.footer,
            isTablet && isLandscape && styles.tabletLandscapeFooter
          ]}>
            <Text style={[
              styles.tagline,
              isTablet && styles.tabletTagline
            ]}>
              REVOLUTIONIZING CONNECTIVITY,
            </Text>
            <Text style={[
              styles.tagline,
              isTablet && styles.tabletTagline
            ]}>
              ONE FIBER AT A TIME.
            </Text>
          </View>
        </Animated.View>
      </ResponsiveContainer>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  responsiveContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
    width: '100%',
  },
  tabletLandscapeLayout: {
    flexDirection: 'row',
    paddingVertical: 40,
    paddingHorizontal: 48,
  },
  header: {
    alignItems: 'center',
  },
  tabletLandscapeHeader: {
    flex: 1,
    justifyContent: 'center',
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
  tabletLogoContainer: {
    marginBottom: 24,
    borderRadius: 24,
    padding: 20,
  },
  logo: {
    width: 120,
    height: 80,
  },
  tabletLogo: {
    width: 160,
    height: 107,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Regular',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  tabletTitle: {
    fontSize: 28,
    marginBottom: 12,
  },
  brand: {
    fontSize: 42,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 3,
    marginBottom: 4,
  },
  tabletBrand: {
    fontSize: 56,
    letterSpacing: 4,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#e0f2fe',
    textAlign: 'center',
    letterSpacing: 1,
  },
  tabletSubtitle: {
    fontSize: 22,
    letterSpacing: 1.5,
  },
  middle: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabletLandscapeMiddle: {
    flex: 1,
    marginHorizontal: 48,
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
  tabletSuccessText: {
    fontSize: 24,
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#e0f2fe',
  },
  tabletLoadingText: {
    fontSize: 18,
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
  tabletManualConnectText: {
    fontSize: 20,
    marginBottom: 12,
  },
  manualConnectSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#e0f2fe',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  tabletManualConnectSubtext: {
    fontSize: 18,
    marginBottom: 32,
    paddingHorizontal: 40,
  },
  manualConnectButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  tabletManualConnectButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
  },
  manualConnectButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
  },
  tabletManualConnectButtonText: {
    fontSize: 20,
  },
  footer: {
    alignItems: 'center',
  },
  tabletLandscapeFooter: {
    flex: 0.5,
    justifyContent: 'center',
  },
  tagline: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#e0f2fe',
    textAlign: 'center',
    letterSpacing: 1,
  },
  tabletTagline: {
    fontSize: 18,
    letterSpacing: 1.5,
  },
});