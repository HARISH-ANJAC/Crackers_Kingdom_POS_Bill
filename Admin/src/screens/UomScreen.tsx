// src/screens/UomScreen.tsx
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
import { Ruler, Search, Plus, Edit2, Trash2, RefreshCcw, X, Save, Printer } from 'lucide-react-native';
import { COLORS } from '../Constants/Colors';
import Header from '../components/Header';
import DataTable, { Column } from '../components/common/DataTable';
import { useAppDispatch, useAppSelector } from '../redux/Store';
import { fetchUoms, createUom, updateUom, deleteUom, clearError, resetSuccess } from '../redux/Slice/UomSlice';
import CustomModal from '../components/common/CustomModal';
import ConfirmDelete from '../components/common/ConfirmDelete';
import clsx from 'clsx';
import { exportToCSV, printData, ExportColumn } from '../utils/exportUtils';
import { permissionUtils } from '../utils/permissionUtils';

const UomScreen = ({ navigation }: { navigation?: any }) => {
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const isWeb = Platform.OS === "web" && width >= 980;

    const dispatch = useAppDispatch();
    const { uoms, isLoading, error, success } = useAppSelector((state) => state.uoms);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const [selectedUoms, setSelectedUoms] = useState<string[]>([]);

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
        code: '',
        description: '',
        isActive: true,
    });

    useEffect(() => {
        dispatch(fetchUoms());
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

    const filteredUoms = useMemo(() => {
        return uoms.filter(uom => {
            const matchesSearch = searchQuery === '' ||
                uom.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                uom.code.toLowerCase().includes(searchQuery.toLowerCase());

            const statusStr = String(uom.isActive);
            const matchesStatus = selectedStatus === '' || statusStr === selectedStatus;

            return matchesSearch && matchesStatus;
        });
    }, [uoms, searchQuery, selectedStatus]);

    const handleAddPress = () => {
        setModalMode('add');
        setEditingId(null);
        setFormData({
            name: '',
            code: '',
            description: '',
            isActive: true,
        });
        setModalError('');
        setIsModalOpen(true);
    };

    const handleEditPress = (uom: any) => {
        setModalMode('edit');
        setEditingId(uom.id);
        setFormData({
            name: uom.name,
            code: uom.code,
            description: uom.description || '',
            isActive: uom.isActive,
        });
        setModalError('');
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.code) {
            setModalError('Name and Code are required');
            return;
        }

        setSaving(true);
        setModalError('');
        const toastId = toast.loading(modalMode === 'add' ? 'Creating Unit of Measure...' : 'Saving changes...');
        try {
            if (modalMode === 'add') {
                await dispatch(createUom(formData)).unwrap();
                toast.success('UOM created successfully', { id: toastId });
            } else if (editingId) {
                await dispatch(updateUom({ id: editingId, uomData: formData })).unwrap();
                toast.success('UOM updated successfully', { id: toastId });
            }
        } catch (err: any) {
            setModalError(err || 'Failed to save UOM');
            toast.error(err || 'Failed to save UOM', { id: toastId });
        } finally {
            setSaving(false);
        }
    };

    const handleDeletePress = (uom: any) => {
        setItemToDelete({ id: uom.id, name: uom.name });
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        setIsDeleting(true);
        const toastId = toast.loading(`Deleting UOM "${itemToDelete.name}"...`);
        try {
            await dispatch(deleteUom(itemToDelete.id)).unwrap();
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
            toast.success('UOM deleted successfully', { id: toastId });
        } catch (err: any) {
            toast.error(err || 'Failed to delete UOM', { id: toastId });
        } finally {
            setIsDeleting(false);
        }
    };

    const getExportColumns = (): ExportColumn[] => [
        { key: 'name', title: 'Name' },
        { key: 'code', title: 'Code' },
        { key: 'description', title: 'Description' },
        { key: 'isActive', title: 'Status', render: (item: any) => item.isActive ? 'Active' : 'Inactive' }
    ];

    const handleDownload = async (format: 'pdf' | 'excel' | 'print') => {
        const data = selectedUoms.length > 0
            ? uoms.filter(u => selectedUoms.includes(u.id))
            : filteredUoms;

        if (data.length === 0) {
            toast.warning('No records to export.');
            return;
        }

        const columns = getExportColumns();
        const executeAction = async () => {
            if (format === 'excel') {
                await exportToCSV(data, columns, 'uom_list');
            } else {
                await printData('UOM Management Report', data, columns, format as 'print' | 'pdf');
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
            title: 'UOM Name',
            width: isWeb ? 250 : 150,
            sortable: true,
            render: (item) => (
                <View>
                    <Text className="font-semibold text-gray-900">{item.name}</Text>
                    <Text className="text-gray-500 text-xs italic">{item.description}</Text>
                </View>
            ),
        },
        {
            key: 'code',
            title: 'Code',
            width: 100,
            sortable: true,
            render: (item) => (
                <View className="bg-gray-100 px-2 py-1 rounded border border-gray-200 self-start">
                    <Text className="text-xs font-bold text-gray-700">{item.code}</Text>
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
                title="UOM Management"
                icon={Ruler}
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
                            <Text className="text-2xl font-bold text-gray-800">Units of Measure</Text>
                            <Text className="text-gray-500 text-sm">Manage product packaging units (e.g. PCS, BOX)</Text>
                        </View>

                        <View className="flex-row items-center gap-3">
                            <TouchableOpacity
                                onPress={() => handleDownload('excel')}
                                className="p-2.5 bg-white rounded-lg border border-gray-200 shadow-sm"
                            >
                                <Printer size={18} color="#64748b" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => dispatch(fetchUoms())}
                                className="p-2.5 bg-white rounded-lg border border-gray-200 shadow-sm"
                            >
                                <RefreshCcw size={18} color="#64748b" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleAddPress}
                                className="py-2.5 px-5 bg-primary rounded-lg flex-row items-center gap-2 shadow-md"
                            >
                                <Plus size={18} color="white" />
                                <Text className="text-white font-bold">Add UOM</Text>
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
                            placeholder="Search UOMs..."
                            placeholderTextColor={'gray'}
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-12 pr-4 py-3 text-sm font-medium"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>

                <DataTable
                    data={filteredUoms}
                    columns={columns}
                    isLoading={isLoading}
                    keyExtractor={(item) => item.id}
                    pagination={true}
                    pageSize={10}
                    selectable={true}
                    selectedItems={selectedUoms}
                    onSelectAll={(selected) => setSelectedUoms(selected ? filteredUoms.map(u => u.id) : [])}
                    onSelectItem={(item, selected) => {
                        setSelectedUoms(prev => selected ? [...prev, item.id] : prev.filter(id => id !== item.id));
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
                title={modalMode === 'add' ? 'Add New UOM' : 'Edit UOM'}
                icon={Ruler}
                width={isWeb ? 450 : '95%'}
            >
                <View className="gap-5 p-1">
                    <View>
                        <Text className="text-sm font-semibold text-gray-700 mb-2">UOM Name *</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                            placeholder="e.g. Piece"
                            placeholderTextColor={'gray'}
                            value={formData.name}
                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                        />
                    </View>

                    <View>
                        <Text className="text-sm font-semibold text-gray-700 mb-2">Code *</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                            placeholder="e.g. PCS"
                            placeholderTextColor={'gray'}
                            autoCapitalize="characters"
                            value={formData.code}
                            onChangeText={(text) => setFormData({ ...formData, code: text.toUpperCase() })}
                        />
                    </View>

                    <View>
                        <Text className="text-sm font-semibold text-gray-700 mb-2">Description</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                            placeholder="Optional description"
                            multiline
                            placeholderTextColor={'gray'}
                            numberOfLines={3}
                            value={formData.description}
                            onChangeText={(text) => setFormData({ ...formData, description: text })}
                        />
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
                title="Delete UOM"
                message={`Are you sure you want to delete "${itemToDelete?.name}"?`}
                loading={isDeleting}
            />
        </View>
    );
};

export default UomScreen;
