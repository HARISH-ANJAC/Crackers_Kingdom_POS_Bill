// src/components/Navigation/webNavigation.tsx
import { View, Text, Platform, useWindowDimensions, TouchableOpacity } from 'react-native';
import React, { useState, useEffect, useMemo } from 'react';
import Sider from './Sider';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigationState, CommonActions } from '@react-navigation/native';
import { DrawerParamList } from './Drawer';
import { Maximize, Menu, Minimize } from 'lucide-react-native';

// Redux
import { useAppDispatch, useAppSelector } from '../../redux/Store';
import { logout, loadUserPermissions } from '../../redux/Slice/AuthSlice';

// Screens
import DashboardScreen from '../../screens/DashboardScreen';
import CategoryScreen from '../../screens/CategoryScreen';
import Profile from '../Profile';
import Notification from '../Notification';
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

const AdminStack = createStackNavigator<DrawerParamList>();

interface WebNavigationProps {
    navigation: any;
}

const WebNavigation = ({ navigation }: WebNavigationProps) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const { width } = useWindowDimensions();

    const dispatch = useAppDispatch();
    const { menuItems, isLoading: permissionsLoading } = useAppSelector((state) => state.permissions);
    const { user } = useAppSelector((state) => state.auth);

    // Load permissions if they're missing on reload
    useEffect(() => {
        if (user?.roleId && menuItems.length === 0 && !permissionsLoading) {
            console.log('🔄 WebNavigation: Triggering permission reload...');
            dispatch(loadUserPermissions(user.roleId));
        }
    }, [user, menuItems.length, permissionsLoading, dispatch]);

    // Get active route name
    const state = useNavigationState(state => state);
    const activeScreen = useMemo(() => {
        const homeRoute = state?.routes.find(r => r.name === 'home');
        const nestedState = homeRoute?.state as any;

        if (nestedState?.routes && typeof nestedState.index === 'number') {
            const currentRoute = nestedState.routes[nestedState.index];
            if (currentRoute?.name) {
                return currentRoute.name;
            }
        }
        return 'dashboard';
    }, [state]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => {
                setIsFullscreen(true);
            }).catch((err) => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().then(() => {
                    setIsFullscreen(false);
                }).catch((err) => {
                    console.error(`Error attempting to exit fullscreen: ${err.message}`);
                });
            }
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    const handleLogout = async () => {
        await dispatch(logout());
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: 'login' }],
            })
        );
    };

    return (
        <View className="flex-row flex-1 bg-background-light h-screen overflow-hidden">
            <Sider
                activeScreen={activeScreen}
                onNavigate={(screen) => (navigation as any).navigate('home', { screen })}
                isOpen={isSidebarOpen}
                onLogout={handleLogout}
                menuItems={menuItems}
                userEmail={user?.email}
                roleName={user?.roleName}
                isLoading={permissionsLoading}
            />

            <View className="flex-1 min-w-0 flex-col h-screen transition-all duration-300">
                {/* Header */}
                <View className="flex-row items-center justify-between px-6 py-3 border-b border-gray-200 bg-white shadow-sm">
                    <View className="flex-row items-center gap-x-4">
                        <TouchableOpacity
                            onPress={toggleSidebar}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <Menu size={22} color="#64748b" />
                        </TouchableOpacity>
                        <Text className="text-xl font-bold text-text-primary capitalize">
                            {activeScreen.replace(/([A-Z])/g, ' $1').trim()}
                        </Text>
                    </View>

                    <View className="flex-row items-center gap-x-4">
                        {/* Full screen toggle */}
                        <TouchableOpacity
                            onPress={toggleFullscreen}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            {isFullscreen ? (
                                <Minimize size={20} color="#64748b" />
                            ) : (
                                <Maximize size={20} color="#64748b" />
                            )}
                        </TouchableOpacity>

                        {/* Notification */}
                        <Notification />

                        {/* Profile */}
                        <Profile />
                    </View>
                </View>

                {/* Content Area */}
                <AdminStack.Navigator screenOptions={{ headerShown: false }}>
                    <AdminStack.Screen name="dashboard" component={DashboardScreen} />
                    <AdminStack.Screen name="category" component={CategoryScreen} />
                    <AdminStack.Screen name="users" component={UserScreen} />
                    <AdminStack.Screen name="roles" component={RoleScreen} />
                    <AdminStack.Screen name="uploads" component={UploadScreen} />

                    {/* Billing screens */}
                    <AdminStack.Screen name="bills" component={BillScreen} />
                    <AdminStack.Screen name="orders" component={OrderScreen} />
                    <AdminStack.Screen name="CreateBill" component={CreateBillScreen} />
                    <AdminStack.Screen name="PDFViewer" component={PDFViewer} />
                    <AdminStack.Screen name="products" component={ProductScreen} />
                    <AdminStack.Screen name="video" component={VideoScreen} />
                    <AdminStack.Screen name="tag" component={TagScreen} />
                    <AdminStack.Screen name="customers" component={CustomerScreen} />
                    <AdminStack.Screen name="settings" component={SettingsScreen} />
                </AdminStack.Navigator>
            </View>
        </View>
    );
};

export default WebNavigation;
