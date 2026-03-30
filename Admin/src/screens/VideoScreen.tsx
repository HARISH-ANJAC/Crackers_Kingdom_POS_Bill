// src/screens/VideoScreen.tsx
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
    Alert,
    ActivityIndicator,
} from 'react-native';
import { toast } from '../components/common/Toast';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Video as VideoIcon, Search, Plus, Edit2, Trash2, RefreshCcw, X, Save, Upload, Printer, FileUp, ChevronLeft, Play, ExternalLink, Globe, FileVideo } from 'lucide-react-native';
import { COLORS } from '../Constants/Colors';
import Header from '../components/Header';
import DataTable, { Column } from '../components/common/DataTable';
import { useAppDispatch, useAppSelector } from '../redux/Store';
import { fetchVideos, createVideo, updateVideo, deleteVideo, clearError, resetSuccess } from '../redux/Slice/VideoSlice';
import { fetchProducts } from '../redux/Slice/ProductSlice';
import CustomModal from '../components/common/CustomModal';
import ConfirmDelete from '../components/common/ConfirmDelete';
import CustomDropDown from '../components/common/CustomDropDown';
import clsx from 'clsx';
import { BACKEND_API_URL } from '../Constants';
import { IMAGES } from '../Constants/Images';
import { pick, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import { permissionUtils } from '../utils/permissionUtils';
import { exportToCSV, printData, ExportColumn } from '../utils/exportUtils';

const API_BASE_URL = BACKEND_API_URL.split('/api')[0];

const getSafeVideoUrl = (videoPath: string | null) => {
    if (!videoPath) return null;
    if (videoPath.startsWith('http')) return videoPath;
    const path = videoPath.replace(/\\/g, '/');
    return `${API_BASE_URL}/${path.startsWith('/') ? path.slice(1) : path}`;
};

const VideoScreen = ({ navigation }: { navigation?: any }) => {
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const isWeb = Platform.OS === "web" && width >= 980;

    const dispatch = useAppDispatch();
    const { videos, isLoading, error, success } = useAppSelector((state) => state.videos);
    const { products } = useAppSelector((state) => state.products);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<string>('');
    const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
    const [viewMode, setViewMode] = useState<'list' | 'details'>('list');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [modalError, setModalError] = useState('');
    const [saving, setSaving] = useState(false);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Video Preview State
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewData, setPreviewData] = useState<{ url: string; name: string; type: string } | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        productId: '',
        name: '',
        type: 'upload' as 'upload' | 'youtube',
        url: '',
    });
    const [selectedFile, setSelectedFile] = useState<any>(null);

    useEffect(() => {
        dispatch(fetchVideos());
        dispatch(fetchProducts());
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

    const filteredVideos = useMemo(() => {
        return videos.filter(vid => {
            const matchesSearch = searchQuery === '' ||
                (vid.name && vid.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                vid.url.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesType = selectedType === '' || vid.type === selectedType;

            return matchesSearch && matchesType;
        });
    }, [videos, searchQuery, selectedType]);

    const productOptions = useMemo(() => {
        return products.map(prod => ({ label: prod.name, value: prod.id }));
    }, [products]);

    const handlePickFile = useCallback(() => {
        if (Platform.OS === 'web') {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'video/*';
            input.onchange = (e: any) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event: any) => {
                        setSelectedFile({
                            uri: event.target.result,
                            name: file.name,
                            type: file.type,
                            file: file,
                        });
                        setFormData(prev => ({ ...prev, url: file.name }));
                    };
                    reader.readAsDataURL(file);
                }
            };
            input.click();
            return;
        }

        const executePick = async () => {
            try {
                const res = await pick({
                    type: [types.video],
                });

                const file = res[0];
                setSelectedFile({
                    uri: file.uri,
                    name: file.name || 'video.mp4',
                    type: file.type || 'video/mp4',
                });
                setFormData(prev => ({ ...prev, url: file.name || 'video.mp4' }));
            } catch (err) {
                if (!(isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED)) {
                    console.error('Picker error:', err);
                    toast.error('Failed to pick video');
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
            productId: products.length > 0 ? products[0].id : '',
            name: '',
            type: 'upload',
            url: '',
        });
        setSelectedFile(null);
        setModalError('');
        setIsModalOpen(true);
    };

    const handleEditPress = (video: any) => {
        setModalMode('edit');
        setEditingId(video.id);
        setFormData({
            productId: video.productId,
            name: video.name || '',
            type: video.type,
            url: video.url,
        });
        setSelectedFile(video.type === 'upload' ? { uri: getSafeVideoUrl(video.url) } : null);
        setModalError('');
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.productId || (formData.type !== 'upload' && !formData.url)) {
            setModalError('Product and Video Source are required');
            return;
        }

        setSaving(true);
        try {
            let data: any;

            if (formData.type === 'upload') {
                const fd = new FormData();
                fd.append('productId', formData.productId);
                fd.append('name', formData.name);
                fd.append('type', formData.type);

                if (selectedFile && selectedFile.uri && !selectedFile.uri.startsWith('http')) {
                    if (Platform.OS === 'web' && selectedFile.file) {
                        fd.append('videoFile', selectedFile.file);
                    } else {
                        fd.append('videoFile', {
                            uri: selectedFile.uri,
                            name: selectedFile.name,
                            type: selectedFile.type,
                        } as any);
                    }
                } else if (modalMode === 'edit') {
                    fd.append('url', formData.url);
                }
                data = fd;
            } else {
                data = {
                    productId: formData.productId,
                    name: formData.name,
                    type: formData.type,
                    url: formData.url,
                };
            }

            if (modalMode === 'add') {
                await dispatch(createVideo(data));
                toast.success('Video created successfully');
            } else if (editingId) {
                await dispatch(updateVideo({ id: editingId, data }));
                toast.success('Video updated successfully');
            }
        } catch (err) {
            setModalError('Failed to save video');
            toast.error('Failed to save video');
        } finally {
            setSaving(false);
        }
    };

    const handleDeletePress = (video: any) => {
        setItemToDelete({ id: video.id, name: video.name || 'Video' });
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        setIsDeleting(true);
        try {
            const resultAction = await dispatch(deleteVideo(itemToDelete.id));
            if (deleteVideo.fulfilled.match(resultAction)) {
                setIsDeleteModalOpen(false);
                setItemToDelete(null);
                toast.success('Video deleted successfully');
            }
        } catch (err) {
            toast.error('Failed to delete video');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDownload = async (format: 'pdf' | 'excel' | 'print') => {
        const data = selectedVideos.length > 0
            ? videos.filter(v => selectedVideos.includes(v.id))
            : filteredVideos;

        if (data.length === 0) {
            toast.warning('No records to export');
            return;
        }

        const columns: ExportColumn[] = [
            { key: 'name', title: 'Name' },
            { key: 'type', title: 'Type' },
            { key: 'url', title: 'URL/Path' },
            {
                key: 'product',
                title: 'Product',
                render: (item: any) => products.find(p => p.id === item.productId)?.name || 'N/A'
            }
        ];

        const executeAction = async () => {
            if (format === 'excel') {
                await exportToCSV(data, columns, 'videos_list');
            } else {
                await printData('Video Management Report', data, columns, format as 'print' | 'pdf');
            }
        };

        if (Platform.OS === 'android') {
            permissionUtils.withPermission('download', executeAction);
        } else {
            executeAction();
        }
    };

    const handleBackToList = useCallback(() => {
        setViewMode('list');
    }, []);

    const renderHeader = () => (
        <View className="mb-6">
            <View className={clsx(
                "mb-2",
                isWeb ? "flex-row items-center justify-between" : "flex-col items-start gap-4"
            )}>
                <View className="flex-row items-center gap-3">
                    {viewMode !== 'list' && (
                        <TouchableOpacity
                            onPress={handleBackToList}
                            className="p-2 bg-white rounded-lg border border-gray-200"
                        >
                            <ChevronLeft size={20} color="#374151" />
                        </TouchableOpacity>
                    )}
                    <View className="relative z-50">
                        <View className="flex-row items-center gap-2">
                            <Text className="text-2xl font-bold text-gray-800">
                                {viewMode === 'list' ? 'Videos' : 'Video Details'}
                            </Text>
                            {viewMode === 'list' && (
                                <View className="px-2.5 py-1 bg-gray-200 rounded-full">
                                    <Text className="text-gray-600 text-xs font-bold">
                                        {videos.length} total
                                    </Text>
                                </View>
                            )}
                        </View>
                        <Text className="text-gray-500 text-sm">
                            Manage product media and videos
                        </Text>
                    </View>
                </View>

                <View className={clsx(
                    "flex-row items-center",
                    isWeb ? "justify-end" : "justify-start w-full"
                )}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="flex-row"
                        contentContainerStyle={{
                            gap: isWeb ? 24 : 8,
                            alignItems: 'center'
                        }}
                    >
                        {viewMode === 'list' && (
                            <View className="flex-row items-center gap-2">
                                <View className="flex-row items-center bg-white rounded-lg border border-gray-200 shadow-sm p-1 mr-2">
                                    <TouchableOpacity onPress={() => handleDownload('pdf')} className="p-2 mr-1">
                                        <Image source={IMAGES.PDF} style={{ width: 20, height: 20, resizeMode: 'contain' }} />
                                    </TouchableOpacity>
                                    <View className="w-[1px] h-5 bg-gray-200" />
                                    <TouchableOpacity onPress={() => handleDownload('excel')} className="p-2 ml-1">
                                        <Image source={IMAGES.EXCEL} style={{ width: 20, height: 20, resizeMode: 'contain' }} />
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity
                                    onPress={() => dispatch(fetchVideos())}
                                    className="p-2.5 bg-white rounded-lg border border-gray-200 shadow-sm"
                                >
                                    <RefreshCcw size={18} color="#64748b" />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={handleAddPress}
                                    className="py-2.5 px-5 bg-primary rounded-lg flex-row items-center gap-2 shadow-md"
                                >
                                    <Plus size={18} color="white" />
                                    <Text className="text-white font-bold">Add Video</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        </View>
    );

    const renderFilters = () => {
        if (viewMode !== 'list') return null;

        return (
            <View className="bg-white rounded-xl border border-gray-200 mb-6 shadow-sm z-10 p-4">
                <View className={clsx("flex-row items-center gap-4", !isWeb && "flex-col")}>
                    <View className="flex-1 w-full relative">
                        <View className="absolute left-4 top-0 bottom-0 justify-center z-10">
                            <Search size={20} color="#9CA3AF" />
                        </View>
                        <TextInput
                            placeholder="Search by name or URL..."
                            className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-12 pr-4 py-3 text-gray-800"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                    <View className={clsx(isWeb ? "w-[200px]" : "w-full")}>
                        <CustomDropDown
                            placeholder="Filter by type"
                            items={[
                                { label: 'All Types', value: '' },
                                { label: 'Upload', value: 'upload' },
                                { label: 'YouTube', value: 'youtube' },
                            ]}
                            selectedValue={selectedType}
                            onSelect={(value) => setSelectedType(Array.isArray(value) ? value[0] : value)}
                            showClear={true}
                        />
                    </View>
                </View>
            </View>
        );
    };

    const columns = useMemo<Column[]>(() => [
        {
            key: 'type',
            title: 'Type',
            width: 80,
            render: (item) => {
                let Icon = FileVideo;
                let color = "#64748b";
                if (item.type === 'youtube') { Icon = Play; color = "#ef4444"; }
                return (
                    <View className="w-10 h-10 items-center justify-center bg-gray-100 rounded-lg">
                        <Icon size={20} color={color} />
                    </View>
                );
            }
        },
        {
            key: 'name',
            title: 'Video Name',
            width: 200,
            render: (item) => (
                <View>
                    <Text className="font-semibold text-gray-900">{item.name || 'Untitled Video'}</Text>
                    <Text className="text-gray-500 text-xs italic" numberOfLines={1}>{item.url}</Text>
                </View>
            )
        },
        {
            key: 'product',
            title: 'Product',
            width: 180,
            render: (item) => {
                const product = products.find(p => p.id === item.productId);
                return <Text className="text-gray-600 text-sm">{product?.name || 'N/A'}</Text>;
            }
        },
        {
            key: 'preview',
            title: 'Preview',
            width: 100,
            align: 'center',
            render: (item) => (
                <TouchableOpacity
                    onPress={() => {
                        setPreviewData({ url: getSafeVideoUrl(item.url) as string, name: item.name || 'Video', type: item.type });
                        setIsPreviewOpen(true);
                    }}
                    className="p-2 bg-gray-50 rounded-lg border border-gray-200"
                >
                    <Play size={16} color={COLORS.primary} />
                </TouchableOpacity>
            )
        },
        {
            key: 'action',
            title: 'Actions',
            width: 100,
            align: 'center',
            render: (item) => (
                <View className="flex-row items-center gap-2">
                    <TouchableOpacity onPress={() => handleEditPress(item)} className="p-2 bg-blue-50 rounded-lg">
                        <Edit2 size={16} color="#2563EB" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeletePress(item)} className="p-2 bg-red-50 rounded-lg">
                        <Trash2 size={16} color="#DC2626" />
                    </TouchableOpacity>
                </View>
            )
        }
    ], [products]);

    return (
        <View className="flex-1 bg-background-light">
            <StatusBar barStyle="dark-content" />
            <Header title="Video Gallery" icon={VideoIcon} navigation={navigation} />

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
                {renderHeader()}
                {renderFilters()}

                <DataTable
                    data={filteredVideos}
                    columns={columns}
                    isLoading={isLoading}
                    keyExtractor={(item) => item.id}
                    pageSize={10}
                    selectable={true}
                    selectedItems={selectedVideos}
                    onSelectAll={(sel) => setSelectedVideos(sel ? filteredVideos.map(v => v.id) : [])}
                    onSelectItem={(it, sel) => setSelectedVideos(prev => sel ? [...prev, it.id] : prev.filter(i => i !== it.id))}
                    containerStyle={{
                        borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF'
                    }}
                />

                {filteredVideos.length === 0 && !isLoading && (
                    <View className="items-center justify-center py-20 opacity-50">
                        <FileVideo size={64} color="#94A3B8" />
                        <Text className="mt-4 text-gray-500 font-medium">No videos found</Text>
                    </View>
                )}
            </ScrollView>

            {/* Add/Edit Modal */}
            <CustomModal
                visible={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={modalMode === 'add' ? 'Add Video' : 'Edit Video'}
                icon={VideoIcon}
                width={isWeb ? 550 : '95%'}
            >
                <ScrollView className="p-1" showsVerticalScrollIndicator={false}>
                    <View className="gap-5">
                        <View>
                            <Text className="text-sm font-semibold text-gray-700 mb-2">Linked Product *</Text>
                            <CustomDropDown
                                placeholder="Select Product"
                                items={productOptions}
                                selectedValue={formData.productId}
                                onSelect={(val) => setFormData({ ...formData, productId: Array.isArray(val) ? val[0] : val })}
                            />
                        </View>

                        <View>
                            <Text className="text-sm font-semibold text-gray-700 mb-2">Video Name (Optional)</Text>
                            <TextInput
                                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3"
                                placeholder="e.g. Unboxing Video"
                                value={formData.name}
                                onChangeText={(t) => setFormData({ ...formData, name: t })}
                            />
                        </View>

                        <View>
                            <Text className="text-sm font-semibold text-gray-700 mb-2">Video Source Type</Text>
                            <CustomDropDown
                                items={[
                                    { label: 'File Upload', value: 'upload' },
                                    { label: 'YouTube URL', value: 'youtube' },
                                ]}
                                selectedValue={formData.type}
                                onSelect={(val) => {
                                    const type = Array.isArray(val) ? val[0] : val;
                                    setFormData({ ...formData, type: type as any, url: '' });
                                    setSelectedFile(null);
                                }}
                            />
                        </View>

                        {formData.type === 'upload' ? (
                            <View className="items-center">
                                <TouchableOpacity
                                    onPress={handlePickFile}
                                    className="w-full h-32 bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl items-center justify-center"
                                >
                                    {selectedFile ? (
                                        <View className="items-center">
                                            <FileVideo size={32} color={COLORS.primary} />
                                            <Text className="text-xs text-gray-600 mt-2 font-bold">{selectedFile.name}</Text>
                                        </View>
                                    ) : (
                                        <View className="items-center">
                                            <Upload size={32} color="#94A3B8" />
                                            <Text className="text-gray-400 mt-2 font-bold">Select Video File</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View>
                                <Text className="text-sm font-semibold text-gray-700 mb-2">
                                    {formData.type === 'youtube' ? 'YouTube ID or Full URL' : 'External Video URL'} *
                                </Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3"
                                    placeholder="https://..."
                                    value={formData.url}
                                    onChangeText={(t) => setFormData({ ...formData, url: t })}
                                />
                            </View>
                        )}

                        {modalError ? <Text className="text-red-500 text-center">{modalError}</Text> : null}

                        <View className="flex-row gap-3 pt-4 mb-6">
                            <TouchableOpacity onPress={() => setIsModalOpen(false)} className="flex-1 bg-white border border-gray-200 py-4 rounded-xl items-center">
                                <Text className="text-gray-700 font-bold">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleSave} disabled={saving} className="flex-1 bg-primary py-4 rounded-xl items-center flex-row justify-center gap-2">
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
                title="Delete Video"
                message={`Delete "${itemToDelete?.name}"?`}
                loading={isDeleting}
            />

            {/* Video Preview Modal */}
            <VideoPreviewModal
                visible={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                url={previewData?.url || ''}
                name={previewData?.name || ''}
                type={previewData?.type || ''}
            />
        </View>
    );
};

const VideoPreviewModal = ({ visible, onClose, url, name, type }: { visible: boolean; onClose: () => void; url: string; name: string; type: string }) => {
    const { width } = useWindowDimensions();
    const isWeb = Platform.OS === 'web';

    return (
        <CustomModal
            visible={visible}
            onClose={onClose}
            title="Video Preview"
            subtitle={name}
            icon={Play}
            width={Platform.OS === 'web' && width >= 980 ? 700 : '95%'}
        >
            <View className="p-2">
                <View className="aspect-video bg-black rounded-2xl overflow-hidden items-center justify-center">
                    {type === 'upload' ? (
                        <View className="items-center">
                            <FileVideo size={48} color="white" />
                            <Text className="text-white mt-4 font-bold">Local File: {name}</Text>
                            <Text className="text-gray-400 text-xs mt-2">{url}</Text>
                            {isWeb && (
                                <TouchableOpacity
                                    onPress={() => window.open(url, '_blank')}
                                    className="mt-6 bg-white px-6 py-2 rounded-full flex-row items-center gap-2"
                                >
                                    <Play size={16} color="black" />
                                    <Text className="font-bold">Play in Browser</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ) : (
                        <View className="items-center">
                            <Globe size={48} color="white" />
                            <Text className="text-white mt-4 font-bold">External Stream ({type})</Text>
                            <Text className="text-gray-400 text-xs mt-2" numberOfLines={1}>{url}</Text>
                            <TouchableOpacity
                                onPress={() => isWeb ? window.open(url, '_blank') : Alert.alert('External Link', url)}
                                className="mt-6 bg-white/20 px-6 py-2 rounded-full flex-row items-center gap-2"
                            >
                                <ExternalLink size={16} color="white" />
                                <Text className="text-white font-bold">Open Link</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                <TouchableOpacity
                    onPress={onClose}
                    className="mt-6 w-full bg-gray-100 py-4 rounded-xl items-center"
                >
                    <Text className="text-gray-700 font-bold">Close</Text>
                </TouchableOpacity>
            </View>
        </CustomModal>
    );
};

export default VideoScreen;
