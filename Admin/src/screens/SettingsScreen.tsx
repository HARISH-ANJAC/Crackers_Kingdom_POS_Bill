// src/screens/SettingsScreen.tsx
import {
    View,
    Text,
    StatusBar,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import { toast } from '../components/common/Toast';
import React, { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Store, Phone, MapPin, Hash, Save, RefreshCcw } from 'lucide-react-native';
import { COLORS } from '../Constants/Colors';
import Header from '../components/Header';
import api from '../services/api';

const SettingsScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [shopData, setShopData] = useState({
        shopName: '',
        shopPhone: '',
        shopAddress: '',
        shopGst: '',
    });

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/settings');
            if (response.data.success) {
                setShopData({
                    shopName: response.data.data.shopName || '',
                    shopPhone: response.data.data.shopPhone || '',
                    shopAddress: response.data.data.shopAddress || '',
                    shopGst: response.data.data.shopGst || '',
                });
            }
        } catch (error: any) {
            console.error('Fetch Settings Error:', error);
            toast.error('Failed to load shop settings');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleUpdate = async () => {
        if (!shopData.shopName || !shopData.shopPhone || !shopData.shopAddress) {
            toast.warning('Name, Phone and Address are required');
            return;
        }

        setIsSaving(true);
        try {
            const response = await api.put('/settings', shopData);
            if (response.data.success) {
                toast.success('Shop settings updated successfully');
            }
        } catch (error: any) {
            console.error('Update Settings Error:', error);
            toast.error(error.response?.data?.msg || 'Failed to update settings');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <View className="flex-1 bg-gray-50">
            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
            <Header title="Shop Settings" navigation={navigation} />

            <ScrollView
                className="flex-1 px-4 lg:px-10 py-6"
                showsVerticalScrollIndicator={false}
            >
                <View className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
                    <View className="flex-row items-center mb-6">
                        <View className="w-10 h-10 bg-primary/10 rounded-xl items-center justify-center mr-3">
                            <Store size={20} color={COLORS.primary} />
                        </View>
                        <View>
                            <Text className="text-lg font-bold text-gray-800">Shop Identity</Text>
                            <Text className="text-xs text-gray-400">Manage your shop name and branding</Text>
                        </View>
                    </View>

                    {isLoading ? (
                        <ActivityIndicator size="large" color={COLORS.primary} />
                    ) : (
                        <>
                            {/* Shop Name */}
                            <View className="mb-5">
                                <Text className="text-sm font-semibold text-gray-600 mb-2 ml-1">Shop Name</Text>
                                <View className="flex-row items-center bg-gray-50 rounded-2xl border border-gray-100 px-4 py-3.5 focus:border-primary">
                                    <Store size={18} color="#94a3b8" />
                                    <TextInput
                                        className="flex-1 ml-3 text-gray-800 font-medium"
                                        placeholder="Enter Shop Name"
                                        value={shopData.shopName}
                                        onChangeText={(text) => setShopData({ ...shopData, shopName: text })}
                                    />
                                </View>
                            </View>

                            {/* Shop Phone */}
                            <View className="mb-5">
                                <Text className="text-sm font-semibold text-gray-600 mb-2 ml-1">Shop Phone</Text>
                                <View className="flex-row items-center bg-gray-50 rounded-2xl border border-gray-100 px-4 py-3.5 focus:border-primary">
                                    <Phone size={18} color="#94a3b8" />
                                    <TextInput
                                        className="flex-1 ml-3 text-gray-800 font-medium"
                                        placeholder="Enter Shop Phone"
                                        keyboardType="phone-pad"
                                        value={shopData.shopPhone}
                                        onChangeText={(text) => setShopData({ ...shopData, shopPhone: text })}
                                    />
                                </View>
                            </View>

                            {/* GST Number (Optional) */}
                            <View className="mb-5">
                                <View className="flex-row justify-between items-center mb-2">
                                    <Text className="text-sm font-semibold text-gray-600 ml-1">GST Number</Text>
                                    <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Optional</Text>
                                </View>
                                <View className="flex-row items-center bg-gray-50 rounded-2xl border border-gray-100 px-4 py-3.5 focus:border-primary">
                                    <Hash size={18} color="#94a3b8" />
                                    <TextInput
                                        className="flex-1 ml-3 text-gray-800 font-medium"
                                        placeholder="Enter GST Number"
                                        autoCapitalize="characters"
                                        value={shopData.shopGst}
                                        onChangeText={(text) => setShopData({ ...shopData, shopGst: text })}
                                    />
                                </View>
                            </View>

                            {/* Shop Address */}
                            <View className="mb-5">
                                <Text className="text-sm font-semibold text-gray-600 mb-2 ml-1">Shop Address</Text>
                                <View className="flex-row items-center bg-gray-50 rounded-2xl border border-gray-100 px-4 py-3.5 focus:border-primary">
                                    <MapPin size={18} color="#94a3b8" />
                                    <TextInput
                                        className="flex-1 ml-3 text-gray-800 font-medium"
                                        placeholder="Enter Shop Address"
                                        multiline
                                        numberOfLines={3}
                                        style={{ textAlignVertical: 'top', height: 80 }}
                                        value={shopData.shopAddress}
                                        onChangeText={(text) => setShopData({ ...shopData, shopAddress: text })}
                                    />
                                </View>
                            </View>

                            {/* Actions */}
                            <View className="flex-row gap-3 mt-4">
                                <TouchableOpacity
                                    onPress={fetchSettings}
                                    disabled={isSaving}
                                    className="flex-1 bg-gray-100 py-4 rounded-2xl items-center flex-row justify-center"
                                >
                                    <RefreshCcw size={18} color="#64748b" />
                                    <Text className="ml-2 font-bold text-gray-500">Reset</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={handleUpdate}
                                    disabled={isSaving}
                                    className="flex-[2] bg-primary py-4 rounded-2xl items-center flex-row justify-center shadow-lg shadow-primary/30"
                                >
                                    {isSaving ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <>
                                            <Save size={18} color="white" />
                                            <Text className="ml-2 font-bold text-white">Save Changes</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>

                <View className="h-20" />
            </ScrollView>
        </View>
    );
};

export default SettingsScreen;
