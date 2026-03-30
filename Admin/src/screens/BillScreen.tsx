// src/screens/BillScreen.tsx
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
    Linking,
    Share,
    Alert,
} from 'react-native';
import { toast } from '../components/common/Toast';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    Receipt,
    Search,
    Plus,
    Trash2,
    RefreshCcw,
    Printer,
    Edit3,
    X,
    TrendingUp,
    Wallet,
    CirclePercent,
    Package,
    Eye,
    Download,
    FileText,
    Share2,
    Mic,
} from 'lucide-react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { COLORS } from '../Constants/Colors';
import { BACKEND_API_URL } from '../Constants';
import Header from '../components/Header';
import DataTable, { Column } from '../components/common/DataTable';
import { useAppDispatch, useAppSelector } from '../redux/Store';
import ConfirmDelete from '../components/common/ConfirmDelete';
import { formatCurrency, formatIdentityDisplay } from '../utils/Formatter';
import { Bill } from '../redux/types';
import { IMAGES } from '../Constants/Images';
import { exportToCSV, printData, ExportColumn } from '../utils/exportUtils';
import { permissionUtils } from '../utils/permissionUtils';
import clsx from 'clsx';
import api from '../services/api';

import { fetchInvoices, deleteInvoice } from '../redux/Slice/InvoiceSlice';
import { useVoiceSearch } from '../hooks/useVoiceSearch';
import { Pressable } from 'react-native';

const PAYMENT_METHODS = ['all', 'cash', 'upi', 'card'] as const;

