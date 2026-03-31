// UserScreen.tsx
import { View, Text, StatusBar, ScrollView, useWindowDimensions, TouchableOpacity, Platform, Image, ActivityIndicator, TextInput, Alert, Linking, Share } from 'react-native';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from '../components/common/Toast';
import Header from '../components/Header';
import { User as UserIcon, Edit2, Trash2, Shield, Key, Eye, ChevronLeft, Search, Printer, RefreshCcw, Save, Plus, X, FileUp } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DataTable, { Column } from '../components/common/DataTable';
import clsx from 'clsx';
import { IMAGES } from '../Constants/Images';
import CustomDropDown from '../components/common/CustomDropDown';
import { COLORS } from '../Constants/Colors';
import { useAppDispatch, useAppSelector } from '../redux/Store';
import { fetchUsers, createUser, updateUser, deleteUser, clearError } from '../redux/Slice/UserSlice';
import { fetchRoles } from '../redux/Slice/RoleSlice';
import CustomModal from '../components/common/CustomModal';
import ConfirmDelete from '../components/common/ConfirmDelete';
import { permissionUtils } from '../utils/permissionUtils';
import { pick, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import { Camera, Video } from 'lucide-react-native';
import { exportToCSV, printData, ExportColumn } from '../utils/exportUtils';
import { formatIdentityDisplay, cleanIdentityInput } from '../utils/Formatter';

const UserScreen = ({ navigation }: { navigation?: any }) => {
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const isWeb = Platform.OS === "web" && width >= 768;

    const dispatch = useAppDispatch();
    const { users, isLoading, error } = useAppSelector((state) => state.users);
    const { roles } = useAppSelector((state) => state.permissions);

    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [viewMode, setViewMode] = useState<'list' | 'details'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const [saving, setSaving] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [modalError, setModalError] = useState('');

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        roleId: '',
        isActive: true,
    });

    useEffect(() => {
        dispatch(fetchUsers());
        dispatch(fetchRoles());
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    // ==================== STATE AND COMPUTED DATA ====================
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    const handleSort = useCallback((key: string, direction: 'asc' | 'desc') => {
        setSortConfig({ key, direction });
    }, []);

    const sortedUsers = useMemo(() => {
        if (!sortConfig) return users;
        return [...users].sort((a, b) => {
            const aVal = a[sortConfig.key as keyof typeof a];
            const bVal = b[sortConfig.key as keyof typeof b];

            if (typeof aVal === 'string' && typeof bVal === 'string') {
                return sortConfig.direction === 'asc'
                    ? aVal.localeCompare(bVal)
                    : bVal.localeCompare(aVal);
            }
            if (aVal === bVal) return 0;
            if (aVal === null || aVal === undefined) return 1;
            if (aVal === null || aVal === undefined) return -1;

            const res = (aVal as any) > (bVal as any) ? 1 : -1;
            return sortConfig.direction === 'asc' ? res : -res;
        });
    }, [users, sortConfig]);

    const filteredUsers = useMemo(() => {
        return sortedUsers.filter(user => {
            const matchesSearch = searchQuery === '' ||
                user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase());

            const statusStr = String(user.isActive !== undefined ? user.isActive : true);
            const matchesStatus = selectedStatus === '' || statusStr === selectedStatus;

            return matchesSearch && matchesStatus;
        });
    }, [sortedUsers, searchQuery, selectedStatus]);

    const handleSelectAll = useCallback((selected: boolean) => {
        setSelectedUsers(selected ? users.map(user => user.id) : []);
    }, [users]);

    const handleSelectItem = useCallback((item: any, selected: boolean) => {
        setSelectedUsers(prev =>
            selected
                ? [...prev, item.id]
                : prev.filter(id => id !== item.id)
        );
    }, []);

    // ==================== ACTION HANDLERS ====================
    const handleAddUser = () => {
        setModalMode('add');
        setEditingUserId(null);
        setFormData({
            name: '',
            email: '',
            phone: '',
            password: '',
            roleId: '',
            isActive: true,
        });
        setModalError('');
        setIsModalOpen(true);
    };

    const handleEditUser = (user: any) => {
        setModalMode('edit');
        setEditingUserId(user.id);
        setFormData({
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            password: '',
            roleId: user.roleId || '',
            isActive: user.isActive !== undefined ? user.isActive : true,
        });
        setModalError('');
        setIsModalOpen(true);
    };

    const handleSaveUser = async () => {
        if (!formData.name || !formData.email || !formData.roleId) {
            setModalError('Please fill in all required fields (Name, Email, Role)');
            return;
        }

        if (modalMode === 'add' && !formData.password) {
            setModalError('Password is required for new users');
            return;
        }

        setSaving(true);
        try {
            if (modalMode === 'add') {
                const resultAction = await dispatch(createUser(formData));
                if (createUser.fulfilled.match(resultAction)) {
                    setIsModalOpen(false);
                    toast.success('User created successfully');
                } else {
                    toast.error('Failed to create user');
                }
            } else if (editingUserId) {
                const { password, ...updateData } = formData;
                const resultAction = await dispatch(updateUser({ id: editingUserId, userData: updateData }));
                if (updateUser.fulfilled.match(resultAction)) {
                    setIsModalOpen(false);
                    toast.success('User updated successfully');
                } else {
                    toast.error('Failed to update user');
                }
            }
        } catch (err) {
            setModalError('An unexpected error occurred');
            toast.error('An unexpected error occurred');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteUser = (user: any) => {
        setUserToDelete({ id: user.id, name: user.name });
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteUser = async () => {
        if (!userToDelete) return;

        setIsDeleting(true);
        try {
            const resultAction = await dispatch(deleteUser(userToDelete.id));
            if (deleteUser.fulfilled.match(resultAction)) {
                setIsDeleteModalOpen(false);
                setUserToDelete(null);
                toast.success('User deleted successfully');
            } else {
                toast.error('Failed to delete user');
            }
        } catch (error) {
            toast.error('Failed to delete user');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleInviteUser = useCallback(async (user: any) => {
        try {
            const message = [
                `🎆 *Welcome to Fireworks POS Platform*`,
                `━━━━━━━━━━━━━━━━━━━━━`,
                `Hello *${user.name}*, your account has been created successfully.`,
                ``,
                `🔐 *Login Credentials*`,
                `━━━━━━━━━━━━━━━━━━━━━`,
                `� *Username:* ${user.email}`,
                `*Password:* ${user.password || 'Set during registration'}`,
                `� *Role:* ${user.roleName || 'User'}`,
                `� *Phone:* ${formatIdentityDisplay(user.phone) || 'N/A'}`,
                ``,
                `Please use the password set during your registration or contact your administrator if you need to reset it.`,
                ``,
                `🚀 _Manage your sales efficiently with Fireworks POS_`
            ].join('\n');

            const result = await Share.share({
                message,
                title: 'User Credentials',
            });

            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    // shared with activity type of result.activityType
                } else {
                    // shared
                }
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    }, []);

    // ==================== EXPORT & PRINT LOGIC ====================
    const getExportColumns = (): ExportColumn[] => [
        { key: 'name', title: 'Name' },
        { key: 'email', title: 'Email' },
        { key: 'phone', title: 'Phone' },
        { key: 'roleName', title: 'Role' },
        { key: 'isActive', title: 'Status', render: (item: any) => item.isActive ? 'Active' : 'Inactive' }
    ];

    const getTargetData = () => {
        const data = selectedUsers.length > 0
            ? users.filter(u => selectedUsers.includes(u.id))
            : filteredUsers;

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
                await exportToCSV(data, columns, 'users_list');
            } else {
                await printData('User Management Report', data, columns, format as 'print' | 'pdf');
            }
        };

        if (Platform.OS === 'android' && format !== 'print') {
            permissionUtils.withPermission('download', executeAction);
        } else {
            executeAction();
        }
    }, [selectedUsers, filteredUsers, users]);


    const handleBackToList = useCallback(() => {
        setViewMode('list');
    }, []);

    const handleImportCSV = useCallback(() => {
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

                console.log('📄 Selected CSV:', file.uri);
                toast.success(`Importing: ${fileName}`);
            } catch (err) {
                if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
                    // Silent cancel
                } else {
                    console.error('Picker error:', err);
                    toast.error('Failed to pick CSV file');
                }
            }
        };

        if (Platform.OS === 'android') {
            permissionUtils.withPermission('csv_import', executeImport);
        } else {
            executeImport();
        }
    }, []);

    // ==================== RENDER COMPONENTS ====================
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
                                {viewMode === 'list' ? 'Users' : 'User Details'}
                            </Text>
                            {viewMode === 'list' && (
                                <View className="px-2.5 py-1 bg-gray-200 rounded-full">
                                    <Text className="text-gray-600 text-xs font-bold">
                                        {users.length} total
                                    </Text>
                                </View>
                            )}
                        </View>
                        <Text className="text-gray-500 text-sm">
                            {viewMode === 'list'
                                ? 'Manage system users and their roles'
                                : 'Viewing detailed information'
                            }
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
                        {viewMode === 'list' ? (
                            <View className="flex-row items-center gap-2">
                                {/* Report Action Group */}
                                <View className="flex-row items-center bg-white rounded-lg border border-gray-200 shadow-sm p-1 mr-2">
                                    <TouchableOpacity
                                        onPress={() => handleDownload('pdf')}
                                        className="p-2 hover:bg-gray-100 rounded-md"
                                        activeOpacity={0.7}
                                    >
                                        <Image
                                            source={IMAGES.PDF}
                                            style={{ width: 20, height: 20, resizeMode: 'contain' }}
                                        />
                                    </TouchableOpacity>

                                    <View className="w-[1px] h-5 bg-gray-200 mx-1" />

                                    <TouchableOpacity
                                        onPress={() => handleDownload('excel')}
                                        className="p-2 hover:bg-gray-100 rounded-md"
                                        activeOpacity={0.7}
                                    >
                                        <Image
                                            source={IMAGES.EXCEL}
                                            style={{ width: 20, height: 20, resizeMode: 'contain' }}
                                        />
                                    </TouchableOpacity>

                                    <View className="w-[1px] h-5 bg-gray-200 mx-1" />

                                    <TouchableOpacity
                                        onPress={() => handleDownload('print')}
                                        className="p-2 hover:bg-gray-100 rounded-md"
                                        activeOpacity={0.7}
                                    >
                                        <Printer size={20} color="#475569" />
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity
                                    onPress={handleImportCSV}
                                    className="p-2.5 bg-white rounded-lg border border-gray-200 shadow-sm"
                                >
                                    <FileUp size={18} color={COLORS.primary} />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => dispatch(fetchUsers())}
                                    className="p-2.5 bg-white rounded-lg border border-gray-200 shadow-sm"
                                >
                                    <RefreshCcw size={18} color="#64748b" />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={handleAddUser}
                                    className="py-2.5 px-5 bg-primary rounded-lg flex-row items-center gap-2 shadow-md"
                                >
                                    <Plus size={18} color="white" />
                                    <Text className="text-white font-bold">Add User</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                onPress={handleSaveUser}
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

    const renderFilters = () => {
        if (viewMode !== 'list') return null;

        return (
            <View className="bg-white rounded-xl border border-gray-200 mb-6 shadow-sm z-10">
                <View className="p-4 md:p-6">
                    <View className={clsx(
                        "gap-4 md:gap-6",
                        // On web, keep horizontal layout; on mobile/tablet, stack vertically
                        isWeb ? "flex-row items-center justify-between" : "flex-col"
                    )}>
                        {/* Search Input - Takes remaining space on web, full width on mobile */}
                        <View className={clsx(
                            "relative",
                            isWeb ? "flex-1" : "w-full"
                        )}>
                            <View className="absolute left-4 top-0 bottom-0 justify-center z-10">
                                <Search
                                    size={20}
                                    color={searchQuery ? COLORS.primary : "#9CA3AF"}
                                />
                            </View>
                            <TextInput
                                placeholder="Search users by name or email..."
                                className={clsx(
                                    "w-full bg-white border-2 rounded-xl text-gray-800",
                                    "focus:border-primary transition-all duration-200",
                                    "border-gray-300/80",
                                    // Adjust padding based on platform for better alignment
                                    Platform.OS === 'android'
                                        ? "pl-12 pr-12 py-4"
                                        : "pl-12 pr-12 py-3"
                                )}
                                style={{
                                    textAlignVertical: 'center',
                                    includeFontPadding: false,
                                }}
                                placeholderTextColor="#9CA3AF"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
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

                        {/* Status Filter Dropdown */}
                        <View className={clsx(
                            isWeb ? "w-[240px]" : "w-full",
                            // Add margin top on mobile for better spacing
                            !isWeb && "mt-2"
                        )}>
                            <CustomDropDown
                                placeholder="Filter by status"
                                items={[
                                    { label: 'All Status', value: '' },
                                    { label: 'Active', value: 'true' },
                                    { label: 'Inactive', value: 'false' },
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


    const columns = useMemo<Column[]>(() => [
        {
            key: 'name',
            title: 'User Information',
            width: isWeb ? 280 : 200,
            // flex: isWeb ? 1 : 0,
            sortable: true,
            render: (item) => (
                <View>
                    <Text className="font-semibold text-gray-900">{item.name}</Text>
                    <Text className="text-gray-500 text-xs">{item.email}</Text>
                </View>
            ),
        },
        {
            key: 'roleName',
            title: 'Role',
            width: isWeb ? 130 : 120,
            sortable: true,
            render: (item) => (
                <View className="px-3 py-1 bg-indigo-50 rounded-full">
                    <Text className="text-indigo-700 text-xs font-bold">{item.roleName || 'User'}</Text>
                </View>
            ),
        },
        {
            key: 'phone',
            title: 'Phone',
            width: isWeb ? 140 : 120,
            sortable: true,
            render: (item) => (
                <Text className="text-gray-700 text-sm font-medium">
                    {formatIdentityDisplay(item.phone || '') || 'N/A'}
                </Text>
            ),
        },
        {
            key: 'isActive',
            title: 'Status',
            width: isWeb ? 120 : 100,
            render: (item) => (
                <View className={clsx(
                    "px-3 py-1 rounded-full",
                    item.isActive ? "bg-green-50" : "bg-red-50"
                )}>
                    <Text className={clsx(
                        "text-xs font-bold uppercase",
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
            width: isWeb ? 165 : 145,
            align: 'center' as const,
            render: (item) => (
                <View className="flex-row items-center gap-2 px-4 ">
                    <TouchableOpacity
                        onPress={() => handleEditUser(item)}
                        className="p-2 bg-blue-50 rounded-lg border border-blue-100"
                    >
                        <Edit2 size={16} color="#2563EB" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => handleDeleteUser(item)}
                        className="p-2 bg-red-50 rounded-lg border border-red-100"
                    >
                        <Trash2 size={16} color="#DC2626" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleInviteUser(item)}
                        className='bg-primary px-3.5 py-1.5 rounded-lg capitalize'>
                        <Text className='text-white font-bold'>Invite</Text>
                    </TouchableOpacity>


                </View>
            ),
        },
    ], [isWeb, handleEditUser, handleDeleteUser, handleInviteUser]);

    const totalTableWidth = useMemo(() => {
        const checkboxWidth = isWeb ? 52 : 48;
        const columnsWidth = columns.reduce((acc, col) => acc + (col.width || 100), 0);
        return checkboxWidth + columnsWidth;
    }, [columns, isWeb]);

    return (
        <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            <Header
                title="User Management"
                icon={UserIcon}
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

                <DataTable
                    data={filteredUsers}
                    columns={columns}
                    keyExtractor={(item) => item.id}
                    isLoading={isLoading}
                    pagination={true}
                    pageSize={10}
                    selectable={true}
                    selectedItems={selectedUsers}
                    onSelectAll={handleSelectAll}
                    onSelectItem={handleSelectItem}
                    sortable={true}
                    onSort={handleSort}
                    containerStyle={{
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        backgroundColor: '#FFFFFF',
                    }}
                    minTableWidth={totalTableWidth + 50}
                    horizontalScroll={!isWeb || width < totalTableWidth}
                />

                {selectedUsers.length > 0 && (
                    <View className="mt-5 p-4 bg-blue-50 rounded-xl flex-row justify-between items-center border border-blue-100">
                        <Text className="text-blue-800 text-sm md:text-base font-semibold">
                            {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
                        </Text>
                        <TouchableOpacity
                            onPress={() => setSelectedUsers([])}
                            className="bg-blue-100 px-4 py-2 rounded-lg"
                        >
                            <Text className="text-blue-800 font-bold text-sm">
                                Clear Selection
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            <CustomModal
                visible={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={modalMode === 'add' ? 'Create New User' : 'Edit User'}
                subtitle={modalMode === 'add' ? 'Add a new system user and assign roles' : 'Modify existing user details and permissions'}
                icon={UserIcon}
                width={isWeb ? 650 : '95%'}
            >
                <View className="gap-5 p-1">
                    <View className={clsx(isWeb ? "flex-row gap-4" : "gap-4")}>
                        <View className="flex-1">
                            <Text className='text-sm font-semibold text-gray-700 mb-2'>Name <Text className='text-red-600'>*</Text></Text>
                            <TextInput
                                value={formData.name}
                                placeholderTextColor="#9CA3AF"
                                onChangeText={(text) => setFormData({ ...formData, name: text })}
                                placeholder="Enter full name"
                                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:border-primary"
                            />
                        </View>
                        <View className="flex-1">
                            <Text className='text-sm font-semibold text-gray-700 mb-2'>Email Address <Text className='text-red-600'>*</Text></Text>
                            <TextInput
                                value={formData.email}
                                onChangeText={(text) => setFormData({ ...formData, email: text })}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                placeholderTextColor="#9CA3AF"
                                placeholder="email@example.com"
                                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:border-primary"
                            />
                        </View>
                    </View>

                    <View className={clsx(isWeb ? "flex-row gap-4" : "gap-4")}>
                        <View className="flex-1">
                            <Text className='text-sm font-semibold text-gray-700 mb-2'>Phone Number <Text className='text-red-600'>*</Text></Text>
                            <TextInput
                                value={formatIdentityDisplay(formData.phone)}
                                placeholderTextColor="#9CA3AF"
                                onChangeText={(text) => setFormData({ ...formData, phone: cleanIdentityInput(text) })}
                                keyboardType="phone-pad"
                                placeholder="+91 00000 00000"
                                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:border-primary"
                            />
                        </View>
                        {modalMode === 'add' && (
                            <View className="flex-1">
                                <Text className='text-sm font-semibold text-gray-700 mb-2'>Password <Text className='text-red-600'>*</Text></Text>
                                <TextInput
                                    value={formData.password}
                                    placeholderTextColor="#9CA3AF"
                                    onChangeText={(text) => setFormData({ ...formData, password: text })}
                                    secureTextEntry
                                    placeholder="Min 6 characters"
                                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:border-primary"
                                />
                            </View>
                        )}
                    </View>

                    <View>
                        <Text className='text-sm font-semibold text-gray-700 mb-2'>User Role <Text className='text-red-600'>*</Text></Text>
                        <CustomDropDown
                            placeholder="Select a role"
                            items={roles.filter(role => role.isActive === true).map(role => ({ label: role.name, value: role.id }))}
                            selectedValue={formData.roleId}
                            onSelect={(value) => setFormData({ ...formData, roleId: Array.isArray(value) ? value[0] : value })}
                            searchable={false}
                            className="w-full"
                        />
                    </View>
                    <View className="relative z-0 flex-row items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <View>
                            <Text className="text-base font-bold text-gray-800">Account Status</Text>
                            <Text className="text-xs text-gray-500">Enable or disable user access</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => setFormData({ ...formData, isActive: !formData.isActive })}
                            className={clsx(
                                "w-12 h-6 rounded-full px-1 justify-center",
                                formData.isActive ? "bg-primary" : "bg-gray-300"
                            )}
                        >
                            <View className={clsx(
                                "w-4 h-4 bg-white rounded-full",
                                formData.isActive ? "self-end" : "self-start"
                            )} />
                        </TouchableOpacity>
                    </View>

                    {modalError ? (
                        <View className="bg-red-50 p-3 rounded-lg border border-red-100">
                            <Text className="text-red-600 text-sm text-center">{modalError}</Text>
                        </View>
                    ) : null}

                    <View className="flex-row gap-3 pt-4">
                        <TouchableOpacity
                            onPress={() => setIsModalOpen(false)}
                            className="flex-1 bg-white border border-gray-200 py-3.5 rounded-xl items-center"
                        >
                            <Text className="text-gray-700 font-bold">Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleSaveUser}
                            disabled={saving}
                            className="flex-1 bg-primary py-3.5 rounded-xl items-center justify-center flex-row gap-2"
                        >
                            {saving ? <ActivityIndicator size="small" color="white" /> : <Save size={18} color="white" />}
                            <Text className="text-white font-bold">{modalMode === 'add' ? 'Create User' : 'Save Changes'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </CustomModal>

            <ConfirmDelete
                visible={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDeleteUser}
                itemName={userToDelete?.name}
                loading={isDeleting}
                message="Are you sure you want to delete this user? This action will permanently remove their access to the system."
            />
        </View>
    );
};

export default React.memo(UserScreen);

