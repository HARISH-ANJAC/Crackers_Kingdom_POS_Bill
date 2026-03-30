import {
    View,
    Text,
    StatusBar,
    Platform,
    ScrollView,
    useWindowDimensions,
    TouchableOpacity,
    TextInput,
    Alert,
    Modal,
    ActivityIndicator,
    KeyboardAvoidingView,
} from 'react-native';
import { toast } from '../components/common/Toast';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    Users,
    Search,
    RefreshCcw,
    Printer,
    FileText,
    TrendingUp,
    Phone,
    Mail,
    MapPin,
    Edit2,
    Trash2,
    Plus,
    X,
    User,
    CheckCircle,
    AlertCircle,
} from 'lucide-react-native';
import { COLORS } from '../Constants/Colors';
import Header from '../components/Header';
import DataTable, { Column } from '../components/common/DataTable';
import { useAppDispatch, useAppSelector } from '../redux/Store';
import { formatIdentityDisplay } from '../utils/Formatter';
import { exportToCSV, printData, ExportColumn } from '../utils/exportUtils';
import clsx from 'clsx';
import { fetchCustomers, deleteCustomer, createCustomer, updateCustomer } from '../redux/Slice/CustomerSlice';
import { Customer } from '../redux/types';

// ──────────────────────────────────────────────────────────────────────────────
// Form State
// ──────────────────────────────────────────────────────────────────────────────
interface CustomerForm {
    name: string;
    phone: string;
    email: string;
    address: string;
}

const EMPTY_FORM: CustomerForm = { name: '', phone: '', email: '', address: '' };

