// src/components/Navigation/Drawer.tsx
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions
} from 'react-native';
import React, { useEffect } from 'react';
import {
  createDrawerNavigator,
  DrawerContentComponentProps
} from '@react-navigation/drawer';
import { LogOut, Store } from 'lucide-react-native';
import { clsx } from 'clsx';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CommonActions } from '@react-navigation/native';

import { useAppDispatch, useAppSelector } from '../../redux/Store';
import { logout, loadUserPermissions } from '../../redux/Slice/AuthSlice';
import { MenuItem } from '../../redux/types';
import Skeleton from '../common/Skeleton';

// Screens
import DashboardScreen from '../../screens/DashboardScreen';
import CategoryScreen from '../../screens/CategoryScreen';
import UserScreen from '../../screens/UserScreen';
import RoleScreen from '../../screens/RoleScreen';
import UploadScreen from '../../screens/UploadScreen';
import ProductScreen from '../../screens/ProductScreen';
import VideoScreen from '../../screens/VideoScreen';
import BillScreen from '../../screens/BillScreen';
import CreateBillScreen from '../../screens/CreateBillScreen';
import OrderScreen from '../../screens/OrderScreen';
import PDFViewer from '../../screens/PDFViewer';
import SettingsScreen from '../../screens/SettingsScreen';
import CustomerScreen from '../../screens/CustomerScreen';
import TagScreen from '../../screens/TagScreen';

export type DrawerParamList = {
  dashboard: undefined;
  category: undefined;
  tag: undefined;
  users: undefined;
  bills: undefined;
  orders: undefined;
  products: undefined;
  video: undefined;
  customers: undefined;
  settings: undefined;
  roles: undefined;
  uploads: undefined;
  CreateBill: { billId?: string } | undefined;
  PDFViewer: { invoiceNumber?: string; orderNumber?: string; type?: 'invoice' | 'order' };
};

const Draw = createDrawerNavigator<DrawerParamList>();

// Custom Drawer Content Component
const CustomDrawerContent = React.memo((props: DrawerContentComponentProps) => {
  const { state, navigation } = props;
  const activeScreen = state.routes[state.index].name;
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  const { menuItems, isLoading: permissionsLoading } = useAppSelector((state: any) => state.permissions);
  const { user } = useAppSelector((state: any) => state.auth);

  const handleLogout = async () => {
    await dispatch(logout());
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'login' }],
      })
    );
  };

  // Render menu item recursively
  const renderMenuItem = (item: MenuItem, isChild: boolean = false) => {
    const isActive = activeScreen === item.id;
    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;

    if (hasChildren) {
      return (
        <View key={item.id} className="mb-1">
          <View className="flex-row items-center p-3.5">
            <Icon size={22} color="#94a3b8" strokeWidth={2} />
            <Text className="flex-1 ml-3 font-semibold text-[14px] text-gray-500">
              {item.label}
            </Text>
          </View>
          <View className="ml-4">
            {item.children?.map((child) => renderMenuItem(child, true))}
          </View>
        </View>
      );
    }

    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => navigation.navigate(item.id as any)}
        activeOpacity={0.7}
        className={clsx(
          'flex-row items-center p-3.5 rounded-2xl mb-1',
          isActive ? 'bg-primary' : 'p-3.5'
        )}
      >
        <Icon
          size={22}
          color={isActive ? 'white' : '#94a3b8'}
          strokeWidth={isActive ? 2.5 : 2}
        />
        <View className="flex-1 flex-row items-center justify-between ml-3">
          <Text
            className={clsx(
              'font-semibold text-[14px]',
              isActive ? 'text-white' : 'text-gray-500'
            )}
          >
            {item.label}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View
      className="flex-1 bg-white"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <View className="px-6 py-8 border-b border-gray-200">
        <View className="flex-row items-center">
          <View className="w-12 h-12 bg-primary rounded-xl items-center justify-center shadow-lg shadow-primary/20">
            <Store size={24} color="white" />
          </View>
          <View className="ml-3">
            <Text className="text-lg font-bold text-text-primary tracking-tight">
              Crackers Shop
            </Text>
            <Text className="text-[10px] font-bold text-primary uppercase tracking-widest">
              {user?.roleName || 'Admin Panel'}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 16 }}
      >
        <View className="px-3">
          {permissionsLoading ? (
            Array.from({ length: 10 }).map((_, index) => (
              <View
                key={`skeleton-${index}`}
                className="flex-row items-center p-3.5 rounded-2xl mb-1"
              >
                <Skeleton
                  width={22}
                  height={22}
                  borderRadius={6}
                />
                <Skeleton
                  width="60%"
                  height={16}
                  className="ml-4"
                />
              </View>
            ))
          ) : (
            menuItems.map((item: any) => renderMenuItem(item))
          )}
        </View>
      </ScrollView>

      <View className="p-4 border-t border-gray-100">
        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.7}
          className="flex-row items-center p-3.5 rounded-2xl bg-red-50"
        >
          <LogOut size={22} color="#f87171" />
          <Text className="ml-3 font-semibold text-red-500">Logout</Text>
        </TouchableOpacity>

        <Text className="text-[10px] text-gray-400 text-center mt-4">
          Logged in as {user?.email}
        </Text>
      </View>
    </View>
  );
});

const Drawer = (props: any) => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  return (
    <Draw.Navigator
      initialRouteName="dashboard"
      screenOptions={{
        headerShown: false,
        drawerType: isTablet ? 'permanent' : 'front',
        drawerStyle: {
          width: isTablet ? 280 : '80%',
          maxWidth: 320,
        },
        overlayColor: 'rgba(0,0,0,0.3)',
        drawerPosition: 'left',
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Draw.Screen name="dashboard" component={DashboardScreen} />
      <Draw.Screen name="category" component={CategoryScreen} />
      <Draw.Screen name="tag" component={TagScreen} />
      <Draw.Screen name="users" component={UserScreen} />
      <Draw.Screen name="bills" component={BillScreen} />
      <Draw.Screen name="orders" component={OrderScreen} />
      <Draw.Screen name="products" component={ProductScreen} />
      <Draw.Screen name="video" component={VideoScreen} />
      <Draw.Screen name="customers" component={CustomerScreen} />
      <Draw.Screen name="settings" component={SettingsScreen} />
      <Draw.Screen name="roles" component={RoleScreen} />
      <Draw.Screen name="uploads" component={UploadScreen} />
      <Draw.Screen name="CreateBill" component={CreateBillScreen} />
      <Draw.Screen name="PDFViewer" component={PDFViewer} />
    </Draw.Navigator>
  );
};

export default React.memo(Drawer);
