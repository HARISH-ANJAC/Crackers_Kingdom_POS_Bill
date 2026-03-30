// src/screens/TagScreen.tsx
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
    ActivityIndicator,
    Switch,
} from 'react-native';
import { toast } from '../components/common/Toast';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Tag, Search, Plus, Edit2, Trash2, RefreshCcw, X, Save, Printer, ChevronLeft } from 'lucide-react-native';
import { COLORS } from '../Constants/Colors';
import Header from '../components/Header';
import DataTable, { Column } from '../components/common/DataTable';
import { useAppDispatch, useAppSelector } from '../redux/Store';
import { fetchTags, createTag, updateTag, deleteTag, clearError, resetSuccess } from '../redux/Slice/TagSlice';
import CustomModal from '../components/common/CustomModal';
import ConfirmDelete from '../components/common/ConfirmDelete';
import clsx from 'clsx';
import { exportToCSV, printData, ExportColumn } from '../utils/exportUtils';
import { permissionUtils } from '../utils/permissionUtils';

const TagScreen = ({ navigation }: { navigation?: any }) => {
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const isWeb = Platform.OS === "web" && width >= 980;

    const dispatch = useAppDispatch();
    const { tags, isLoading, error, success } = useAppSelector((state) => state.tags);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
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

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        color: '#6366F1',
        isActive: true,
    });

    useEffect(() => {
        dispatch(fetchTags());
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

    const filteredTags = useMemo(() => {
        return tags.filter(tag => {
            const matchesSearch = searchQuery === '' ||
                tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tag.slug.toLowerCase().includes(searchQuery.toLowerCase());

            const statusStr = String(tag.isActive);
            const matchesStatus = selectedStatus === '' || statusStr === selectedStatus;

            return matchesSearch && matchesStatus;
        });
    }, [tags, searchQuery, selectedStatus]);

    const handleAddPress = () => {
        setModalMode('add');
        setEditingId(null);
        setFormData({
            name: '',
            slug: '',
            color: '#6366F1',
            isActive: true,
        });
        setModalError('');
        setIsModalOpen(true);
    };

    const handleEditPress = (tag: any) => {
        setModalMode('edit');
        setEditingId(tag.id);
        setFormData({
            name: tag.name,
            slug: tag.slug,
            color: tag.color || '#6366F1',
            isActive: tag.isActive,
        });
        setModalError('');
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.slug) {
            setModalError('Name and Slug are required');
            return;
        }

        setSaving(true);
        setModalError('');
        const toastId = toast.loading(modalMode === 'add' ? 'Creating tag...' : 'Saving changes...');
        try {
            if (modalMode === 'add') {
                await dispatch(createTag(formData)).unwrap();
                toast.success('Tag created successfully', { id: toastId });
            } else if (editingId) {
                await dispatch(updateTag({ id: editingId, tagData: formData })).unwrap();
                toast.success('Tag updated successfully', { id: toastId });
            }
        } catch (err: any) {
            setModalError(err || 'Failed to save tag');
            toast.error(err || 'Failed to save tag', { id: toastId });
        } finally {
            setSaving(false);
        }
    };

    const handleDeletePress = (tag: any) => {
        setItemToDelete({ id: tag.id, name: tag.name });
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        setIsDeleting(true);
        const toastId = toast.loading(`Deleting tag "${itemToDelete.name}"...`);
        try {
            await dispatch(deleteTag(itemToDelete.id)).unwrap();
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
            toast.success('Tag deleted successfully', { id: toastId });
        } catch (err: any) {
            toast.error(err || 'Failed to delete tag', { id: toastId });
        } finally {
            setIsDeleting(false);
        }
    };

    const getExportColumns = (): ExportColumn[] => [
        { key: 'name', title: 'Name' },
        { key: 'slug', title: 'Slug' },
        { key: 'color', title: 'Color' },
        { key: 'isActive', title: 'Status', render: (item: any) => item.isActive ? 'Active' : 'Inactive' }
    ];

    const handleDownload = async (format: 'pdf' | 'excel' | 'print') => {
        const data = selectedTags.length > 0
            ? tags.filter(t => selectedTags.includes(t.id))
            : filteredTags;

        if (data.length === 0) {
            toast.warning('No records to export.');
            return;
        }

        const columns = getExportColumns();
        const executeAction = async () => {
            if (format === 'excel') {
                await exportToCSV(data, columns, 'tags_list');
            } else {
                await printData('Tag Management Report', data, columns, format as 'print' | 'pdf');
            }
        };

        if (Platform.OS === 'android') {
            permissionUtils.withPermission('download', executeAction);
        } else {
            executeAction();
        }
    };

    const columns = useMemo<Column[]>(() => [
        {
            key: 'name',
            title: 'Tag Name',
            width: isWeb ? 300 : 200,
            sortable: true,
            render: (item) => (
                <View className="flex-row items-center gap-3">
                    <View
                        style={{ backgroundColor: item.color || '#6366F1' }}
                        className="w-3 h-3 rounded-full"
                    />
                    <View>
                        <Text className="font-semibold text-gray-900">{item.name}</Text>
                        <Text className="text-gray-500 text-xs italic">{item.slug}</Text>
                    </View>
                </View>
            ),
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
                title="Tag Management"
                icon={Tag}
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
                            <Text className="text-2xl font-bold text-gray-800">Tags</Text>
                            <Text className="text-gray-500 text-sm">Manage product labels and markers</Text>
                        </View>

                        <View className="flex-row items-center gap-3">
                            <TouchableOpacity
                                onPress={() => dispatch(fetchTags())}
                                className="p-2.5 bg-white rounded-lg border border-gray-200 shadow-sm"
                            >
                                <RefreshCcw size={18} color="#64748b" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleAddPress}
                                className="py-2.5 px-5 bg-primary rounded-lg flex-row items-center gap-2 shadow-md"
                            >
                                <Plus size={18} color="white" />
                                <Text className="text-white font-bold">Add Tag</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View className="bg-white rounded-xl border border-gray-200 mb-6 shadow-sm p-4">
                    <View className="relative">
                        <View className="absolute left-4 top-0 bottom-0 justify-center z-10">
                            <Search size={20} color="#9CA3AF" />
                        </View>
                        <TextInput
                            placeholder="Search tags..."
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-12 pr-4 py-3 text-sm font-medium"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>

                <DataTable
                    data={filteredTags}
                    columns={columns}
                    isLoading={isLoading}
                    keyExtractor={(item) => item.id}
                    pagination={true}
                    pageSize={10}
                    selectable={true}
                    selectedItems={selectedTags}
                    onSelectAll={(selected) => setSelectedTags(selected ? filteredTags.map(t => t.id) : [])}
                    onSelectItem={(item, selected) => {
                        setSelectedTags(prev => selected ? [...prev, item.id] : prev.filter(id => id !== item.id));
                    }}
                    containerStyle={{
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        backgroundColor: '#FFFFFF',
                    }}
                />
            </ScrollView>

            {/* Add/Edit Modal */}
            <CustomModal
                visible={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={modalMode === 'add' ? 'Add New Tag' : 'Edit Tag'}
                icon={Tag}
                width={isWeb ? 450 : '95%'}
            >
                <View className="gap-5 p-1">
                    <View>
                        <Text className="text-sm font-semibold text-gray-700 mb-2">Tag Name *</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                            placeholder="e.g. Best Selling"
                            value={formData.name}
                            onChangeText={(text) => {
                                setFormData({ ...formData, name: text, slug: text.toLowerCase().replace(/\s+/g, '-') });
                            }}
                        />
                    </View>

                    <View>
                        <Text className="text-sm font-semibold text-gray-700 mb-2">Slug *</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                            placeholder="best-selling"
                            value={formData.slug}
                            onChangeText={(text) => setFormData({ ...formData, slug: text })}
                        />
                    </View>

                    <View>
                        <Text className="text-sm font-semibold text-gray-700 mb-2">Color (Hex Format)</Text>
                        <View className="flex-row items-center gap-3">
                            <TextInput
                                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                                placeholder="#6366F1"
                                value={formData.color}
                                maxLength={7}
                                onChangeText={(text) => setFormData({ ...formData, color: text })}
                            />
                            <View
                                style={{ backgroundColor: formData.color || '#6366F1' }}
                                className="w-12 h-12 rounded-xl border border-gray-200"
                            />
                        </View>
                    </View>

                    <View>
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

                    {modalError ? <Text className="text-red-500 text-center text-sm">{modalError}</Text> : null}

                    <View className="flex-row gap-3 pt-4">
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
            </CustomModal>

            <ConfirmDelete
                visible={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Tag"
                message={`Are you sure you want to delete "${itemToDelete?.name}"?`}
                loading={isDeleting}
            />
        </View>
    );
};

export default TagScreen;