// ──────────────────────────────────────────────────────────────────────────────
// CustomerFormModal
// ──────────────────────────────────────────────────────────────────────────────
const CustomerFormModal = ({
    visible,
    onClose,
    onSubmit,
    editingCustomer,
    isSubmitting,
}: {
    visible: boolean;
    onClose: () => void;
    onSubmit: (form: CustomerForm) => void;
    editingCustomer: Customer | null;
    isSubmitting: boolean;
}) => {
    const isEdit = !!editingCustomer;
    const { width } = useWindowDimensions();
    const isWeb = Platform.OS === 'web' && width >= 980;

    const [form, setForm] = useState<CustomerForm>(EMPTY_FORM);
    const [errors, setErrors] = useState<Partial<CustomerForm>>({});

    useEffect(() => {
        if (visible) {
            if (editingCustomer) {
                setForm({
                    name: editingCustomer.name || '',
                    phone: editingCustomer.phone || '',
                    email: editingCustomer.email || '',
                    address: editingCustomer.address || '',
                });
            } else {
                setForm(EMPTY_FORM);
            }
            setErrors({});
        }
    }, [visible, editingCustomer]);

    const validate = (): boolean => {
        const newErrors: Partial<CustomerForm> = {};
        if (!form.name.trim()) newErrors.name = 'Customer name is required';
        if (!form.phone.trim()) newErrors.phone = 'Phone number is required';
        else if (!/^\d{10,15}$/.test(form.phone.replace(/\s/g, '')))
            newErrors.phone = 'Enter a valid phone number (10-15 digits)';
        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            newErrors.email = 'Enter a valid email address';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validate()) onSubmit(form);
    };

    const Field = ({
        label,
        icon: Icon,
        value,
        onChangeText,
        placeholder,
        keyboardType,
        error,
        optional,
    }: {
        label: string;
        icon: any;
        value: string;
        onChangeText: (v: string) => void;
        placeholder: string;
        keyboardType?: any;
        error?: string;
        optional?: boolean;
    }) => (
        <View style={{ marginBottom: 18 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151' }}>{label}</Text>
                {optional && (
                    <Text style={{ fontSize: 11, color: '#9CA3AF', marginLeft: 6, fontWeight: '500' }}>
                        (Optional)
                    </Text>
                )}
            </View>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: error ? 1.5 : 1,
                borderColor: error ? '#EF4444' : '#E5E7EB',
                borderRadius: 12,
                backgroundColor: '#F9FAFB',
                paddingHorizontal: 14,
            }}>
                <Icon size={18} color={error ? '#EF4444' : '#9CA3AF'} style={{ marginRight: 10 }} />
                <TextInput
                    value={value}
                    onChangeText={(v) => {
                        onChangeText(v);
                        if (errors[label.toLowerCase() as keyof CustomerForm]) {
                            setErrors(prev => ({ ...prev, [label.toLowerCase()]: undefined }));
                        }
                    }}
                    placeholder={placeholder}
                    placeholderTextColor="#9CA3AF"
                    keyboardType={keyboardType || 'default'}
                    style={{
                        flex: 1,
                        paddingVertical: 13,
                        fontSize: 15,
                        color: '#1F2937',
                        fontFamily: Platform.OS === 'android' ? 'sans-serif' : undefined,
                    }}
                    autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
                />
                {error && <AlertCircle size={16} color="#EF4444" style={{ marginLeft: 8 }} />}
            </View>
            {error && (
                <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4, marginLeft: 2, fontWeight: '500' }}>
                    {error}
                </Text>
            )}
        </View>
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                {/* Backdrop */}
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={onClose}
                    style={{
                        flex: 1,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: 16,
                    }}
                >
                    {/* Card — stops backdrop click propagation */}
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => { }}
                        style={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: 24,
                            width: isWeb ? 520 : '100%',
                            maxWidth: 520,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 20 },
                            shadowOpacity: 0.15,
                            shadowRadius: 40,
                            elevation: 20,
                            overflow: 'hidden',
                        }}
                    >
                        {/* Header */}
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingHorizontal: 24,
                            paddingVertical: 20,
                            borderBottomWidth: 1,
                            borderBottomColor: '#F3F4F6',
                            backgroundColor: isEdit ? '#EEF2FF' : '#F0FDF4',
                        }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                <View style={{
                                    width: 42,
                                    height: 42,
                                    borderRadius: 12,
                                    backgroundColor: isEdit ? '#6366F1' : '#22C55E',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    {isEdit ? <Edit2 size={20} color="#FFF" /> : <Plus size={20} color="#FFF" />}
                                </View>
                                <View>
                                    <Text style={{ fontSize: 18, fontWeight: '700', color: '#1F2937' }}>
                                        {isEdit ? 'Edit Customer' : 'New Customer'}
                                    </Text>
                                    <Text style={{ fontSize: 13, color: '#6B7280', marginTop: 1 }}>
                                        {isEdit ? 'Update customer information' : 'Add a new customer to the system'}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                onPress={onClose}
                                style={{
                                    padding: 8,
                                    backgroundColor: '#F3F4F6',
                                    borderRadius: 10,
                                }}
                            >
                                <X size={18} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        {/* Form */}
                        <ScrollView
                            style={{ paddingHorizontal: 24, paddingTop: 24 }}
                            showsVerticalScrollIndicator={false}
                        >
                            <Field
                                label="Name"
                                icon={User}
                                value={form.name}
                                onChangeText={(v) => setForm(p => ({ ...p, name: v }))}
                                placeholder="e.g. Rajesh Kumar"
                                error={errors.name}
                            />
                            <Field
                                label="Phone"
                                icon={Phone}
                                value={form.phone}
                                onChangeText={(v) => setForm(p => ({ ...p, phone: v }))}
                                placeholder="e.g. 9876543210"
                                keyboardType="phone-pad"
                                error={errors.phone}
                            />
                            <Field
                                label="Email"
                                icon={Mail}
                                value={form.email}
                                onChangeText={(v) => setForm(p => ({ ...p, email: v }))}
                                placeholder="e.g. rajesh@example.com"
                                keyboardType="email-address"
                                error={errors.email}
                                optional
                            />
                            <Field
                                label="Address"
                                icon={MapPin}
                                value={form.address}
                                onChangeText={(v) => setForm(p => ({ ...p, address: v }))}
                                placeholder="e.g. 12, Gandhi Road, Chennai"
                                optional
                            />
                            <View style={{ height: 8 }} />
                        </ScrollView>

                        {/* Footer */}
                        <View style={{
                            flexDirection: 'row',
                            gap: 12,
                            paddingHorizontal: 24,
                            paddingVertical: 20,
                            borderTopWidth: 1,
                            borderTopColor: '#F3F4F6',
                        }}>
                            <TouchableOpacity
                                onPress={onClose}
                                disabled={isSubmitting}
                                style={{
                                    flex: 1,
                                    paddingVertical: 14,
                                    borderRadius: 12,
                                    alignItems: 'center',
                                    backgroundColor: '#F3F4F6',
                                    borderWidth: 1,
                                    borderColor: '#E5E7EB',
                                }}
                            >
                                <Text style={{ fontSize: 15, fontWeight: '600', color: '#374151' }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleSubmit}
                                disabled={isSubmitting}
                                style={{
                                    flex: 2,
                                    paddingVertical: 14,
                                    borderRadius: 12,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexDirection: 'row',
                                    gap: 8,
                                    backgroundColor: isEdit ? '#6366F1' : COLORS.primary,
                                    opacity: isSubmitting ? 0.7 : 1,
                                }}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <CheckCircle size={18} color="#FFFFFF" />
                                )}
                                <Text style={{ fontSize: 15, fontWeight: '700', color: '#FFFFFF' }}>
                                    {isSubmitting
                                        ? isEdit ? 'Updating...' : 'Creating...'
                                        : isEdit ? 'Update Customer' : 'Create Customer'
                                    }
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </Modal>
    );
};

