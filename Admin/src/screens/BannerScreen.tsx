// src/screens/BannerScreen.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StatusBar,
    Platform,
    ScrollView,
    useWindowDimensions,
    TouchableOpacity,
    TextInput,
    Image,
    ActivityIndicator,
    Switch,
} from 'react-native';
import { toast } from '../components/common/Toast';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image as ImageIcon, Search, Plus, Edit2, Trash2, RefreshCcw, X, Save, Upload, Printer } from 'lucide-react-native';
import { COLORS } from '../Constants/Colors';
import Header from '../components/Header';
import DataTable, { Column } from '../components/common/DataTable';
import { useAppDispatch, useAppSelector } from '../redux/Store';
import { fetchBanners, createBanner, updateBanner, deleteBanner, clearError, resetSuccess } from '../redux/Slice/BannerSlice';
import CustomModal from '../components/common/CustomModal';
import ConfirmDelete from '../components/common/ConfirmDelete';
import clsx from 'clsx';
import { BACKEND_API_URL } from '../Constants';
import { pick, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import { permissionUtils } from '../utils/permissionUtils';

const API_BASE_URL = BACKEND_API_URL.split('/api')[0];

const getSafeImageUrl = (imagePath: string | null) => {
    if (!imagePath) return null;
    const path = imagePath.replace(/\\/g, '/');
    return `${API_BASE_URL}/${path.startsWith('/') ? path.slice(1) : path}`;
};

const BannerScreen = ({ navigation }: { navigation?: any }) => {
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const isWeb = Platform.OS === "web" && width >= 980;

    const dispatch = useAppDispatch();
    const { banners, isLoading, error, success } = useAppSelector((state) => state.banners);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBanners, setSelectedBanners] = useState<string[]>([]);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [modalError, setModalError] = useState('');
    const [saving, setSaving] = useState(false);

    // Image Picker State
    const [selectedImage, setSelectedImage] = useState<any>(null);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        badge: '',
        badgeIcon: '',
        ctaText: 'Get My Estimate',
        ctaLink: '/products',
        rank: '0',
        isActive: true,
    });

    useEffect(() => {
        dispatch(fetchBanners());
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    useEffect(() => {
        if (success) {
            setIsModalOpen(false);
            dispatch(resetSuccess());
        }
    }, [success, dispatch]);

    const filteredBanners = useMemo(() => {
        return banners.filter(banner => {
            return searchQuery === '' ||
                banner.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (banner.badge && banner.badge.toLowerCase().includes(searchQuery.toLowerCase()));
        });
    }, [banners, searchQuery]);

    const handlePickImage = useCallback(() => {
        if (Platform.OS === 'web') {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e: any) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event: any) => {
                        setSelectedImage({
                            uri: event.target.result,
                            name: file.name,
                            type: file.type,
                            file: file,
                        });
                    };
                    reader.readAsDataURL(file);
                }
            };
            input.click();
            return;
        }

        const executePick = async () => {
            try {
                const res = await pick({ type: [types.images] });
                const file = res[0];
                setSelectedImage({
                    uri: file.uri,
                    name: file.name || 'banner.jpg',
                    type: file.type || 'image/jpeg',
                });
            } catch (err) {
                if (!(isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED)) {
                    toast.error('Failed to pick image');
                }
            }
        };

        if (Platform.OS === 'android') {
            permissionUtils.withPermission('upload', executePick);
        } else {
            executePick();
        }
    }, []);

    const handleAddPress = () => {
        setModalMode('add');
        setEditingId(null);
        setFormData({
            title: '',
            description: '',
            badge: '',
            badgeIcon: '',
            ctaText: 'Get My Estimate',
            ctaLink: '/products',
            rank: '0',
            isActive: true,
        });
        setSelectedImage(null);
        setModalError('');
        setIsModalOpen(true);
    };

    const handleEditPress = (banner: any) => {
        setModalMode('edit');
        setEditingId(banner.id);
        setFormData({
            title: banner.title,
            description: banner.description || '',
            badge: banner.badge || '',
            badgeIcon: banner.badgeIcon || '',
            ctaText: banner.ctaText || 'Get My Estimate',
            ctaLink: banner.ctaLink || '/products',
            rank: String(banner.rank || 0),
            isActive: banner.isActive,
        });
        setSelectedImage(banner.image ? { uri: getSafeImageUrl(banner.image) } : null);
        setModalError('');
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.title) {
            setModalError('Title is required');
            return;
        }
        if (!selectedImage && modalMode === 'add') {
            setModalError('Banner image is required');
            return;
        }

        setSaving(true);
        setModalError('');
        const toastId = toast.loading(modalMode === 'add' ? 'Creating banner...' : 'Saving changes...');

        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                data.append(key, String(value));
            });

            if (selectedImage && selectedImage.uri && !selectedImage.uri.startsWith('http')) {
                if (Platform.OS === 'web' && selectedImage.file) {
                    data.append('bannerImage', selectedImage.file);
                } else {
                    data.append('bannerImage', {
                        uri: selectedImage.uri,
                        name: selectedImage.name,
                        type: selectedImage.type,
                    } as any);
                }
            }

            if (modalMode === 'add') {
                await dispatch(createBanner(data)).unwrap();
                toast.success('Banner created successfully', { id: toastId });
            } else if (editingId) {
                await dispatch(updateBanner({ id: editingId, formData: data })).unwrap();
                toast.success('Banner updated successfully', { id: toastId });
            }
        } catch (err: any) {
            setModalError(err || 'Failed to save banner');
            toast.error(err || 'Failed to save banner', { id: toastId });
        } finally {
            setSaving(false);
        }
    };

    const handleDeletePress = (banner: any) => {
        setItemToDelete({ id: banner.id, name: banner.title });
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        setIsDeleting(true);
        const toastId = toast.loading('Deleting banner...');
        try {
            await dispatch(deleteBanner(itemToDelete.id)).unwrap();
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
            toast.success('Banner deleted successfully', { id: toastId });
        } catch (err: any) {
            toast.error(err || 'Failed to delete banner', { id: toastId });
        } finally {
            setIsDeleting(false);
        }
    };

    const columns: Column[] = useMemo(() => [
        {
            key: 'image',
            title: 'Image',
            width: 120,
            render: (item) => (
                <View className="w-20 h-10 bg-gray-100 rounded overflow-hidden">
                    <Image
                        source={{ uri: getSafeImageUrl(item.image) as string }}
                        className="w-full h-full"
                        resizeMode="cover"
                        style={Platform.OS === 'web' ? { width: '100%', height: '100%' } : undefined}
                    />
                </View>
            ),
        },
        {
            key: 'title',
            title: 'Title',
            width: isWeb ? 300 : 200,
            render: (item) => (
                <View>
                    <Text className="font-semibold text-gray-900 line-clamp-1">{item.title}</Text>
                    {item.badge && <Text className="text-primary text-[10px] font-bold uppercase">{item.badge}</Text>}
                </View>
            ),
        },
        {
            key: 'rank',
            title: 'Order',
            width: 80,
            align: 'center',
            sortable: true,
        },
        {
            key: 'isActive',
            title: 'Status',
            width: 100,
            render: (item) => (
                <View className={clsx(
                    "px-3 py-1 rounded-full",
                    item.isActive ? "bg-green-50" : "bg-red-50"
                )}>
                    <Text className={clsx(
                        "text-xs font-bold uppercase text-center",
                        item.isActive ? "text-green-700" : "text-red-700"
                    )}>
                        {item.isActive ? 'Active' : 'Inactive'}
                    </Text>
                </View>
            ),
        },
        {
            key: 'action',
            title: 'Actions',
            width: 120,
            align: 'center',
            render: (item) => (
                <View className="flex-row items-center gap-2">
                    <TouchableOpacity
                        onPress={() => handleEditPress(item)}
                        className="p-2 bg-blue-50 rounded-lg border border-blue-100"
                    >
                        <Edit2 size={16} color="#2563EB" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleDeletePress(item)}
                        className="p-2 bg-red-50 rounded-lg border border-red-100"
                    >
                        <Trash2 size={16} color="#DC2626" />
                    </TouchableOpacity>
                </View>
            ),
        },
    ], [isWeb]);

    return (
        <View className="flex-1 bg-background-light">
            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

            <Header
                title="Banner Management"
                icon={ImageIcon}
                navigation={navigation}
            />

            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    paddingBottom: insets.bottom + 20,
                    paddingHorizontal: isWeb ? 32 : 16,
                    paddingTop: isWeb ? 32 : 16
                }}
            >
                <View className="mb-6">
                    <View className={clsx(
                        "mb-2",
                        isWeb ? "flex-row items-center justify-between" : "flex-col items-start gap-4"
                    )}>
                        <View>
                            <Text className="text-2xl font-bold text-gray-800">Banners</Text>
                            <Text className="text-gray-500 text-sm">Manage hero carousel slides for the storefront</Text>
                        </View>

                        <View className="flex-row items-center gap-3">
                            <TouchableOpacity
                                onPress={() => dispatch(fetchBanners())}
                                className="p-2.5 bg-white rounded-lg border border-gray-200 shadow-sm"
                            >
                                <RefreshCcw size={18} color="#64748b" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleAddPress}
                                className="py-2.5 px-5 bg-primary rounded-lg flex-row items-center gap-2 shadow-md"
                            >
                                <Plus size={18} color="white" />
                                <Text className="text-white font-bold">Add Banner</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <DataTable
                    data={filteredBanners}
                    columns={columns}
                    isLoading={isLoading}
                    keyExtractor={(item) => item.id}
                    selectable={true}
                    selectedItems={selectedBanners}
                    onSelectAll={(selected) => setSelectedBanners(selected ? filteredBanners.map(b => b.id) : [])}
                    onSelectItem={(item, selected) => {
                        setSelectedBanners(prev => selected ? [...prev, item.id] : prev.filter(id => id !== item.id));
                    }}
                    containerStyle={{
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        backgroundColor: '#FFFFFF',
                    }}
                />
            </ScrollView>

            <CustomModal
                visible={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={modalMode === 'add' ? 'Add New Banner' : 'Edit Banner'}
                icon={ImageIcon}
                width={isWeb ? 550 : '95%'}
            >
                <ScrollView className="p-1" showsVerticalScrollIndicator={false}>
                    <View className="gap-5">
                        <View className="items-center">
                            <TouchableOpacity
                                onPress={handlePickImage}
                                className="w-full aspect-[21/9] bg-gray-100 rounded-2xl items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden"
                            >
                                {selectedImage ? (
                                    <Image
                                        source={{ uri: selectedImage.uri }}
                                        className="w-full h-full"
                                        resizeMode="cover"
                                        style={Platform.OS === 'web' ? { width: '100%', height: '100%' } : undefined}
                                    />
                                ) : (
                                    <View className="items-center">
                                        <Upload size={32} color="#94A3B8" />
                                        <Text className="text-sm text-gray-400 mt-1 uppercase font-bold">Upload Banner Image</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>

                        <View>
                            <Text className="text-sm font-semibold text-gray-700 mb-2">Title *</Text>
                            <TextInput
                                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                                placeholder="Grand Festive\nMega Sale"
                                placeholderTextColor={'gray'}
                                multiline
                                value={formData.title}
                                onChangeText={(text) => setFormData({ ...formData, title: text })}
                            />
                        </View>

                        <View>
                            <Text className="text-sm font-semibold text-gray-700 mb-2">Description</Text>
                            <TextInput
                                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                                placeholder="Enter short description..."
                                placeholderTextColor={'gray'}
                                multiline
                                numberOfLines={2}
                                value={formData.description}
                                onChangeText={(text) => setFormData({ ...formData, description: text })}
                            />
                        </View>

                        <View className="flex-row gap-4">
                            <View className="flex-1">
                                <Text className="text-sm font-semibold text-gray-700 mb-2">Badge Text</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                                    placeholder="40% OFF"
                                    placeholderTextColor={'gray'}
                                    value={formData.badge}
                                    onChangeText={(text) => setFormData({ ...formData, badge: text })}
                                />
                            </View>
                            <View className="flex-1">
                                <Text className="text-sm font-semibold text-gray-700 mb-2">Badge Icon (Lucide)</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                                    placeholder="Sparkles"
                                    placeholderTextColor={'gray'}
                                    value={formData.badgeIcon}
                                    onChangeText={(text) => setFormData({ ...formData, badgeIcon: text })}
                                />
                            </View>
                        </View>

                        <View className="flex-row gap-4">
                            <View className="flex-1">
                                <Text className="text-sm font-semibold text-gray-700 mb-2">CTA Text</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                                    placeholder="Get My Estimate"
                                    placeholderTextColor={'gray'}
                                    value={formData.ctaText}
                                    onChangeText={(text) => setFormData({ ...formData, ctaText: text })}
                                />
                            </View>
                            <View className="flex-1">
                                <Text className="text-sm font-semibold text-gray-700 mb-2">CTA Link</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                                    placeholder="/products"
                                    placeholderTextColor={'gray'}
                                    value={formData.ctaLink}
                                    onChangeText={(text) => setFormData({ ...formData, ctaLink: text })}
                                />
                            </View>
                        </View>

                        <View className="flex-row gap-4">
                            <View className="flex-1">
                                <Text className="text-sm font-semibold text-gray-700 mb-2">Display Order</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                                    keyboardType="numeric"
                                    placeholderTextColor={'gray'}
                                    value={formData.rank}
                                    onChangeText={(text) => setFormData({ ...formData, rank: text })}
                                />
                            </View>
                            <View className="flex-1">
                                <Text className="text-sm font-semibold text-gray-700 mb-2">Status</Text>
                                <View className="flex-row items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-2">
                                    <Text className={formData.isActive ? "text-green-600 font-bold" : "text-gray-600"}>
                                        {formData.isActive ? 'Active' : 'Inactive'}
                                    </Text>
                                    <Switch
                                        trackColor={{ false: '#D1D5DB', true: '#BBF7D0' }}
                                        thumbColor={formData.isActive ? COLORS.primary : '#9CA3AF'}
                                        onValueChange={(value) => setFormData({ ...formData, isActive: value })}
                                        value={formData.isActive}
                                    />
                                </View>
                            </View>
                        </View>

                        {modalError ? <Text className="text-red-500 text-center text-sm">{modalError}</Text> : null}

                        <View className="flex-row gap-3 pt-4 mb-6">
                            <TouchableOpacity
                                onPress={() => setIsModalOpen(false)}
                                className="flex-1 bg-white border border-gray-200 py-4 rounded-xl items-center"
                            >
                                <Text className="text-gray-700 font-bold">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleSave}
                                disabled={saving}
                                className="flex-1 bg-primary py-4 rounded-xl items-center flex-row justify-center gap-2"
                            >
                                {saving ? <ActivityIndicator size="small" color="white" /> : <Save size={20} color="white" />}
                                <Text className="text-white font-bold">{modalMode === 'add' ? 'Create' : 'Save Changes'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </CustomModal>

            <ConfirmDelete
                visible={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Banner"
                message={`Are you sure you want to delete "${itemToDelete?.name}"?`}
                loading={isDeleting}
            />
        </View>
    );
};

export default BannerScreen;
