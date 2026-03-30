// src/screens/RoleScreen.tsx
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    useWindowDimensions,
    TextInput,
} from 'react-native';
import { toast } from '../components/common/Toast';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Shield, Plus, Save, X, Printer, RefreshCcw, Edit2, Trash2, ChevronLeft, Search, Filter, FileUp } from 'lucide-react-native';
import Header from '../components/Header';
import DataTable, { Column } from '../components/common/DataTable';
import CustomDropDown from '../components/common/CustomDropDown';
import { COLORS } from '../Constants/Colors';
import { useAppDispatch, useAppSelector } from '../redux/Store';
import { fetchRoles, fetchPermissionMetadata, fetchRolePermissions } from '../redux/Slice/RoleSlice';
import api from '../services/api';
import { IMAGES } from '../Constants/Images';
import clsx from 'clsx';
import CustomModal from '../components/common/CustomModal';
import ConfirmDelete from '../components/common/ConfirmDelete';
import { permissionUtils } from '../utils/permissionUtils';
import { pick, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import { exportToCSV, printData, ExportColumn } from '../utils/exportUtils';
import { formatDate } from '../utils/DateFunctions';

const RoleScreen = () => {
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const isWeb = Platform.OS === "web" && width >= 768;
    const isTablet = width >= 768 && width < 1024;

    const dispatch = useAppDispatch();
    const { roles, modules, isLoading } = useAppSelector((state) => state.permissions);

    // State management
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'permissions'>('list');
    const [permissions, setPermissions] = useState<any[]>([]);
    const [saving, setSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    // Modal State
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
    const [roleName, setRoleName] = useState('');
    const [roleDescription, setRoleDescription] = useState('');
    const [modalError, setModalError] = useState('');

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState<{ id: string; name: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        dispatch(fetchRoles());
        dispatch(fetchPermissionMetadata());
    }, [dispatch]);

    useEffect(() => {
        if (selectedRole && viewMode === 'permissions') {
            dispatch(fetchRolePermissions(selectedRole)).then((action: any) => {
                if (action.payload) {
                    setPermissions(action.payload);
                }
            });
        }
    }, [selectedRole, viewMode, dispatch]);

    const handleSelectRoleForPermissions = (roleId: string) => {
        setSelectedRole(roleId);
        setViewMode('permissions');
    };

    // Filter roles based on search and status
    const filteredRoles = useMemo(() => {
        return roles.filter(role => {
            const matchesSearch = searchQuery === '' ||
                role.name.toLowerCase().includes(searchQuery.toLowerCase());

            // Use isActive from schema
            const statusValue = role.isActive !== false;
            const matchesStatus = selectedStatus === '' ||
                (selectedStatus === 'active' && statusValue) ||
                (selectedStatus === 'inactive' && !statusValue);

            return matchesSearch && matchesStatus;
        });
    }, [roles, searchQuery, selectedStatus]);

    // ==================== EXPORT & PRINT LOGIC ====================
    const getExportColumns = (): ExportColumn[] => [
        { key: 'name', title: 'Role Name' },
        { key: 'createdAt', title: 'Created At', render: (item: any) => item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A' },
        { key: 'status', title: 'Status', render: (item: any) => item.isActive !== false ? 'Active' : 'Inactive' }
    ];

    const getTargetData = () => {
        const data = selectedItems.length > 0
            ? roles.filter(r => selectedItems.includes(r.id))
            : filteredRoles;

        if (data.length === 0) {
            toast.warning('There are no records available to export.');
            return null;
        }
        return data;
    };

    const handleDownload = useCallback(async (format: 'pdf' | 'excel' | 'print') => {
        const data = getTargetData();
        if (!data) return;

        const columns = getExportColumns();
        const executeAction = async () => {
            if (format === 'excel') {
                await exportToCSV(data, columns, 'roles_list');
            } else {
                await printData('Roles & Permissions Report', data, columns, format as 'print' | 'pdf');
            }
        };

        if (Platform.OS === 'android') {
            permissionUtils.withPermission('download', executeAction);
        } else {
            executeAction();
        }
    }, [selectedItems, filteredRoles, roles]);


    const handleImportCSV = () => {
        const executeImport = async () => {
            try {
                const res = await pick({
                    type: [types.csv, types.xlsx],
                });

                const file = res[0];
                const fileName = file.name || 'Unknown';

                if (!fileName.toLowerCase().endsWith('.csv') && !fileName.toLowerCase().endsWith('.xlsx')) {
                    toast.error('Please select a valid CSV or XLSX file.');
                    return;
                }

                console.log('📄 Role Import:', file.uri);
                toast.success(`Importing Roles from: ${fileName}`);
            } catch (err) {
                if (!(isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED)) {
                    toast.error('Failed to pick CSV file');
                }
            }
        };

        if (Platform.OS === 'android') {
            permissionUtils.withPermission('csv_import', executeImport);
        } else {
            executeImport();
        }
    };

    const handleBackToList = () => {
        setViewMode('list');
        setSelectedRole(null);
    };



    const handlePermissionChange = async (
        moduleId: string,
        actionId: string,
        value: boolean
    ) => {
        setPermissions((prev) => {
            const existing = prev.find(
                (p) => p.moduleId === moduleId && p.actionId === actionId
            );

            if (existing) {
                return prev.map((p) =>
                    p.moduleId === moduleId && p.actionId === actionId
                        ? { ...p, isAllowed: value }
                        : p
                );
            } else {
                return [
                    ...prev,
                    {
                        roleId: selectedRole,
                        moduleId,
                        actionId,
                        isAllowed: value,
                        allowAll: false,
                    },
                ];
            }
        });
    };

    const renderHeader = () => (
        <View className="mb-6">
            <View className={clsx(
                "mb-2",
                isWeb ? "flex-row items-center justify-between" : "flex-col items-start gap-4"
            )}>
                <View className="flex-row items-center gap-3">
                    {viewMode === 'permissions' && (
                        <TouchableOpacity
                            onPress={handleBackToList}
                            className="p-2 bg-white rounded-lg border border-gray-200"
                        >
                            <ChevronLeft size={20} color="#374151" />
                        </TouchableOpacity>
                    )}
                    <View>
                        <Text className="text-2xl font-bold text-gray-800">
                            {viewMode === 'list' ? 'Roles' : 'Edit Permissions'}
                        </Text>
                        <Text className="text-gray-500 text-sm">
                            {viewMode === 'list'
                                ? 'Manage system roles and permissions'
                                : `Managing permissions for ${roles.find(r => r.id === selectedRole)?.name || 'Role'}`
                            }
                        </Text>
                    </View>
                </View>

                {/* Actions: PDF, Excel, etc - Always on right side on web */}
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
                        {viewMode === 'list' ? (
                            <View className="flex-row items-center gap-2">
                                {/* Report Action Group */}
                                <View className="flex-row items-center bg-white rounded-lg border border-gray-200 p-1 mr-1">
                                    <TouchableOpacity
                                        onPress={() => handleDownload('pdf')}
                                        className="p-1.5 hover:bg-gray-100 rounded"
                                    >
                                        <Image source={IMAGES.PDF} style={{ width: 22, height: 22, resizeMode: 'contain' }} />
                                    </TouchableOpacity>

                                    <View className="w-[1px] h-4 bg-gray-200 mx-1" />

                                    <TouchableOpacity
                                        onPress={() => handleDownload('excel')}
                                        className="p-1.5 hover:bg-gray-100 rounded"
                                    >
                                        <Image source={IMAGES.EXCEL} style={{ width: 22, height: 22, resizeMode: 'contain' }} />
                                    </TouchableOpacity>

                                    <View className="w-[1px] h-4 bg-gray-200 mx-1" />

                                    <TouchableOpacity
                                        onPress={() => handleDownload('print')}
                                        className="p-1.5 hover:bg-gray-100 rounded"
                                    >
                                        <Printer size={18} color="#64748b" />
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity
                                    onPress={handleImportCSV}
                                    className="p-2.5 bg-white rounded-lg border border-gray-200 shadow-sm"
                                >
                                    <FileUp size={18} color={COLORS.primary} />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => dispatch(fetchRoles())}
                                    className="p-2.5 bg-white rounded-lg border border-gray-200 shadow-sm"
                                >
                                    <RefreshCcw size={18} color="#64748b" />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={handleAddRole}
                                    className="py-2.5 px-5 bg-primary rounded-lg flex-row items-center gap-2 shadow-md"
                                >
                                    <Plus size={18} color="white" />
                                    <Text className="text-white font-bold">Add Role</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                onPress={handleSavePermissions}
                                disabled={saving}
                                className="bg-primary px-5 py-2.5 rounded-lg flex-row items-center gap-2"
                            >
                                {saving ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <>
                                        <Save size={18} color="white" />
                                        <Text className="text-white font-semibold">Save Changes</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        )}
                    </ScrollView>
                </View>
            </View>
        </View>
    );

    const handleAddRole = () => {
        setModalMode('add');
        setEditingRoleId(null);
        setRoleName('');
        setRoleDescription('');
        setSelectedStatus('active');
        setModalError('');
        setIsModalOpen(true);
    };

    const handleEditRole = (role: any) => {
        setModalMode('edit');
        setEditingRoleId(role.id);
        setRoleName(role.name);
        setRoleDescription(role.description || '');
        setSelectedStatus(role.isActive !== false ? 'active' : 'inactive');
        setModalError('');
        setIsModalOpen(true);
    };

    const handleSaveRole = async () => {
        if (!roleName.trim()) {
            setModalError('Role name is required');
            return;
        }

        setSaving(true);
        setModalError('');

        try {
            const payload = {
                name: roleName,
                description: roleDescription,
                isActive: selectedStatus === 'active'
            };

            if (modalMode === 'add') {
                const response = await api.post('/users/roles', payload);
                if (response.data.success) {
                    toast.success('Role created successfully');
                    dispatch(fetchRoles()); // Refresh list
                    setIsModalOpen(false);
                }
            } else {
                const response = await api.put(`/users/roles/${editingRoleId}`, payload);
                if (response.data.success) {
                    toast.success('Role updated successfully');
                    dispatch(fetchRoles()); // Refresh list
                    setIsModalOpen(false);
                }
            }
        } catch (error: any) {
            setModalError(error.response?.data?.msg || 'Failed to save role');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteRole = (role: any) => {
        setRoleToDelete({ id: role.id, name: role.name });
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteRole = async () => {
        if (!roleToDelete) return;

        setIsDeleting(true);
        try {
            const response = await api.delete(`/users/roles/${roleToDelete.id}`);
            if (response.data.success) {
                setIsDeleteModalOpen(false);
                setRoleToDelete(null);
                toast.success('Role deleted successfully');
                dispatch(fetchRoles());
            }
        } catch (error: any) {
            toast.error(error.response?.data?.msg || 'Failed to delete role');
        } finally {
            setIsDeleting(false);
        }
    };

    const columns: Column[] = useMemo(() => [
        {
            key: 'name',
            title: 'Role',
            width: isWeb ? 300 : 200,
            flex: isWeb ? 1 : 0,
            sortable: true,
            render: (item: any) => (
                <View>
                    <Text className="font-semibold text-gray-900">{item.name}</Text>
                    {item.description && (
                        <Text className="text-xs text-gray-500 mt-0.5" numberOfLines={1}>
                            {item.description}
                        </Text>
                    )}
                </View>
            )
        },
        {
            key: 'createdAt',
            title: 'Create Date',
            width: isWeb ? 200 : 150,
            sortable: true,
            render: (item: any) => (
                <Text className="text-gray-500">
                    {item.createdAt ? formatDate(item.createdAt) : 'N/A'}
                </Text>
            )
        },
        {
            key: 'status',
            title: 'Status',
            width: isWeb ? 150 : 120,
            render: (item: any) => (
                <View className={clsx(
                    "px-3 py-1 rounded-full items-center justify-center self-start",
                    item.isActive !== false ? "bg-green-100" : "bg-red-100"
                )}>
                    <Text className={clsx(
                        "text-[10px] font-bold uppercase",
                        item.isActive !== false ? "text-green-700" : "text-red-700"
                    )}>
                        {item.isActive !== false ? "Active" : "Inactive"}
                    </Text>
                </View>
            )
        },
        {
            key: 'action',
            title: 'Actions',
            width: isWeb ? 120 : 120,
            align: 'center',
            render: (item: any) => (
                <View className="flex-row items-center gap-2">
                    <TouchableOpacity
                        onPress={() => handleSelectRoleForPermissions(item.id)}
                        className="p-2 bg-indigo-50 rounded-lg border border-indigo-100"
                    >
                        <Shield size={16} color="#4F46E5" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleEditRole(item)}
                        className="p-2 bg-blue-50 rounded-lg border border-blue-100"
                    >
                        <Edit2 size={16} color="#2563EB" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleDeleteRole(item)}
                        className="p-2 bg-red-50 rounded-lg border border-red-100"
                    >
                        <Trash2 size={16} color="#DC2626" />
                    </TouchableOpacity>
                </View>
            )
        }
    ], [isWeb, selectedRole]);

    const renderFilters = () => {
        if (viewMode !== 'list') return null;

        return (
            <View className="bg-white rounded-xl border border-gray-200 mb-6 shadow-sm z-10">
                <View className="p-4 md:p-6">
                    <View className={clsx(
                        "gap-4 md:gap-6",
                        isWeb ? "flex-row items-center justify-between" : "flex-col"
                    )}>
                        {/* Search Bar */}
                        <View className={clsx("flex-1", !isWeb && "w-full")}>
                            <View className="relative">
                                <View className="absolute left-4 top-0 bottom-0 justify-center z-10">
                                    <Search
                                        size={20}
                                        color={searchQuery ? COLORS.primary : "#9CA3AF"}
                                    />
                                </View>
                                <TextInput
                                    placeholder="Search roles by name..."
                                    className={clsx(
                                        "w-full bg-white border-2 rounded-xl text-gray-800",
                                        "focus:border-primary transition-all duration-200",
                                        "border-gray-300/80",
                                        Platform.OS === 'android' ? "pl-12 pr-10 py-4" : "pl-12 pr-10 py-3"
                                    )}
                                    style={{
                                        textAlignVertical: 'center', // Fix vertical alignment on Android
                                        includeFontPadding: false,   // Remove extra font padding on Android
                                    }}
                                    placeholderTextColor="#9CA3AF"
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    clearButtonMode="while-editing"
                                />
                                {searchQuery && (
                                    <TouchableOpacity
                                        onPress={() => setSearchQuery('')}
                                        className="absolute right-4 top-0 bottom-0 justify-center z-10"
                                        activeOpacity={0.7}
                                    >
                                        <View className="bg-gray-200/80 rounded-full p-1">
                                            <X size={12} color="#4B5563" />
                                        </View>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        {/* Status Filter */}
                        <View className={clsx(isWeb ? "w-[240px]" : "w-full")}>
                            <CustomDropDown
                                placeholder="Filter by status"
                                items={[
                                    { label: 'All Status', value: '' },
                                    { label: 'Active', value: 'active' },
                                    { label: 'Inactive', value: 'inactive' },
                                ]}
                                selectedValue={selectedStatus}
                                onSelect={(value) => {
                                    setSelectedStatus(Array.isArray(value) ? value[0] : value);
                                }}
                                searchable={false}
                                showClear={true}
                                className="w-full"
                            />
                        </View>
                    </View>
                </View>
            </View>
        );
    };
    const handleSavePermissions = async () => {
        if (!selectedRole) return;

        setSaving(true);
        try {
            await api.post('/users/role-permissions', {
                roleId: selectedRole,
                permissions: permissions.map((p) => ({
                    moduleId: p.moduleId,
                    actionId: p.actionId,
                    isAllowed: p.isAllowed,
                    allowAll: p.allowAll || false,
                })),
            });

            toast.success('Permissions updated successfully');
        } catch (error) {
            toast.error('Failed to update permissions');
        } finally {
            setSaving(false);
        }
    };

    const actions = [
        { id: 'read', label: 'Read' },
        { id: 'write', label: 'Write' },
        { id: 'create', label: 'Create' },
        { id: 'delete', label: 'Delete' },
        { id: 'import', label: 'Import' },
        { id: 'export', label: 'Export' },
    ];

    return (
        <View className="flex-1 bg-background-light">
            <Header
                title="Roles & Permissions"
                icon={Shield}
                showSearch={false}
            />

            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    paddingBottom: insets.bottom + 20,
                    paddingHorizontal: isWeb ? 32 : 16,
                    paddingTop: isWeb ? 32 : 16,
                }}
            >
                {renderHeader()}
                {renderFilters()}

                {viewMode === 'list' ? (
                    <DataTable
                        data={filteredRoles}
                        columns={columns}
                        keyExtractor={(item) => item.id}
                        isLoading={isLoading}
                        pagination={true}
                        pageSize={10}
                        selectable={true}
                        selectedItems={selectedItems}
                        onSelectItem={(item, selected) => {
                            setSelectedItems(prev =>
                                selected ? [...prev, item.id] : prev.filter(id => id !== item.id)
                            );
                        }}
                        onSelectAll={(selected) => {
                            setSelectedItems(selected ? roles.map(r => r.id) : []);
                        }}
                        containerStyle={{
                            borderRadius: 16,
                            borderWidth: 1,
                            borderColor: '#E5E7EB',
                        }}
                    />
                ) : (
                    <View className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-extrabold text-gray-900">
                                Module Permissions
                            </Text>
                        </View>

                        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                            <View className="min-w-full">
                                {/* Header */}
                                <View className="flex-row bg-gray-50/80 rounded-t-xl border-b border-gray-200">
                                    <View className="w-64 p-5">
                                        <Text className="font-bold text-gray-600 uppercase text-xs tracking-wider">Module Name</Text>
                                    </View>
                                    {actions.map((action) => (
                                        <View key={action.id} className="w-28 p-5 items-center">
                                            <Text className="font-bold text-gray-600 uppercase text-xs tracking-wider">
                                                {action.label}
                                            </Text>
                                        </View>
                                    ))}
                                </View>

                                {/* Modules */}
                                {modules.map((module: any, index: number) => {
                                    const modulePermissions = permissions.filter(
                                        (p) => p.moduleId === module.id
                                    );

                                    return (
                                        <View
                                            key={module.id}
                                            className={clsx(
                                                "flex-row border-b border-gray-100 items-center",
                                                index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                                            )}
                                        >
                                            <View className="w-64 p-5">
                                                <Text className="font-semibold text-gray-800">
                                                    {module.name}
                                                </Text>
                                                <Text className="text-gray-400 text-xs">{module.slug || 'System Module'}</Text>
                                            </View>
                                            {actions.map((action) => {
                                                const permission = modulePermissions.find(
                                                    (p) => p.actionId === action.id
                                                );
                                                const isAllowed = permission?.isAllowed || false;

                                                return (
                                                    <TouchableOpacity
                                                        key={action.id}
                                                        className="w-28 p-5 items-center"
                                                        onPress={() =>
                                                            handlePermissionChange(
                                                                module.id,
                                                                action.id,
                                                                !isAllowed
                                                            )
                                                        }
                                                    >
                                                        <View
                                                            className={clsx(
                                                                "w-6 h-6 rounded-md border-2 items-center justify-center transition-colors",
                                                                isAllowed
                                                                    ? 'bg-primary border-primary'
                                                                    : 'bg-white border-gray-300'
                                                            )}
                                                        >
                                                            {isAllowed && (
                                                                <Text className="text-white text-xs font-bold">✓</Text>
                                                            )}
                                                        </View>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    );
                                })}
                            </View>
                        </ScrollView>
                    </View>
                )}
            </ScrollView>

            {/* Add/Edit Role Modal */}
            <CustomModal
                visible={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={modalMode === 'add' ? 'Create New Role' : 'Edit Role'}
                subtitle={modalMode === 'add' ? 'Define a new system role and assign its properties' : 'Modify existing role name and basic configuration'}
                icon={Shield}
                width={isWeb ? 550 : '95%'}
            >
                <View className="gap-6">
                    {/* Role Name */}
                    <View>
                        <Text className="text-sm font-semibold text-gray-700 mb-2">
                            Role Name <Text className="text-red-500">*</Text>
                        </Text>
                        <TextInput
                            value={roleName}
                            onChangeText={setRoleName}
                            placeholder="Enter Role Name"
                            className={clsx(
                                "bg-white border rounded-xl px-4 py-3 text-gray-800",
                                modalError ? "border-red-500" : "border-gray-200 focus:border-primary"
                            )}
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>

                    {/* Role Description */}
                    <View>
                        <Text className="text-sm font-semibold text-gray-700 mb-2">
                            Description
                        </Text>
                        <TextInput
                            value={roleDescription}
                            onChangeText={setRoleDescription}
                            placeholder="Briefly describe this role's purpose"
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                            className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:border-primary min-h-[100px]"
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>

                    {/* Status Toggle */}
                    <View className="flex-row items-center justify-between">
                        <Text className="text-sm font-semibold text-gray-700">
                            Status
                        </Text>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => setSelectedStatus(selectedStatus === 'active' ? 'inactive' : 'active')}
                            className={clsx(
                                "w-12 h-7 rounded-full p-1 transition-all duration-200",
                                selectedStatus === 'active' ? "bg-primary" : "bg-gray-200"
                            )}
                        >
                            <View
                                className={clsx(
                                    "w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200",
                                    selectedStatus === 'active' ? "translate-x-5" : "translate-x-0"
                                )}
                            />
                        </TouchableOpacity>
                    </View>

                    {modalError ? (
                        <View className="bg-red-50 p-3 rounded-lg flex-row items-center">
                            <Text className="text-red-500 text-sm flex-1">
                                {modalError}
                            </Text>
                        </View>
                    ) : null}

                    {/* Footer Actions */}
                    <View className="flex-row gap-3 pt-2 justify-end">
                        <TouchableOpacity
                            onPress={() => setIsModalOpen(false)}
                            disabled={saving}
                            className="bg-gray-800 py-2.5 px-6 rounded-lg items-center"
                        >
                            <Text className="font-semibold text-white">Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleSaveRole}
                            disabled={saving}
                            className={clsx(
                                "py-2.5 px-6 rounded-lg items-center flex-row justify-center gap-2",
                                saving ? "bg-primary/70" : "bg-primary"
                            )}
                        >
                            {saving && <ActivityIndicator size="small" color="white" />}
                            <Text className="font-bold text-white">
                                {modalMode === 'add' ? 'Create Role' : 'Save Changes'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </CustomModal>

            {/* Confirm Delete Modal */}
            <ConfirmDelete
                visible={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDeleteRole}
                itemName={roleToDelete?.name}
                loading={isDeleting}
                message="Are you sure you want to delete this role? This will also remove all associated permissions and may affect users assigned to this role."
            />
        </View>
    );
};

export default RoleScreen;