// ──────────────────────────────────────────────────────────────────────────────
// Main Screen
// ──────────────────────────────────────────────────────────────────────────────
const CustomerScreen = () => {
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const isWeb = Platform.OS === 'web' && width >= 980;
    const dispatch = useAppDispatch();
    const navigation = useNavigation<any>();

    const { customers, isLoading, pagination: serverPagination } = useAppSelector((state) => state.customers);

    // Pagination & search state
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Modal state
    const [modalVisible, setModalVisible] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    /* ── Reset page when search changes ── */
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    /* ── Fetch all customers ── */
    const loadCustomers = useCallback(() => {
        dispatch(fetchCustomers({
            page: currentPage,
            limit: pageSize,
            search: searchQuery,
        }));
    }, [dispatch, currentPage, pageSize, searchQuery]);

    useEffect(() => {
        loadCustomers();
    }, [loadCustomers]);

    // Refresh when navigating back
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => loadCustomers());
        return unsubscribe;
    }, [navigation, loadCustomers]);

    /* ── Open create modal ── */
    const handleOpenCreate = () => {
        setEditingCustomer(null);
        setModalVisible(true);
    };

    /* ── Open edit modal ── */
    const handleOpenEdit = (customer: Customer) => {
        setEditingCustomer(customer);
        setModalVisible(true);
    };

    /* ── Submit (create or update) ── */
    const handleSubmitForm = async (form: CustomerForm) => {
        setIsSubmitting(true);
        try {
            if (editingCustomer) {
                // UPDATE
                const result = await dispatch(updateCustomer({
                    id: editingCustomer.id,
                    customerData: form,
                }));
                if (updateCustomer.fulfilled.match(result)) {
                    setModalVisible(false);
                    toast.success('Customer updated successfully.');
                    loadCustomers();
                } else {
                    toast.error((result.payload as string) || 'Failed to update customer.');
                }
            } else {
                // CREATE
                const result = await dispatch(createCustomer(form));
                if (createCustomer.fulfilled.match(result)) {
                    setModalVisible(false);
                    toast.success(`${form.name} has been added successfully.`);
                    loadCustomers();
                } else {
                    toast.error((result.payload as string) || 'Failed to create customer.');
                }
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    /* ── Delete Customer ── */
    const handleDeleteCustomer = async (customerId: string, customerName: string) => {
        Alert.alert(
            'Delete Customer',
            `Are you sure you want to delete "${customerName}"? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const result = await dispatch(deleteCustomer(customerId));
                        if (deleteCustomer.fulfilled.match(result)) {
                            toast.success('Customer removed successfully.');
                            loadCustomers();
                        } else {
                            toast.error((result.payload as string) || 'Failed to delete customer.');
                        }
                    },
                },
            ],
        );
    };

    /* ── Export Actions ── */
    const exportColumns: ExportColumn[] = [
        { key: 'name', title: 'Name' },
        { key: 'phone', title: 'Phone', render: (c) => formatIdentityDisplay(c.phone) },
        { key: 'email', title: 'Email', render: (c) => c.email || 'N/A' },
        { key: 'address', title: 'Address', render: (c) => c.address || 'N/A' },
        { key: 'createdAt', title: 'Join Date', render: (c) => c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A' },
    ];

    /* ── Stats ── */
    const stats = useMemo(() => {
        const totalCustomers = serverPagination?.total ?? customers.length;
        const newThisMonth = customers.filter(c => {
            if (!c.createdAt) return false;
            const d = new Date(c.createdAt);
            const now = new Date();
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length;

        return [
            { label: 'Total Customers', value: String(totalCustomers), icon: Users, color: '#6366F1', bgColor: '#EEF2FF' },
            { label: 'New This Month', value: String(newThisMonth), icon: TrendingUp, color: '#10B981', bgColor: '#ECFDF5' },
            { label: 'With Email', value: String(customers.filter(c => !!c.email).length), icon: Mail, color: '#F59E0B', bgColor: '#FFFBEB' },
            { label: 'With Address', value: String(customers.filter(c => !!c.address).length), icon: MapPin, color: '#8B5CF6', bgColor: '#F5F3FF' },
        ];
    }, [customers, serverPagination]);

    /* ── Table Columns ── */
    const customerColumns: Column[] = [
        {
            key: 'name',
            title: 'Customer Name',
            width: isWeb ? 220 : 150,
            render: (customer: Customer) => (
                <View>
                    <Text style={{ fontWeight: '700', color: '#111827', fontSize: 14 }}>{customer.name}</Text>
                    <Text style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>
                        Joined {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A'}
                    </Text>
                </View>
            ),
        },
        {
            key: 'phone',
            title: 'Phone Number',
            width: isWeb ? 180 : 140,
            render: (customer: Customer) => (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={{ padding: 6, backgroundColor: '#F3F4F6', borderRadius: 8 }}>
                        <Phone size={12} color="#64748B" />
                    </View>
                    <Text style={{ color: '#374151', fontWeight: '500', fontSize: 14 }}>
                        {formatIdentityDisplay(customer.phone)}
                    </Text>
                </View>
            ),
        },
        {
            key: 'email',
            title: 'Email Address',
            width: isWeb ? 260 : 180,
            render: (customer: Customer) => (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={{ padding: 6, backgroundColor: '#F3F4F6', borderRadius: 8 }}>
                        <Mail size={12} color="#64748B" />
                    </View>
                    <Text style={{ color: '#374151', fontSize: 14 }} numberOfLines={1}>
                        {customer.email || '—'}
                    </Text>
                </View>
            ),
        },
        {
            key: 'address',
            title: 'Address',
            width: isWeb ? 240 : 160,
            render: (customer: Customer) => (
                <Text style={{ color: '#6B7280', fontSize: 13 }} numberOfLines={2}>
                    {customer.address || '—'}
                </Text>
            ),
        },
        {
            key: 'actions',
            title: 'Actions',
            width: isWeb ? 140 : 120,
            align: 'center',
            render: (customer: Customer) => (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <TouchableOpacity
                        onPress={() => handleOpenEdit(customer)}
                        style={{
                            padding: 8,
                            backgroundColor: '#EEF2FF',
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: '#C7D2FE',
                        }}
                    >
                        <Edit2 size={15} color="#6366F1" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleDeleteCustomer(customer.id, customer.name)}
                        style={{
                            padding: 8,
                            backgroundColor: '#FEF2F2',
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: '#FECACA',
                        }}
                    >
                        <Trash2 size={15} color="#EF4444" />
                    </TouchableOpacity>
                </View>
            ),
        },
    ];

    return (
        <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
            <Header title="Manage Customers" icon={Users} navigation={navigation} />

            <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingBottom: insets.bottom + 24,
                    paddingHorizontal: isWeb ? 32 : 16,
                    paddingTop: 16,
                }}
            >
                {/* Stats */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -8, marginBottom: 24 }}>
                    {stats.map((stat, idx) => (
                        <View key={idx} style={{ width: width >= 768 ? '25%' : '50%', padding: 8 }}>
                            <View style={{
                                backgroundColor: '#FFFFFF',
                                borderRadius: 16,
                                padding: 16,
                                borderWidth: 1,
                                borderColor: '#F1F5F9',
                                flexDirection: 'row',
                                alignItems: 'center',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.05,
                                shadowRadius: 4,
                                elevation: 2,
                            }}>
                                <View style={{
                                    backgroundColor: stat.bgColor,
                                    width: 44,
                                    height: 44,
                                    borderRadius: 14,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 12,
                                }}>
                                    <stat.icon size={22} color={stat.color} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 10, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                                        {stat.label}
                                    </Text>
                                    <Text style={{ fontSize: 20, fontWeight: '800', color: '#111827', marginTop: 2 }} numberOfLines={1}>
                                        {stat.value}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Toolbar */}
                <View style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: '#F1F5F9',
                    marginBottom: 20,
                    padding: 16,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                    elevation: 2,
                }}>
                    <View style={[{ gap: 12 }, isWeb && { flexDirection: 'row', alignItems: 'center' }]}>
                        {/* Search */}
                        <View style={{ flex: isWeb ? 1 : undefined, position: 'relative' }}>
                            <View style={{ position: 'absolute', left: 14, top: 0, bottom: 0, justifyContent: 'center', zIndex: 1 }}>
                                <Search size={18} color="#9CA3AF" />
                            </View>
                            <TextInput
                                placeholder="Search by name, phone or email…"
                                placeholderTextColor="#9CA3AF"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                style={{
                                    backgroundColor: '#F8FAFC',
                                    borderWidth: 1,
                                    borderColor: '#E5E7EB',
                                    borderRadius: 12,
                                    paddingLeft: 44,
                                    paddingRight: 16,
                                    paddingVertical: 12,
                                    fontSize: 14,
                                    color: '#1F2937',
                                    fontWeight: '500',
                                }}
                            />
                        </View>

                        {/* Action buttons */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <TouchableOpacity
                                onPress={() => printData('Customers Report', customers, exportColumns, 'print')}
                                style={{ padding: 12, backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' }}
                            >
                                <Printer size={18} color="#4B5563" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => exportToCSV(customers, exportColumns, 'Customers_Report')}
                                style={{ padding: 12, backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' }}
                            >
                                <FileText size={18} color="#4B5563" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={loadCustomers}
                                style={{ padding: 12, borderRadius: 12, borderWidth: 1, borderColor: `${COLORS.primary}30`, backgroundColor: `${COLORS.primary}10` }}
                            >
                                <RefreshCcw size={18} color={COLORS.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleOpenCreate}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 8,
                                    paddingHorizontal: 16,
                                    paddingVertical: 12,
                                    backgroundColor: COLORS.primary,
                                    borderRadius: 12,
                                    shadowColor: COLORS.primary,
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 8,
                                    elevation: 4,
                                }}
                            >
                                <Plus size={18} color="#FFFFFF" />
                                {isWeb && <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>Add Customer</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Table */}
                <View style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: '#F1F5F9',
                    minHeight: 400,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                    elevation: 2,
                }}>
                    <DataTable
                        columns={customerColumns}
                        data={customers}
                        isLoading={isLoading}
                        keyExtractor={(item) => item.id}
                        emptyMessage="No customers found. Click 'Add Customer' to get started."
                        pagination={true}
                        pageSize={pageSize}
                        totalItems={serverPagination?.total}
                        currentPage={currentPage}
                        onPageChange={(page, size) => {
                            setCurrentPage(page);
                            setPageSize(size);
                        }}
                    />
                </View>
            </ScrollView>

            {/* FAB – mobile */}
            {!isWeb && (
                <TouchableOpacity
                    onPress={handleOpenCreate}
                    style={{
                        position: 'absolute',
                        right: 20,
                        bottom: insets.bottom + 20,
                        width: 60,
                        height: 60,
                        borderRadius: 30,
                        backgroundColor: COLORS.primary,
                        alignItems: 'center',
                        justifyContent: 'center',
                        shadowColor: COLORS.primary,
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: 0.4,
                        shadowRadius: 12,
                        elevation: 8,
                    }}
                >
                    <Plus size={28} color="#FFFFFF" strokeWidth={2.5} />
                </TouchableOpacity>
            )}

            {/* Create / Edit Modal */}
            <CustomerFormModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSubmit={handleSubmitForm}
                editingCustomer={editingCustomer}
                isSubmitting={isSubmitting}
            />
        </View>
    );
};

export default CustomerScreen;