const BillScreen = () => {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const isWeb = Platform.OS === 'web' && width >= 980;
    const dispatch = useAppDispatch();

    const { products } = useAppSelector((state) => state.products);
    const { invoices: bills, isLoading } = useAppSelector((state) => state.invoices);

    // Local state
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBills, setSelectedBills] = useState<string[]>([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ id: string; invoiceNumber: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [paymentFilter, setPaymentFilter] = useState<'all' | 'cash' | 'upi' | 'card'>('all');

    const { isListening, startListening } = useVoiceSearch((text) => {
        setSearchQuery(text);
    });

    /* ── Fetch all invoices ── */
    const fetchBills = useCallback(() => {
        dispatch(fetchInvoices());
    }, [dispatch]);

    useEffect(() => {
        fetchBills();
    }, [fetchBills]);

    // Refresh when navigating back from CreateBill
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchBills();
        });
        return unsubscribe;
    }, [navigation, fetchBills]);

    /* ── Delete ── */
    const handleDeleteBill = async () => {
        if (!itemToDelete) return;
        setIsDeleting(true);
        try {
            const resultAction = await dispatch(deleteInvoice(itemToDelete.id));
            if (deleteInvoice.fulfilled.match(resultAction)) {
                setIsDeleteModalOpen(false);
                setItemToDelete(null);
                toast.success('Invoice deleted successfully');
            } else {
                toast.error(resultAction.payload as string || 'Failed to delete invoice.');
            }
        } catch (error: any) {
            toast.error('Failed to delete invoice.');
        } finally {
            setIsDeleting(false);
        }
    };

    /* ── Search filter ── */
    const filteredBills = useMemo(() => {
        let items = bills;

        // Payment filter
        if (paymentFilter !== 'all') {
            items = items.filter(b => b.paymentMethod === paymentFilter);
        }

        // Search Query
        const q = searchQuery.trim().toLowerCase();
        if (!q) return items;

        return items.filter((bill) => {
            const name = bill.customer?.name?.toLowerCase() || '';
            const phone = bill.customer?.phone || '';
            const invNo = bill.invoiceNumber?.toLowerCase() || '';
            return invNo.includes(q) || name.includes(q) || phone.includes(q);
        });
    }, [bills, searchQuery, paymentFilter]);

    /* ── Stats Calculation ── */
    const stats = useMemo(() => {
        const totalSales = bills.reduce((sum, b) => sum + parseFloat(String(b.totalAmount || 0)), 0);
        const totalDiscount = bills.reduce((sum, b) => sum + parseFloat(String(b.discountAmount || 0)), 0);
        const totalItems = bills.reduce((sum, b) => sum + (b.items?.length || 0), 0);
        const count = bills.length;

        return [
            { label: 'Total Sales', value: formatCurrency(totalSales), icon: TrendingUp, color: '#10B981', bgColor: '#ECFDF5' },
            { label: 'Total Invoices', value: String(count), icon: Receipt, color: '#6366F1', bgColor: '#EEF2FF' },
            { label: 'Total Discount', value: formatCurrency(totalDiscount), icon: CirclePercent, color: '#EF4444', bgColor: '#FEF2F2' },
            { label: 'Items Sold', value: String(totalItems), icon: Package, color: '#F59E0B', bgColor: '#FFFBEB' },
        ];
    }, [bills]);

    const handleViewInvoice = (invoiceNumber: string) => {
        navigation.navigate('PDFViewer', { invoiceNumber });
    };

    const downloadSingleInvoice = async (invoiceNumber: string) => {
        const encryptedInvoiceNumber = invoiceNumber.split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('');
        const pdfUrl = `${BACKEND_API_URL}/invoices/pdf/${encryptedInvoiceNumber}`;

        if (Platform.OS === 'web') {
            try {
                const response = await fetch(pdfUrl, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                });
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `Invoice_${invoiceNumber}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            } catch (error) {
                console.error("Web Download Error:", error);
                toast.error('Could not save the invoice.');
            }
        } else {
            try {
                await permissionUtils.withPermission('download', async () => {
                    const { dirs } = ReactNativeBlobUtil.fs;
                    const fileName = `Invoice_${invoiceNumber.replace(/[^a-zA-Z0-9-]/g, '_')}.pdf`;
                    const downloadPath = `${dirs.DownloadDir}/${fileName}`;

                    const res = await ReactNativeBlobUtil
                        .config({
                            fileCache: true,
                            path: downloadPath,
                        })
                        .fetch('GET', pdfUrl, {
                            'Content-Type': 'application/json',
                        });

                    await ReactNativeBlobUtil.android.addCompleteDownload({
                        title: fileName,
                        description: 'Invoice downloaded successfully',
                        mime: 'application/pdf',
                        path: res.path(),
                        showNotification: true,
                    });

                    Alert.alert(
                        'Success',
                        'Invoice downloaded successfully to your Downloads folder.',
                        [
                            { text: 'OK' },
                            {
                                text: 'Open File',
                                onPress: () => ReactNativeBlobUtil.android.actionViewIntent(res.path(), 'application/pdf')
                            }
                        ]
                    );
                });
            } catch (error) {
                console.error('Download error:', error);
                toast.error('Could not save the invoice.');
            }
        }
    };

    /* ── Share Invoice QR/PDF Link ── */
    const handleShareInvoice = async (invoiceNumber: string) => {
        const encrypted = invoiceNumber.split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('');
        const shareUrl = `${BACKEND_API_URL}/invoices/pdf/${encrypted}`;

        try {
            await Share.share({
                message: `View Invoice for ${invoiceNumber}: ${shareUrl}`,
                url: shareUrl,
                title: `Invoice ${invoiceNumber}`
            });
        } catch (error) {
            console.error("Share Error:", error);
        }
    };

    /* ── Export ── */
    const handleDownload = async (format: 'pdf' | 'excel' | 'print') => {
        const data = selectedBills.length > 0
            ? bills.filter((b) => selectedBills.includes(b.id))
            : filteredBills;

        if (data.length === 0) {
            toast.warning('There are no records to export.');
            return;
        }

        const columns: ExportColumn[] = [
            { key: 'invoiceNumber', title: 'Invoice No' },
            { key: 'customer', title: 'Customer', render: (item) => item.customer?.name || 'N/A' },
            { key: 'phone', title: 'Phone', render: (item) => item.customer?.phone || 'N/A' },
            { key: 'subTotal', title: 'Sub Total', render: (item) => formatCurrency(item.subTotal) },
            { key: 'discountAmount', title: 'Discount', render: (item) => formatCurrency(item.discountAmount) },
            { key: 'taxAmount', title: 'Tax', render: (item) => formatCurrency(item.taxAmount) },
            { key: 'totalAmount', title: 'Total', render: (item) => formatCurrency(item.totalAmount) },
            { key: 'paymentMethod', title: 'Payment' },
            { key: 'createdAt', title: 'Date', render: (item) => item.createdAt ? new Date(item.createdAt).toLocaleString() : 'N/A' },
        ];

        const execute = async () => {
            if (format === 'excel') {
                await exportToCSV(data, columns, 'invoices');
            } else {
                await printData('Invoice History Report', data, columns, format as 'print' | 'pdf');
            }
        };

        if (Platform.OS === 'android') {
            permissionUtils.withPermission('download', execute);
        } else {
            execute();
        }
    };

    const renderStats = () => {
        const colCount = width >= 700 ? 4 : 2;
        const itemWidth = `${100 / colCount}%`;

        return (
            <View
                style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    marginHorizontal: -10,
                    marginBottom: 10
                }}
            >
                {stats.map((stat, idx) => (
                    <View
                        key={idx}
                        style={{ width: itemWidth as any, padding: 8 }}
                    >
                        <View className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex-row items-center">
                            <View
                                style={{ backgroundColor: stat.bgColor }}
                                className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                            >
                                <stat.icon size={24} color={stat.color} strokeWidth={2.5} />
                            </View>
                            <View>
                                <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                                    {stat.label}
                                </Text>
                                <Text className="text-xl font-black text-gray-800 mt-0.5">
                                    {stat.value}
                                </Text>
                            </View>
                        </View>
                    </View>
                ))}
            </View>
        );
    };

    /* ── Header ── */
    const renderHeader = () => (
        <View className="mb-2">
            <View className={clsx(
                'mb-2',
                isWeb ? 'flex-row items-center justify-between' : 'flex-col items-start gap-4'
            )}>
                <View className="flex-row items-center gap-3">
                    <View>
                        <View className="flex-row items-center gap-2">
                            <Text className="text-2xl font-bold text-gray-800">Invoice History</Text>
                            <View className="px-2.5 py-1 bg-gray-200 rounded-full">
                                <Text className="text-gray-600 text-xs font-bold">
                                    {bills.length} total
                                </Text>
                            </View>
                        </View>
                        <Text className="text-gray-500 text-sm">Manage and track your invoices</Text>
                    </View>
                </View>

                <View className={clsx('flex-row items-center', isWeb ? 'justify-end' : 'justify-start w-full')}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ gap: isWeb ? 24 : 8, alignItems: 'center' }}
                    >
                        <View className="flex-row items-center gap-2">
                            <View className="flex-row items-center bg-white rounded-lg border border-gray-200 shadow-sm p-1 mr-2">
                                <TouchableOpacity onPress={() => handleDownload('pdf')} className="p-2 rounded-md" activeOpacity={0.7}>
                                    <Image source={IMAGES.PDF} style={{ width: 20, height: 20, resizeMode: 'contain' }} />
                                </TouchableOpacity>
                                <View className="w-[1px] h-5 bg-gray-200 mx-1" />
                                <TouchableOpacity onPress={() => handleDownload('excel')} className="p-2 rounded-md" activeOpacity={0.7}>
                                    <Image source={IMAGES.EXCEL} style={{ width: 20, height: 20, resizeMode: 'contain' }} />
                                </TouchableOpacity>
                                <View className="w-[1px] h-5 bg-gray-200 mx-1" />
                                <TouchableOpacity onPress={() => handleDownload('print')} className="p-2 rounded-md" activeOpacity={0.7}>
                                    <Printer size={20} color="#475569" />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                onPress={fetchBills}
                                className="p-2.5 bg-white rounded-lg border border-gray-200 shadow-sm"
                            >
                                <RefreshCcw size={18} color="#64748b" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => navigation.navigate('CreateBill')}
                                className="py-2.5 px-5 bg-primary rounded-lg flex-row items-center gap-2 shadow-md"
                            >
                                <Plus size={18} color="white" />
                                <Text className="text-white font-bold">New Invoice</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </View>
    );

    /* ── Search bar & Filters ── */
    const renderFilters = () => (
        <View className="bg-white rounded-3xl border border-gray-100 mb-6 p-5 shadow-sm overflow-hidden">
            <View className={clsx(
                "gap-4 mb-5",
                // On web, keep horizontal layout; on mobile/tablet, stack vertically
                isWeb ? "flex-row items-center" : "flex-col"
            )}>
                {/* Search Input - Takes remaining space on web, full width on mobile */}
                <View className={clsx(
                    "relative",
                    isWeb ? "flex-1" : "w-full"
                )}>
                    <View className="absolute left-4 top-0 bottom-0 justify-center z-10">
                        <Search size={18} color="#94A3B8" />
                    </View>
                    <TextInput
                        placeholder="Search invoices, customers..."
                        className={clsx(
                            "w-full bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold text-slate-700 focus:border-indigo-300 transition-all",
                            // Adjust padding based on platform for better alignment
                            Platform.OS === 'android'
                                ? "pl-11 pr-24 py-4"
                                : "pl-11 pr-24 py-3.5"
                        )}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor="#94A3B8"
                        // Add these props for better Android behavior
                        textAlignVertical="center"
                        style={Platform.OS === 'android' ? { includeFontPadding: false } : undefined}
                    />
                    <View className="absolute right-4 top-0 bottom-0 flex-row items-center gap-2 z-10">
                        {searchQuery.length > 0 && (
                            <TouchableOpacity
                                onPress={() => setSearchQuery('')}
                                activeOpacity={0.7}
                            >
                                <View className="bg-slate-200 rounded-full p-1">
                                    <X size={10} color="#64748B" />
                                </View>
                            </TouchableOpacity>
                        )}
                        <Pressable
                            onPress={() => startListening()}
                            className={clsx(
                                "p-1.5 rounded-full transition-all",
                                isListening ? "bg-red-500 shadow-md shadow-red-200" : "bg-indigo-50"
                            )}
                        >
                            <Mic size={16} color={isListening ? "#FFFFFF" : "#4F46E5"} />
                        </Pressable>
                    </View>
                </View>


            </View>

            {/* Payment Method Tabs */}
            <View className="border-t border-slate-50 pt-5">
                <Text className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">
                    Filter by payment method
                </Text>
                <PaymentFilter
                    currentMethod={paymentFilter}
                    onMethodChange={setPaymentFilter}
                />
            </View>
        </View>
    );

    /* ── Table columns ── */
    const billColumns: Column[] = [
        {
            key: 'invoiceNumber',
            title: 'Invoice No',
            width: 160,
            sortable: true,
            render: (bill: Bill) => (
                <Text className="font-bold text-primary">{bill.invoiceNumber}</Text>
            ),
        },
        {
            key: 'customerName',
            title: 'Customer',
            width: isWeb ? 180 : 150,
            sortable: true,
            render: (bill: Bill) => (
                <Text className="font-bold text-gray-800" numberOfLines={1}>
                    {bill.customer?.name || 'Walk-in Customer'}
                </Text>
            ),
        },
        {
            key: 'customerPhone',
            title: 'Phone',
            width: 150,
            render: (bill: Bill) => (
                <Text className="text-gray-600">
                    {formatIdentityDisplay(bill.customer?.phone) || '—'}
                </Text>
            ),
        },
        {
            key: 'itemCount',
            title: 'Items',
            width: 80,
            align: 'center',
            render: (bill: Bill) => (
                <View className="bg-gray-100 px-2 py-0.5 rounded-md min-w-[30px] items-center">
                    <Text className="text-xs font-bold text-gray-700">
                        {bill.items?.length || 0}
                    </Text>
                </View>
            ),
        },
        {
            key: 'discountAmount',
            title: 'Discount',
            width: 100,
            sortable: true,
            render: (bill: Bill) => (
                <Text className="text-sm text-red-600 font-bold">
                    {parseFloat(String(bill.discountAmount || '0')) > 0 ? `-${formatCurrency(bill.discountAmount)}` : '—'}
                </Text>
            ),
        },
        {
            key: 'totalAmount',
            title: 'Total',
            width: 130,
            sortable: true,
            render: (bill: Bill) => (
                <View>
                    <Text className="font-bold text-gray-900">{formatCurrency(bill.totalAmount)}</Text>
                    {(parseFloat(String(bill.discountAmount || '0')) > 0 ||
                        parseFloat(String(bill.taxAmount || '0')) > 0) && (
                            <Text className="text-xs text-gray-400">Sub: {formatCurrency(bill.subTotal)}</Text>
                        )}
                </View>
            ),
        },
        {
            key: 'paymentMethod',
            title: 'Payment',
            width: isWeb ? 120 : 100,
            render: (bill: Bill) => (
                <View className={clsx(
                    'px-2.5 py-1 rounded-full self-start',
                    bill.paymentMethod === 'cash' && 'bg-green-50',
                    bill.paymentMethod === 'upi' && 'bg-blue-50',
                    bill.paymentMethod === 'card' && 'bg-purple-50',
                )}>
                    <Text className={clsx(
                        'text-xs font-bold uppercase',
                        bill.paymentMethod === 'cash' && 'text-green-700',
                        bill.paymentMethod === 'upi' && 'text-blue-700',
                        bill.paymentMethod === 'card' && 'text-purple-700',
                    )}>
                        {bill.paymentMethod}
                    </Text>
                </View>
            ),
        },
        {
            key: 'createdAt',
            title: 'Date',
            width: 160,
            sortable: true,
            render: (bill: Bill) => (
                <Text className="text-xs text-gray-500">
                    {bill.createdAt ? new Date(bill.createdAt).toLocaleString() : '—'}
                </Text>
            ),
        },
        {
            key: 'actions',
            title: 'Actions',
            width: isWeb ? 200 : 180,
            align: 'center',
            render: (bill: Bill) => (
                <View className="flex-row items-center gap-2">
                    <TouchableOpacity
                        onPress={() => handleViewInvoice(bill.invoiceNumber)}
                        className="p-2 bg-purple-50 rounded-lg border border-purple-100"
                    >
                        <Eye size={16} color="#7C3AED" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('CreateBill', { billId: bill.id })}
                        className="p-2 bg-blue-50 rounded-lg border border-blue-100"
                    >
                        <Edit3 size={16} color="#2563EB" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => downloadSingleInvoice(bill.invoiceNumber)}
                        className="p-2 bg-green-50 rounded-lg border border-green-100"
                    >
                        <Download size={16} color="#10B981" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleShareInvoice(bill.invoiceNumber)}
                        className="p-2 bg-orange-50 rounded-lg border border-orange-100 active:bg-orange-100"
                    >
                        <Share2 size={16} color="#F97316" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            setItemToDelete({ id: bill.id, invoiceNumber: bill.invoiceNumber });
                            setIsDeleteModalOpen(true);
                        }}
                        className="p-2 bg-red-50 rounded-lg border border-red-100"
                    >
                        <Trash2 size={16} color="#DC2626" />
                    </TouchableOpacity>
                </View>
            ),
        },
    ];

    /* ── Render ── */
    return (
        <View className="flex-1 bg-background-light">
            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
            <Header title="Billing & Invoices" icon={Receipt} navigation={navigation} />

            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    paddingBottom: insets.bottom + 20,
                    paddingHorizontal: isWeb ? 32 : 16,
                    paddingTop: isWeb ? 32 : 16,
                }}
                showsVerticalScrollIndicator={false}
            >
                {renderHeader()}
                {renderStats()}
                {renderFilters()}

                <DataTable
                    columns={billColumns}
                    data={filteredBills}
                    isLoading={isLoading}
                    keyExtractor={(item) => item.id}
                    emptyMessage="No invoices found."
                    selectable={true}
                    selectedItems={selectedBills}
                    onSelectAll={(selected) =>
                        setSelectedBills(selected ? filteredBills.map((b) => b.id) : [])
                    }
                    onSelectItem={(item, selected) => {
                        setSelectedBills((prev) =>
                            selected ? [...prev, item.id] : prev.filter((id) => id !== item.id)
                        );
                    }}
                    containerStyle={{
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        backgroundColor: '#FFFFFF',
                    }}
                />
            </ScrollView>

            {/* FAB – mobile only */}
            {!isWeb && (
                <TouchableOpacity
                    onPress={() => navigation.navigate('CreateBill')}
                    style={[fabStyle, { bottom: insets.bottom + 20 }]}
                    className="bg-primary shadow-2xl elevation-8"
                >
                    <Plus size={32} color="white" strokeWidth={3} />
                </TouchableOpacity>
            )}

            <ConfirmDelete
                visible={isDeleteModalOpen}
                onClose={() => { setIsDeleteModalOpen(false); setItemToDelete(null); }}
                onConfirm={handleDeleteBill}
                loading={isDeleting}
                title="Delete Invoice"
                itemName={itemToDelete?.invoiceNumber}
                message={`Are you sure you want to delete invoice ${itemToDelete?.invoiceNumber}? This action cannot be undone.`}
            />
        </View>
    );
};

const fabStyle = {
    position: 'absolute' as const,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    zIndex: 999,
};

const PaymentFilter = ({ currentMethod, onMethodChange }: { currentMethod: string, onMethodChange: (m: any) => void }) => {
    const getMethodStyles = (method: string, isActive: boolean) => {
        if (!isActive) return { container: 'bg-slate-50 border-slate-100', text: 'text-slate-500' };

        switch (method) {
            case 'cash': return { container: 'bg-emerald-500 border-emerald-600 shadow-emerald-200', text: 'text-white' };
            case 'upi': return { container: 'bg-sky-500 border-sky-600 shadow-sky-200', text: 'text-white' };
            case 'card': return { container: 'bg-violet-500 border-violet-600 shadow-violet-200', text: 'text-white' };
            default: return { container: 'bg-slate-800 border-slate-900 shadow-slate-300', text: 'text-white' };
        }
    };

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row"
            contentContainerStyle={{ gap: 8, paddingRight: 20 }}
        >
            {PAYMENT_METHODS.map((method) => {
                const isActive = currentMethod === method;
                const styles = getMethodStyles(method, isActive);

                return (
                    <TouchableOpacity
                        key={method}
                        onPress={() => onMethodChange(method)}
                        activeOpacity={0.7}
                        className={clsx(
                            'px-6 py-2.5 rounded-2xl border transition-all shadow-sm',
                            styles.container,
                            !isActive && 'opacity-80'
                        )}
                    >
                        <Text className={clsx(
                            'text-xs font-bold capitalize tracking-wide',
                            styles.text
                        )}>
                            {method}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
};

export default BillScreen;
