// src/screens/LoginScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  StatusBar,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions,
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';
import { Mail, Lock, Eye, EyeOff, LogIn, Phone, Loader } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppDispatch, useAppSelector } from '../redux/Store';
import { login, clearError, loadUserPermissions } from '../redux/Slice/AuthSlice';
import { formatIdentityDisplay, cleanIdentityInput } from '../utils/Formatter';
import { COLORS } from '../Constants/Colors';
import { useNavigation } from '@react-navigation/native';

const LoginScreen = () => {
  const dispatch = useAppDispatch();
  const { isLoading: authLoading, error: authError, isAuthenticated, user } = useAppSelector(
    (state) => state.auth
  );
  const { isLoading: permissionsLoading, menuItems } = useAppSelector((state) => state.permissions);
  const [identity, setIdentity] = useState('9876543210');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const navigation = useNavigation();

  // Platform and device detection
  const isAndroid = Platform.OS === 'android';
  const isIOS = Platform.OS === 'ios';
  const isWeb = Platform.OS === 'web';
  const isDesktopWeb = isWeb && width >= 1024;
  const isTabletWeb = isWeb && width >= 768 && width < 1024;
  const isMobileWeb = isWeb && width < 768;

  // Handle authentication state
  useEffect(() => {
    if (isAuthenticated && user && !permissionsLoaded) {
      // Show loading state
      setLocalError('');

      // Load permissions first, then navigate
      const loadPermissionsAndNavigate = async () => {
        try {
          if (user.roleId) {
            console.log('🔐 Starting permission load for role:', user.roleId);
            await dispatch(loadUserPermissions(user.roleId)).unwrap();
            setPermissionsLoaded(true);
            console.log('✅ Permissions loaded successfully, menu items:', menuItems.length);

            // Small delay to ensure state is updated
            setTimeout(() => {
              // Navigate to home after permissions are loaded
              navigation.navigate('home' as never);
            }, 100);
          } else {
            console.warn('⚠️ User has no roleId');
            navigation.navigate('home' as never);
          }
        } catch (error) {
          console.error('❌ Failed to load permissions:', error);
          // Still navigate even if permissions fail
          navigation.navigate('home' as never);
        }
      };

      loadPermissionsAndNavigate();
    }
  }, [isAuthenticated, user, dispatch, navigation, permissionsLoaded, menuItems.length]);

  // Reset permissions loaded state when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setPermissionsLoaded(false);
    }
  }, [isAuthenticated]);

  // Handle auth errors
  useEffect(() => {
    if (authError) {
      setLocalError(authError);
      dispatch(clearError());
    }
  }, [authError, dispatch]);

  // Load remembered identity on mount
  useEffect(() => {
    const loadRememberedIdentity = async () => {
      try {
        const savedIdentity = await AsyncStorage.getItem('rememberedIdentity');
        if (savedIdentity) {
          setIdentity(savedIdentity);
          setRememberMe(true);
        }
      } catch (error) {
        console.warn('⚠️ Login: Failed to load remembered identity');
      }
    };
    loadRememberedIdentity();
  }, []);

  const handleLogin = async () => {
    if (!identity || !password) {
      setLocalError('Please enter both email/phone and password');
      return;
    }

    setLocalError('');
    setPermissionsLoaded(false);

    // Handle "Remember Me" persistence
    try {
      if (rememberMe) {
        await AsyncStorage.setItem('rememberedIdentity', identity);
      } else {
        await AsyncStorage.removeItem('rememberedIdentity');
      }
    } catch (error) {
      console.warn('⚠️ Login: Failed to save identity preference');
    }

    dispatch(login({ identifier: identity, password }));
  };

  const isLoading = authLoading || permissionsLoading;

  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinValue.setValue(0);
    }
  }, [isLoading]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleIdentityChange = (text: string) => {
    setIdentity(cleanIdentityInput(text));
  };

  const IdentityIcon = identity.includes('@') ? Mail : Phone;

  const containerStyle = {
    height: isWeb ? ('100vh' as any) : '100%',
  };

  const getInputStyle = () => {
    if (isWeb) {
      return { outlineStyle: 'none' as any };
    }
    return {};
  };

  // Responsive sizing functions
  const getContainerWidth = () => {
    if (isDesktopWeb) return 'w-11/12 max-w-md';
    if (isTabletWeb) return 'w-10/12 max-w-lg';
    if (isMobileWeb) return 'w-[90%] max-w-sm';
    return 'w-11/12';
  };

  const getPadding = () => {
    if (isDesktopWeb) return 'px-8 py-8';
    if (isTabletWeb) return 'px-7 py-7';
    if (isMobileWeb) return 'px-5 py-6';
    return 'px-5 py-6';
  };

  const getTitleSize = () => {
    if (isDesktopWeb) return 'text-3xl';
    if (isTabletWeb) return 'text-2xl';
    if (isMobileWeb) return 'text-xl';
    return 'text-2xl';
  };

  const getSubtitleSize = () => {
    if (isDesktopWeb) return 'text-base';
    if (isTabletWeb) return 'text-sm';
    return 'text-xs';
  };

  const getInputHeight = () => {
    if (isDesktopWeb) return 'py-3.5';
    if (isTabletWeb) return 'py-3';
    if (isMobileWeb) return 'py-2.5';
    return 'py-2.5';
  };

  const getInputTextSize = () => {
    if (isDesktopWeb) return 'text-base';
    if (isTabletWeb) return 'text-sm';
    return 'text-sm';
  };

  const getButtonHeight = () => {
    if (isDesktopWeb) return 'h-12';
    if (isTabletWeb) return 'h-12';
    if (isMobileWeb) return 'h-14';
    return 'h-14';
  };

  const getButtonTextSize = () => {
    if (isDesktopWeb) return 'text-md';
    if (isTabletWeb) return 'text-sm';
    return 'text-base';
  };

  const getIconSize = () => {
    if (isDesktopWeb) return 22;
    if (isTabletWeb) return 20;
    return 18;
  };

  const getHeaderIconSize = () => {
    if (isDesktopWeb) return 32;
    if (isTabletWeb) return 28;
    return 24;
  };

  const getHeaderIconContainerSize = () => {
    if (isDesktopWeb) return 'w-16 h-16';
    if (isTabletWeb) return 'w-14 h-14';
    return 'w-12 h-12';
  };

  return (
    <View className="flex-1 bg-background-light" style={containerStyle}>
      <StatusBar
        barStyle={isAndroid ? "light-content" : "dark-content"}
        translucent
        backgroundColor="transparent"
      />
      <KeyboardAvoidingView
        behavior={isIOS ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={isIOS ? 0 : isAndroid ? -200 : 20}
      >
        <ScrollView
          className="flex-1"
          bounces={!isMobileWeb}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingVertical: isMobileWeb ? 20 : 0,
          }}
        >
          <View
            className="flex-1 items-center justify-center px-4"
            style={{
              paddingTop: Math.max(insets.top, isMobileWeb ? 20 : 30),
              paddingBottom: Math.max(insets.bottom, isMobileWeb ? 20 : 0),
            }}
          >
            <View
              className={`bg-white ${getContainerWidth()} ${getPadding()} 
                ${isDesktopWeb ? 'rounded-2xl' : 'rounded-xl'} 
                shadow-2xl elevation-10`}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: isMobileWeb ? 8 : 12 },
                shadowOpacity: isMobileWeb ? 0.08 : 0.1,
                shadowRadius: isMobileWeb ? 12 : 15,
                marginLeft: insets.left,
                marginRight: insets.right,
              }}
            >
              {/* Header */}
              <View className="items-center mb-6 md:mb-8">
                <View
                  className={`items-center justify-center rounded-2xl mb-4 md:mb-6 bg-primary/5 
                    ${getHeaderIconContainerSize()}`}
                >
                  <LogIn
                    size={getHeaderIconSize()}
                    color={COLORS.primary}
                    strokeWidth={2.2}
                  />
                </View>
                <Text className={`${getTitleSize()} font-black text-text-primary text-center leading-tight`}>
                  Admin Portal
                </Text>
                <Text className={`text-text-secondary mt-1 md:mt-2 text-center ${getSubtitleSize()} font-medium opacity-80 leading-5 md:leading-6 px-2`}>
                  Access the administrative control panel
                </Text>
              </View>

              {/* Form Areas */}
              <View className="space-y-4">
                {/* Identity Field */}
                <View>
                  <Text className="text-[10px] md:text-xs font-bold text-text-primary mb-1.5 ml-1 uppercase tracking-wider opacity-60">
                    Phone or Email
                  </Text>
                  <View
                    className={`flex-row items-center border ${isLoading ? 'border-gray-100 bg-gray-50/50' : 'border-gray-200'} 
                      ${isMobileWeb ? 'rounded-xl' : 'rounded-2xl'} 
                      focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all
                      ${getInputHeight()}`}
                    style={{
                      opacity: isLoading ? 0.7 : 1,
                      paddingHorizontal: isMobileWeb ? 12 : 16,
                    }}
                  >
                    <IdentityIcon
                      size={getIconSize()}
                      color={isLoading ? COLORS.text.secondary : COLORS.primary}
                      strokeWidth={1.8}
                      style={{ marginRight: isMobileWeb ? 8 : 12 }}
                    />
                    <TextInput
                      className={`flex-1 text-text-primary ${getInputTextSize()} 
                        ${isLoading ? 'text-text-secondary' : 'text-text-primary'}
                        ${isMobileWeb ? 'font-medium' : 'font-semibold'}`}
                      placeholder={isMobileWeb ? "Email or Phone" : "Enter Phone or Email"}
                      placeholderTextColor="#9CA3AF"
                      editable={!isLoading}
                      value={formatIdentityDisplay(identity)}
                      onChangeText={handleIdentityChange}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      style={getInputStyle()}
                    />
                  </View>
                </View>

                {/* Password Field */}
                <View className="mt-4">
                  <Text className="text-[10px] md:text-xs font-bold text-text-primary mb-1.5 ml-1 uppercase tracking-wider opacity-60">
                    Password
                  </Text>
                  <View
                    className={`flex-row items-center border ${isLoading ? 'border-gray-100 bg-gray-50/50' : 'border-gray-200'} 
                      ${isMobileWeb ? 'rounded-xl' : 'rounded-2xl'} 
                      focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all
                      ${getInputHeight()}`}
                    style={{
                      opacity: isLoading ? 0.7 : 1,
                      paddingHorizontal: isMobileWeb ? 12 : 16,
                    }}
                  >
                    <Lock
                      size={getIconSize()}
                      color={isLoading ? COLORS.text.secondary : COLORS.primary}
                      strokeWidth={1.8}
                      style={{ marginRight: isMobileWeb ? 8 : 12 }}
                    />
                    <TextInput
                      className={`flex-1 text-text-primary ${getInputTextSize()} 
                        ${isLoading ? 'text-text-secondary' : 'text-text-primary'}
                        ${isMobileWeb ? 'font-medium' : 'font-semibold'}`}
                      placeholder={isMobileWeb ? "Password" : "Enter Password"}
                      placeholderTextColor="#9CA3AF"
                      editable={!isLoading}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      style={getInputStyle()}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      className="pl-2"
                      disabled={isLoading}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      {showPassword ? (
                        <EyeOff size={getIconSize()} color={isLoading ? COLORS.text.secondary : COLORS.primary} />
                      ) : (
                        <Eye size={getIconSize()} color={isLoading ? COLORS.text.secondary : COLORS.primary} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Extras */}
                <View className="flex-row justify-between items-center mt-2">
                  <TouchableOpacity
                    className="flex-row items-center"
                    activeOpacity={0.7}
                    onPress={() => setRememberMe(!rememberMe)}
                    disabled={isLoading}
                    style={{ opacity: isLoading ? 0.6 : 1 }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <View
                      className={`${isMobileWeb ? 'w-4 h-4' : 'w-5 h-5'} rounded border items-center justify-center mr-2`}
                      style={{
                        borderColor: rememberMe ? (isLoading ? COLORS.text.secondary : COLORS.primary) : '#D1D5DB',
                        backgroundColor: rememberMe ? (isLoading ? COLORS.text.secondary : COLORS.primary) : 'white'
                      }}
                    >
                      {rememberMe && (
                        <Text className="text-white text-[10px] font-bold">✓</Text>
                      )}
                    </View>
                    <Text className={`text-text-secondary font-medium ${isMobileWeb ? 'text-xs' : 'text-sm'}`}>
                      Remember me
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    disabled={isLoading}
                    style={{ opacity: isLoading ? 0.6 : 1 }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text className={`font-bold ${isMobileWeb ? 'text-xs' : 'text-sm'} 
                      ${isLoading ? 'text-text-secondary' : 'text-primary'}`}>
                      Forgot Password?
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Error */}
                {!!localError && (
                  <View className="mt-4">
                    <Text className="text-error text-xs md:text-sm font-semibold text-center">
                      {localError}
                    </Text>
                  </View>
                )}

                {/* Action Button */}
                <TouchableOpacity
                  onPress={handleLogin}
                  activeOpacity={0.88}
                  disabled={isLoading}
                  className={`${getButtonHeight()} rounded-xl md:rounded-2xl flex-row items-center justify-center mt-6 shadow-lg
                    ${isLoading ? 'bg-primary/70' : 'bg-primary'}`}
                  style={{
                    shadowColor: COLORS.primary,
                    shadowOffset: { width: 0, height: isMobileWeb ? 4 : 8 },
                    shadowOpacity: isLoading ? 0.1 : (isMobileWeb ? 0.2 : 0.3),
                    shadowRadius: isMobileWeb ? 8 : 15,
                    elevation: isLoading ? 2 : (isMobileWeb ? 4 : 8),
                  }}
                >
                  <View className="flex-row items-center justify-center">
                    {isLoading ? (
                      <>
                        <Animated.View style={{ transform: [{ rotate: spin }] }}>
                          <Loader size={isMobileWeb ? 18 : 20} color="white" />
                        </Animated.View>
                        <Text className="ml-2 text-white font-semibold">
                          {permissionsLoading ? 'Loading Permissions...' : 'Signing In...'}
                        </Text>
                      </>
                    ) : (
                      <Text className={`${getButtonTextSize()} text-white font-bold`}>
                        {isMobileWeb ? 'Sign In' : 'Sign In to Admin'}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>

                {isLoading && (
                  <View className="mt-4 items-center">
                    <ActivityIndicator size="small" color={COLORS.primary} />
                    <Text className="text-center text-xs text-gray-500 mt-2">
                      {permissionsLoading
                        ? 'Loading your permissions and menu items...'
                        : 'Authenticating...'}
                    </Text>
                  </View>
                )}
              </View>

              {/* Footer */}
              <View className="mt-6 md:mt-8">
                <Text className="text-text-secondary text-[10px] md:text-xs text-center">
                  © 2025 Firework Admin. All rights reserved.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default LoginScreen;