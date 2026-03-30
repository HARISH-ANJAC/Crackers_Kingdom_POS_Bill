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
    Share,
} from 'react-native';
import { toast } from '../components/common/Toast';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    Search,
    RefreshCcw,
    Printer,
    FileText,
    TrendingUp,
    Eye,
    Download,
    ClipboardCheck,
    ShoppingCart,
    Clock,
    CheckCircle2,
    X,
    Share2,
    Trash2,
    Mic,
    ScanLine,
} from 'lucide-react-native';
import { COLORS } from '../Constants/Colors';
import { BACKEND_API_URL } from '../Constants';
import Header from '../components/Header';
import DataTable, { Column } from '../components/common/DataTable';
import { useAppDispatch, useAppSelector } from '../redux/Store';
import { formatCurrency, formatIdentityDisplay } from '../utils/Formatter';
import { exportToCSV, printData, ExportColumn } from '../utils/exportUtils';
import { permissionUtils } from '../utils/permissionUtils';
import clsx from 'clsx';
import { fetchOrders, convertOrderToInvoice, deleteOrder } from '../redux/Slice/OrderSlice';
import { useVoiceSearch } from '../hooks/useVoiceSearch';
import api from '../services/api';
const STATUS_OPTIONS = ['all', 'pending', 'confirmed', 'converted'] as const;

// Conditionally import native modules
let ReactNativeBlobUtil: any = null;
if (Platform.OS !== 'web') {
    try {
        ReactNativeBlobUtil = require('react-native-blob-util').default;
    } catch (e) {
        console.error('react-native-blob-util load error:', e);
    }
}

