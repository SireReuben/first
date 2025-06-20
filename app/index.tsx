import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity, Image, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { WifiStatus } from '@/components/WifiStatus';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';
import { NetworkPermissionGuard } from '@/components/NetworkPermissionGuard';
import { useDeviceState } from '@/hooks/useDeviceState';
import { useDeviceOrientation } from '@/hooks/useDeviceOrientation';
import { useNetworkPermissions } from '@/hooks/useNetworkPermissions';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [logoAnim] = useState(new Animated.Value(0));
  const { isConnected, connectionAttempts } = useDeviceState();
  const { hasLocationPermission, hasNetworkAccess } = useNetworkPermissions();
  const [showManualConnect, setShowManualConnect] = useState(false);
  const [hasTriedConnection, setHasTriedConnection] = useState(false);
  const { isTablet, isLandscape, screenType } = useDeviceOrientation();

  const canProceed = Platform.OS === 'web' || (hasLocationPermission && hasNetworkAccess);

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
  }, []);

  // Show manual connect option based on connection attempts and platform
  useEffect(() => {
    if (!canProceed) return;

    let timer: NodeJS.Timeout;

    if (Platform.OS === 'web') {
      // For web, show manual connect after 5 seconds
      timer = setTimeout(() => {
        if (!isConnected) {
          setShowManualConnect(true);
          setHasTriedConnection(true);
        }
      }, 5000);
    } else {
      // For mobile, show manual connect after connection attempts or timeout
      if (connectionAttempts >= 2 || hasTriedConnection) {
        setShowManualConnect(true);
      } else {
        timer = setTimeout(() => {
          setHasTriedConnection(true);
          if (!isConnected) {
            setShowManualConnect(true);
          }
        }, 10000); // Longer timeout for mobile
      }
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isConnected, canProceed, connectionAttempts, hasTriedConnection]);

  // Auto-navigate when connected
  useEffect(() => {
    if (isConnected && canProceed) {
      const timer = setTimeout(() => {
        try {
          router.replace('/(tabs)/sessions');
        } catch (error) {
          console.error('Navigation error:', error);
          // Fallback navigation
          setShowManualConnect(true);
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isConnected, canProceed]);

  const handleManualConnect = () => {
    if (!canProceed) {
      return;
    }
    
    try {
      router.replace('/(tabs)/sessions');
    } catch (error) {
      console.error('Manual navigation error:', error);
      // If navigation fails, try again with push
      try {
        router.push('/(tabs)/sessions');
      } catch (pushError) {
        console.error('Push navigation also failed:', pushError);
      }
    }
  };

  const getLayoutStyle = () => {
    if (isTablet && isLandscape && screenType !== 'phone') {
      return styles.tabletLandscapeLayout;
    }
    return null;
  };

  const getConnectionMessage = () => {
    if (Platform.OS === 'web') {
      return 'Make sure you\'re connected to "AEROSPIN CONTROL" WiFi network';
    }
    
    if (!hasLocationPermission) {
      return 'Location permission required to scan for Wi-Fi networks';
    }
    
    if (!hasNetworkAccess) {
      return 'Please connect to "AEROSPIN CONTROL" WiFi network';
    }
    
    if (connectionAttempts > 0) {
      return `Connection attempts: ${connectionAttempts}. Ensure device is powered on and WiFi is connected to "AEROSPIN CONTROL"`;
    }
    
    return 'Ensure your device WiFi is connected to "AEROSPIN CONTROL" network';
  };

  const getStatusMessage = () => {
    if (!canProceed) {
      return 'Setting up permissions...';
    }
    
    if (isConnected) {
      return 'Connected Successfully!';
    }
    
    if (hasTriedConnection || connectionAttempts > 0) {
      return 'Unable to auto-connect to device';
    }
    
    return 'Searching for AEROSPIN device...';
  };

  return (
    <NetworkPermissionGuard>
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
              
              {/* Connection Status */}
              <View style={styles.statusContainer}>
                <Text style={[
                  styles.statusText,
                  isTablet && styles.tabletStatusText
                ]}>
                  {getStatusMessage()}
                </Text>
                
                {/* Show loading spinner while trying to connect */}
                {!isConnected && !showManualConnect && canProceed && (
                  <LoadingSpinner isVisible={true} />
                )}
                
                {/* Show connection details */}
                {(connectionAttempts > 0 || !canProceed) && (
                  <Text style={[
                    styles.detailText,
                    isTablet && styles.tabletDetailText
                  ]}>
                    {getConnectionMessage()}
                  </Text>
                )}
              </View>
              
              {/* Success message when connected */}
              {isConnected && (
                <Animated.View style={styles.successMessage}>
                  <Text style={[
                    styles.successText,
                    isTablet && styles.tabletSuccessText
                  ]}>
                    Device Ready!
                  </Text>
                  <Text style={[
                    styles.loadingText,
                    isTablet && styles.tabletLoadingText
                  ]}>
                    Loading Session Manager...
                  </Text>
                </Animated.View>
              )}

              {/* Manual connect option */}
              {!isConnected && showManualConnect && canProceed && (
                <View style={styles.manualConnectContainer}>
                  <Text style={[
                    styles.manualConnectText,
                    isTablet && styles.tabletManualConnectText
                  ]}>
                    Continue without device connection
                  </Text>
                  <Text style={[
                    styles.manualConnectSubtext,
                    isTablet && styles.tabletManualConnectSubtext
                  ]}>
                    You can start a session and connect to the device later. 
                    The app will work in offline mode until a connection is established.
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
    </NetworkPermissionGuard>
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
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
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
  statusContainer: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  tabletStatusText: {
    fontSize: 20,
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#e0f2fe',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  tabletDetailText: {
    fontSize: 16,
    paddingHorizontal: 40,
    lineHeight: 24,
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
    paddingHorizontal: 20,
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
    lineHeight: 20,
  },
  tabletManualConnectSubtext: {
    fontSize: 16,
    marginBottom: 32,
    lineHeight: 24,
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