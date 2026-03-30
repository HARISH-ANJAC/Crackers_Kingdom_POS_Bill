import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StatusBar,
  Animated,
  Platform,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { COLORS } from '../Constants/Colors';
import { useAppSelector, useAppDispatch } from '../redux/Store';
import { loadUserPermissions } from '../redux/Slice/AuthSlice';
import { inlineStyles } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Alert as RNAlert } from 'react-native';

const SplashScreen = ({ navigation }: { navigation?: any }) => {
  const { width } = useWindowDimensions();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const startTime = useRef(Date.now());
  const insets = useSafeAreaInsets();
  const { isAuthenticated, user, isLoading: authLoading } = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Tracking if navigation has been triggered to avoid multiple replaces
  const navigationTriggered = useRef(false);

  useEffect(() => {
    // If auth state is still loading (including permissions load), wait
    if (authLoading || navigationTriggered.current) return;

    const splashDuration = 2500; // Sightly longer for first-time permission flow
    const mountTime = startTime.current;

    const handleNavigation = async () => {

      // Calculate remaining time for splash
      const elapsedTime = Date.now() - mountTime;
      const remainingTime = Math.max(0, splashDuration - elapsedTime);

      // Prevent multiple calls
      navigationTriggered.current = true;

      // Small delay for the splash animation to feel consistent
      setTimeout(() => {
        if (isAuthenticated && user?.roleId) {
          console.log('🚀 Splash: Navigating to home');
          navigation?.replace('home');
        } else {
          console.log('🚀 Splash: Navigating to login');
          navigation?.replace('login');
        }
      }, remainingTime);
    };

    handleNavigation();
  }, [isAuthenticated, user, authLoading, navigation]);

  const isWeb = Platform.OS === "web" && width >= 980;

  return (
    <View className="flex-1 bg-primary items-center justify-center">
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
          alignItems: 'center'
        }}
      >
        <View className="bg-white/20 p-6 rounded-3xl mb-6 backdrop-blur-lg">
          <Sparkles size={isWeb ? 80 : 64} color="white" strokeWidth={1.5} />
        </View>

        <Text className={`text-white font-black tracking-tight ${isWeb ? "text-5xl" : "text-4xl"}`}>
          Fireworks
        </Text>
        <Text className={`text-primary-light font-medium mt-2 tracking-widest uppercase ${isWeb ? "text-lg" : "text-sm"}`}>
          Admin Portal
        </Text>

        {/* Show loading indicator if it's taking longer than expected */}
        {authLoading && (
          <View className="mt-8 flex-row items-center gap-2">
            <ActivityIndicator size="small" color="white" />
            <Text className="text-white/80 text-xs font-medium uppercase tracking-widest">
              Initializing...
            </Text>
          </View>
        )}
      </Animated.View>

      <View className="absolute bottom-10" style={{ padding: insets.bottom }}>
        <Text className="text-white/60 text-xs">Version 1.0.0</Text>
      </View>
    </View>
  );
};

export default SplashScreen;