const OrderScreen = () => {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const isWeb = Platform.OS === 'web' && width >= 980;
    const dispatch = useAppDispatch();

    const { orders, isLoading, pagination: serverPagination } = useAppSelector((state) => state.orders);

    // Local state
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'converted'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter, searchQuery]);

    const { isListening, startListening } = useVoiceSearch((text) => {
        setSearchQuery(text);
    });

    /* ── Fetch all orders ── */
    const loadOrders = useCallback(() => {
        dispatch(fetchOrders({
            page: currentPage,
            limit: pageSize,
            status: statusFilter,
            search: searchQuery
        }));
    }, [dispatch, currentPage, pageSize, statusFilter, searchQuery]);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    // Refresh when navigating back
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadOrders();
        });
        return unsubscribe;
    }, [navigation, loadOrders]);

    /* ── Convert to Invoice ── */
    const handleConvert = (order: any) => {
        navigation.navigate('CreateBill', {
            orderData: order
        });
    };

    /* ── Scan QR to Convert ── */
    const handleScanOrderQR = () => {
        navigation.navigate('QRScan', {
            onScan: async (decodedText: string) => {
                if (!decodedText.includes('/api/orders/pdf/')) {
                    toast.error("Not a Order QRCODE, please scan the Order receipts QR Code only.");
                    return;
                }

                const parts = decodedText.split('/api/orders/pdf/');
                if (parts.length < 2) return;
                const encryptedOrderNumber = parts[1];

                // Decode hex back to UTF-8
                let orderNumber = '';
                try {
                    for (let i = 0; i < encryptedOrderNumber.length; i += 2) {
                        orderNumber += String.fromCharCode(parseInt(encryptedOrderNumber.substring(i, i + 2), 16));
                    }
                } catch (e) {
                    toast.error("Invalid QR Code content.");
                    return;
                }

                // Fetch the order from the backend
                try {
                    const toastId = toast.loading('Fetching order details...');
                    const res = await api.get(`/orders?search=${encodeURIComponent(orderNumber)}`);
                    toast.dismiss(toastId);

                    if (res.data?.success && res.data?.data?.length > 0) {
                        const order = res.data.data.find((o: any) => o.orderNumber === orderNumber) || res.data.data[0];
                        if (order.status === 'converted') {
                            toast.error("This order has already been converted to an invoice.");
                            return;
                        }
                        toast.success("Order found! Loading bill...");
                        handleConvert(order);
                    } else {
                        toast.error("Order not found on server.");
                    }
                } catch (e) {
                    toast.error("Failed to fetch order details.");
                }
            }
        });
    };

    /* ── Delete Order ── */
    const handleDeleteOrder = async (orderId: string, orderNumber: string) => {
        Alert.alert(
            'Delete Order',
            `Are you sure you want to delete Order ${orderNumber}? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const toastId = toast.loading(`Deleting Order ${orderNumber}...`);
                        const result = await dispatch(deleteOrder(orderId));
                        if (deleteOrder.fulfilled.match(result)) {
                            toast.success('Order deleted successfully', { id: toastId });
                            loadOrders(); // Refresh the list after deletion
                        } else {
                            toast.error(result.payload as string || 'Failed to delete order', { id: toastId });
                        }
                    }
                }
            ]
        );
    };

    /* ── Export Actions ── */
    const exportColumns: ExportColumn[] = [
        { key: 'orderNumber', title: 'Order No' },
        { key: 'customer', title: 'Customer', render: (o) => o.customer?.name || 'N/A' },
        { key: 'phone', title: 'Phone', render: (o) => o.customer?.phone || 'N/A' },
        { key: 'totalAmount', title: 'Total', render: (o) => formatCurrency(o.totalAmount) },
        { key: 'status', title: 'Status' },
        { key: 'createdAt', title: 'Date', render: (o) => new Date(o.createdAt).toLocaleDateString() },
    ];

    const handleExportCSV = () => {
        exportToCSV(filteredOrders, exportColumns, 'Orders_Report');
    };

    const handlePrint = () => {
        printData('Orders Report', filteredOrders, exportColumns, 'print');
    };

    /* ── Share Order QR/PDF Link ── */
    const handleShareOrder = async (orderNumber: string) => {
        const encrypted = orderNumber.split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('');
        const shareUrl = `${BACKEND_API_URL}/orders/pdf/${encrypted}`;

        try {
            await Share.share({
                message: `View Order Bill for ${orderNumber}: ${shareUrl}`,
                url: shareUrl,
                title: `Order ${orderNumber}`
            });
        } catch (error) {
            console.error("Share Error:", error);
        }
    };

    /* ── Download PDF ── */
    const downloadOrderPDF = async (orderNumber: string) => {
        // Hex encode order number for secure URL
        const encrypted = orderNumber.split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('');
        const pdfUrl = `${BACKEND_API_URL}/orders/pdf/${encrypted}`;

        if (Platform.OS === 'web') {
            try {
                const response = await fetch(pdfUrl);
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `Order_${orderNumber}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            } catch (error) {
                console.error("Web Download Error:", error);
                toast.error('Could not save the order PDF.');
            }
        } else {
            try {
                await permissionUtils.withPermission('download', async () => {
                    const { dirs } = ReactNativeBlobUtil.fs;
                    const fileName = `Order_${orderNumber.replace(/[^a-zA-Z0-9-]/g, '_')}.pdf`;
                    const path = `${dirs.DownloadDir}/${fileName}`;

                    const res = await ReactNativeBlobUtil.config({
                        fileCache: true,
                        path: path,
                    }).fetch('GET', pdfUrl);

                    await ReactNativeBlobUtil.android.addCompleteDownload({
                        title: fileName,
                        description: 'Order bill downloaded',
                        mime: 'application/pdf',
                        path: res.path(),
                        showNotification: true,
                    });

                    toast.success('Order PDF saved to Downloads.');
                });
            } catch (error) {
                console.error("Android Download Error:", error);
                toast.error('Failed to download PDF');
            }
        }
    };

    /* ── Search filter ── */
    const filteredOrders = orders; // Filtering now handled by server

    /* ── Stats ── */
    const stats = useMemo(() => {
        const totalValue = orders.reduce((sum, o) => sum + parseFloat(String(o.totalAmount || 0)), 0);
        const pendingCount = orders.filter(o => o.status === 'pending').length;
        const convertedCount = orders.filter(o => o.status === 'converted').length;

        return [
            { label: 'Total Orders', value: String(orders.length), icon: ShoppingCart, color: '#6366F1', bgColor: '#EEF2FF' },
            { label: 'Total Value', value: formatCurrency(totalValue), icon: TrendingUp, color: '#10B981', bgColor: '#ECFDF5' },
            { label: 'Pending', value: String(pendingCount), icon: Clock, color: '#F59E0B', bgColor: '#FFFBEB' },
            { label: 'Converted', value: String(convertedCount), icon: CheckCircle2, color: '#8B5CF6', bgColor: '#F5F3FF' },
        ];
    }, [orders]);

    const handleViewOrder = (orderNumber: string) => {
        navigation.navigate('PDFViewer', { orderNumber, type: 'order' });
    };

    /* ── Table Columns ── */
    const orderColumns: Column[] = [
        {
            key: 'orderNumber',
            title: 'Order No',
            width: 150,
            render: (order: any) => (
                <Text className="font-bold text-primary">{order.orderNumber}</Text>
            ),
        },
        {
            key: 'customer',
            title: 'Customer',
            width: 200,
            render: (order: any) => (
                <View>
                    <Text className="font-bold text-gray-800" numberOfLines={1}>{order.customer?.name || 'N/A'}</Text>
                    <Text className="text-xs text-gray-500">{formatIdentityDisplay(order.customer?.phone)}</Text>
                </View>
            ),
        },
        {
            key: 'totalAmount',
            title: 'Total Amount',
            width: 130,
            align: 'right',
            render: (order: any) => (
                <Text className="font-black text-gray-900">{formatCurrency(order.totalAmount)}</Text>
            ),
        },
        {
            key: 'status',
            title: 'Status',
            width: 120,
            render: (order: any) => (
                <View className={clsx(
                    'px-2.5 py-1 rounded-full self-start',
                    order.status === 'pending' && 'bg-yellow-50',
                    order.status === 'confirmed' && 'bg-green-50',
                    order.status === 'converted' && 'bg-blue-50',
                )}>
                    <Text className={clsx(
                        'text-[10px] font-black uppercase',
                        order.status === 'pending' && 'text-yellow-700',
                        order.status === 'confirmed' && 'text-green-700',
                        order.status === 'converted' && 'text-blue-700',
                    )}>
                        {order.status}
                    </Text>
                </View>
            ),
        },
        {
            key: 'createdAt',
            title: 'Date',
            width: 130,
            render: (order: any) => (
                <Text className="text-xs text-gray-500 font-medium">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </Text>
            ),
        },
        {
            key: 'actions',
            title: 'Actions',
            width: 240,
            align: 'center',
            render: (order: any) => (
                <View className="flex-row items-center gap-2">
                    <TouchableOpacity
                        onPress={() => handleViewOrder(order.orderNumber)}
                        className="p-2 bg-purple-50 rounded-xl border border-purple-100 active:bg-purple-100"
                    >
                        <Eye size={18} color="#7C3AED" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => downloadOrderPDF(order.orderNumber)}
                        className="p-2 bg-blue-50 rounded-xl border border-blue-100 active:bg-blue-100"
                    >
                        <Download size={18} color="#3B82F6" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => handleShareOrder(order.orderNumber)}
                        className="p-2 bg-orange-50 rounded-xl border border-orange-100 active:bg-orange-100"
                    >
                        <Share2 size={18} color="#F97316" />
                    </TouchableOpacity>

                    {order.status !== 'converted' && (
                        <TouchableOpacity
                            onPress={() => handleConvert(order)}
                            className="p-2 bg-green-50 rounded-xl border border-green-100 active:bg-green-100"
                        >
                            <ClipboardCheck size={18} color="#10B981" />
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        onPress={() => handleDeleteOrder(order.id, order.orderNumber)}
                        className="p-2 bg-red-50 rounded-xl border border-red-100 active:bg-red-100"
                    >
                        <Trash2 size={18} color="#EF4444" />
                    </TouchableOpacity>
                </View>
            ),
        },
    ];

    return (
        <View className="flex-1 bg-background-light">
            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
            <Header title="Manage Orders" icon={ShoppingCart} navigation={navigation} />

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingBottom: insets.bottom + 20,
                    paddingHorizontal: isWeb ? 32 : 16,
                    paddingTop: 16,
                }}
            >
                {/* Stats */}
                <View className="flex-row flex-wrap -mx-2 mb-6">
                    {stats.map((stat, idx) => (
                        <View key={idx} style={{ width: width >= 768 ? '25%' : '50%', padding: 8 }}>
                            <View className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex-row items-center">
                                <View style={{ backgroundColor: stat.bgColor }} className="w-11 h-11 rounded-2xl items-center justify-center mr-3">
                                    <stat.icon size={22} color={stat.color} />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-gray-400 text-[10px] font-black uppercase tracking-wider">{stat.label}</Text>
                                    <Text className="text-lg font-black text-gray-800" numberOfLines={1}>{stat.value}</Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Filters & Actions */}
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
                                placeholder="Search orders, customers..."
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
                                <TouchableOpacity
                                    onPressIn={() => startListening()}
                                    activeOpacity={0.7}
                                    className={clsx(
                                        "p-1.5 rounded-full transition-all",
                                        isListening ? "bg-red-500 shadow-md shadow-red-200" : "bg-indigo-50"
                                    )}
                                >
                                    <Mic size={16} color={isListening ? "#FFFFFF" : "#4F46E5"} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleScanOrderQR}
                                    activeOpacity={0.7}
                                    className="p-1.5 rounded-full bg-indigo-50 transition-all"
                                >
                                    <ScanLine size={16} color="#4F46E5" />
                                </TouchableOpacity>
                            </View>
                        </View>

                    </View>

                    {/* Status Tabs */}
                    <View className="border-t border-slate-50 pt-5">
                        <Text className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">
                            Filter by status
                        </Text>
                        <StatusFilter
                            currentStatus={statusFilter}
                            onStatusChange={setStatusFilter}
                        />
                    </View>
                </View>
                <DataTable
                    columns={orderColumns}
                    data={orders}
                    isLoading={isLoading}
                    keyExtractor={(item) => item.id}
                    emptyMessage="No orders found. Start by creating an enquiry!"
                    pagination={true}
                    pageSize={pageSize}
                    totalItems={serverPagination?.total}
                    currentPage={currentPage}
                    onPageChange={(page, size) => {
                        setCurrentPage(page);
                        setPageSize(size);
                    }}
                    containerStyle={{
                        borderRadius: 16,
                    }}
                />
            </ScrollView>
        </View>
    );
};

const StatusFilter = ({ currentStatus, onStatusChange }: { currentStatus: string, onStatusChange: (s: any) => void }) => {
    const getStatusStyles = (status: string, isActive: boolean) => {
        if (!isActive) return { container: 'bg-slate-50 border-slate-100', text: 'text-slate-500' };

        switch (status) {
            case 'pending': return { container: 'bg-amber-500 border-amber-600 shadow-amber-200', text: 'text-white' };
            case 'confirmed': return { container: 'bg-emerald-500 border-emerald-600 shadow-emerald-200', text: 'text-white' };
            case 'converted': return { container: 'bg-indigo-500 border-indigo-600 shadow-indigo-200', text: 'text-white' };
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
            {STATUS_OPTIONS.map((s) => {
                const isActive = currentStatus === s;
                const styles = getStatusStyles(s, isActive);

                return (
                    <TouchableOpacity
                        key={s}
                        onPress={() => onStatusChange(s)}
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
                            {s}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
};

export default OrderScreen;
