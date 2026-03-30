// App.tsx
import './src/global.css';
import { Platform, StatusBar, useWindowDimensions } from 'react-native';
import React, { useEffect, useState } from 'react';
import { NavigationContainer, LinkingOptions, NavigatorScreenParams, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider, useSelector } from 'react-redux';

// Redux
import { RootState, Store } from './src/redux/Store';
import { checkAuthState } from './src/redux/Slice/AuthSlice';

import LoginScreen from './src/screens/LoginScreen';
import Drawer, { DrawerParamList } from './src/components/Navigation/Drawer';
import WebNavigation from './src/components/Navigation/webNavigation';
import SplashScreen from './src/screens/SplashScreen';
import { Toaster } from './src/components/common/Toast';
import QRScanScreen from './src/screens/QRScanScreen';

export type RootStackParamList = {
  splash: undefined;
  login: undefined;
  home: NavigatorScreenParams<DrawerParamList>;
  QRScan: { onScan: (code: string) => void };
};

const Stack = createStackNavigator<RootStackParamList>();

const linking: LinkingOptions<any> = {
  prefixes: [
    'http://localhost:5000',
    'http://localhost:8081',
    'http://localhost:19006',
    'crackers-admin://'
  ],
  config: {
    screens: {
      splash: 'splash',
      login: 'login',
      home: {
        path: 'admin',
        screens: {
          dashboard: '',
          category: 'category',
          tag: 'tag',
          orders: 'orders',
          products: 'products',
          createProduct: 'create-product',
          video: 'video',
          createVideo: 'create-video',
          barcode: 'barcode',
          customers: 'customers',
          users: 'users',
          roles: 'roles',
        },
      },
    },
  },
};

const AdminHome = (props: any) => {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web" && width >= 980;
  return isWeb ? <WebNavigation {...props} /> : <Drawer {...props} />;
};

const AppContent = () => {
  const { width } = useWindowDimensions();
  const { isAuthenticated, isLoading: authLoading } = useSelector((state: RootState) => state.auth);
  const [showSplash, setShowSplash] = useState(true);

  // Splash screen transition logic
  useEffect(() => {
    const splashTimer = setTimeout(() => {
      // Transition out of splash only if auth check is no longer pending
      if (!authLoading) {
        setShowSplash(false);
      }
    }, 2500); // 2.5s minimum splash duration

    return () => clearTimeout(splashTimer);
  }, [authLoading]);

  // If auth is still checking, keep showing splash even if timer finished
  useEffect(() => {
    if (!authLoading && showSplash) {
      // Give a tiny buffer for smoothness
      const timeout = setTimeout(() => setShowSplash(false), 500);
      return () => clearTimeout(timeout);
    }
  }, [authLoading]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer
          linking={Platform.OS === 'web' ? linking : undefined}
          theme={{
            ...DefaultTheme,
            colors: {
              ...DefaultTheme.colors,
              background: '#F9FAFB',
            }
          }}
        >
          {showSplash ? (
            <SplashScreen />
          ) : (
            <Stack.Navigator
              initialRouteName={isAuthenticated ? "home" : "login"}
              screenOptions={{
                headerShown: false,

              }}
            >
              <Stack.Screen name="login" component={LoginScreen} />
              <Stack.Screen name="home" component={AdminHome} />
              <Stack.Screen name="QRScan" component={QRScanScreen} />
            </Stack.Navigator>
          )}
        </NavigationContainer>
      </SafeAreaProvider>
      {/* 🔔 Toast Notifications — overlays all screens */}
      <Toaster position="top-center" />
    </GestureHandlerRootView>
  );
};

const App = () => {
  useEffect(() => {
    // Check if user is already authenticated
    Store.dispatch(checkAuthState());
  }, []);

  return (
    <Provider store={Store}>
      <AppContent />
    </Provider>
  );
};

export default App;