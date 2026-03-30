// src/screens/CreateBillScreen.tsx
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
    ActivityIndicator,
    StyleSheet,
    KeyboardAvoidingView,
    Image,
    Pressable,
} from 'react-native';
import { toast } from '../components/common/Toast';
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    ChevronLeft,
    Plus,
    Trash2,
    Save,
    User,
    Phone,
    Mail,
    MapPin,
    ShoppingCart,
    Search,
    X,
    Minus,
    CreditCard,
    Banknote,
    SmartphoneNfc,
    Package,
    Tag,
    FileText,
    Mic,
    Pause,
    Check,
    Scan,
    Play,
    StopCircle,
} from 'lucide-react-native';
import { useAudioRecorder, VoiceSegment } from '../hooks/useAudioRecorder';
import { COLORS } from '../Constants/Colors';
import { useAppDispatch, useAppSelector } from '../redux/Store';
import { fetchProducts } from '../redux/Slice/ProductSlice';
import CustomModal from '../components/common/CustomModal';
import CustomDropDown from '../components/common/CustomDropDown';
import { clsx } from 'clsx';
import { formatCurrency, formatIdentityDisplay, cleanIdentityInput } from '../utils/Formatter';
import { Bill, Product } from '../redux/types';
import { createInvoice, updateInvoice, deleteInvoice, getInvoiceById } from '../redux/Slice/InvoiceSlice';
import { fetchCategories } from '../redux/Slice/CategorySlice';
import { BACKEND_API_URL } from '../Constants';

const API_BASE_URL = BACKEND_API_URL.split('/api')[0];

const getSafeImageUrl = (imagePath: string | null | undefined) => {
    if (!imagePath) return null;
    const path = imagePath.replace(/\\/g, '/');
    return `${API_BASE_URL}/${path.startsWith('/') ? path.slice(1) : path}`;
};

/* ─── Types ─────────────────────────────────────── */
interface CartItem {
    productId: string;
    productName: string;
    image?: string | null;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

/* ─── Component ─────────────────────────────────── */
const CreateBillScreen = ({ navigation, route }: any) => {
    const { billId, viewOnly, orderData } = route.params || {};
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const isWeb = Platform.OS === 'web' && width >= 980;

    const dispatch = useAppDispatch();
    const { products } = useAppSelector((state) => state.products);
    const { user } = useAppSelector((state) => state.auth);

    // Loading states
    const [isLoadingBill, setIsLoadingBill] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Current bill (for edit mode)
    const [currentBill, setCurrentBill] = useState<Bill | null>(null);

    // Product modal
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [productSearch, setProductSearch] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState('');

    const { categories } = useAppSelector((state) => state.categories);

    // Customer form
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');

    // Invoice fields
    const [cart, setCart] = useState<CartItem[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'card'>('cash');
    const [discountAmount, setDiscountAmount] = useState('0');
    const [taxAmount, setTaxAmount] = useState('0');
    const [notes, setNotes] = useState('');
    const [isVoiceProcessing, setIsVoiceProcessing] = useState(false);
    const {
        isSessionActive,
        isRecording,
        isPaused: isAudioPaused,
        recordTime,
        segments,
        liveText,
        onStartRecord,
        onPauseRecord,
        onResumeRecord,
        onStopRecord,
        deleteSegment,
        clearAllSegments,
        combinedTranscript,
    } = useAudioRecorder();

    // State to track voiceModal visibility
    const [isVoiceModalVisible, setIsVoiceModalVisible] = useState(false);

    const handleAudioBillingSubmit = async () => {
        if (segments.length === 0) {
            toast.warning('Record at least one voice command.');
            return;
        }

        setIsVoiceProcessing(true);
        try {
            const transcript = combinedTranscript();
            console.log('Sending combined voice transcript:', transcript);

            const response = await fetch(`${BACKEND_API_URL}/voice-billing/process`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transcript }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server error: ${errorText.slice(0, 100)}`);
            }
            const data = await response.json();

            if (data.success && data.items) {
                // Same logic as before to update cart
                let noStockMsgs: string[] = [];
                let lowStockMsgs: string[] = [];

                setCart(prev => {
                    const nextCart = [...prev];
                    data.items.forEach((detected: any) => {
                        const { action, productId, product, requested, status } = detected;
                        const actualQty = Number(requested) || 1;

                        if (status === 'NOT_FOUND') {
                            noStockMsgs.push(`${product} (Not Found)`);
                            return;
                        }

                        const existingIdx = nextCart.findIndex(i => i.productId === productId);

                        if (action === 'REMOVE') {
                            if (existingIdx !== -1) {
                                const currentQty = nextCart[existingIdx].quantity;
                                if (currentQty > actualQty) {
                                    nextCart[existingIdx].quantity -= actualQty;
                                    nextCart[existingIdx].totalPrice = nextCart[existingIdx].quantity * nextCart[existingIdx].unitPrice;
                                } else {
                                    nextCart.splice(existingIdx, 1);
                                }
                            }
                            return;
                        }

                        if (action === 'UPDATE') {
                            if (existingIdx !== -1) {
                                nextCart[existingIdx].quantity = actualQty;
                                nextCart[existingIdx].totalPrice = actualQty * nextCart[existingIdx].unitPrice;
                            } else if (status !== 'OUT_OF_STOCK') {
                                nextCart.push({
                                    productId: productId,
                                    productName: product,
                                    image: detected.image,
                                    quantity: actualQty,
                                    unitPrice: parseFloat(detected.unitPrice || 0),
                                    totalPrice: parseFloat(detected.unitPrice || 0) * actualQty,
                                });
                            }
                            return;
                        }

                        if (status === 'OUT_OF_STOCK') {
                            noStockMsgs.push(`${product} (Out of Stock)`);
                            return;
                        }

                        if (status === 'LOW_STOCK') {
                            lowStockMsgs.push(`${product} (Stock: ${detected.stock}, Requested: ${actualQty})`);
                        }

                        if (existingIdx !== -1) {
                            nextCart[existingIdx].quantity += actualQty;
                            nextCart[existingIdx].totalPrice = nextCart[existingIdx].quantity * nextCart[existingIdx].unitPrice;
                        } else {
                            nextCart.push({
                                productId: productId,
                                productName: product,
                                image: detected.image,
                                quantity: actualQty,
                                unitPrice: parseFloat(detected.unitPrice || 0),
                                totalPrice: parseFloat(detected.unitPrice || 0) * actualQty,
                            });
                        }
                    });
                    return nextCart;
                });

                if (noStockMsgs.length > 0 || lowStockMsgs.length > 0) {
                    let alertMsg = '';
                    if (noStockMsgs.length > 0) alertMsg += `🚫 Errors:\n${noStockMsgs.join('\n')}\n\n`;
                    if (lowStockMsgs.length > 0) alertMsg += `⚠️ Low Stock:\n${lowStockMsgs.join('\n')}\n\n`;
                    Alert.alert('Voice Billing Update', alertMsg);
                }
                
                setIsVoiceModalVisible(false);
                clearAllSegments();
            } else {
                toast.error(data.msg || 'Could not process voice billing');
            }
        } catch (err: any) {
            console.error('Audio Processing API Error:', err);
            toast.error('Failed to reach AI billing server.');
        } finally {
            setIsVoiceProcessing(false);
        }
    };

    useEffect(() => {
        dispatch(fetchProducts());
        dispatch(fetchCategories());
        if (billId) {
            loadBill(billId);
        } else if (orderData) {
            // Pre-fill from Order
            setCustomerName(orderData.customer?.name || orderData.customerName || '');
            setCustomerPhone(orderData.customer?.phone || orderData.customerPhone || '');
            setCustomerEmail(orderData.customer?.email || orderData.customerEmail || '');
            setCustomerAddress(orderData.customer?.address || orderData.customerAddress || '');
            setNotes(`Converted from Order #${orderData.orderNumber}\n${orderData.notes || ''}`);

            if (orderData.items) {
                setCart(orderData.items.map((item: any) => ({
                    productId: item.productId,
                    productName: item.productName || item.product?.name || '', // Use snapshot
                    image: item.productImage || item.product?.image || null, // Use snapshot
                    quantity: Number(item.quantity),
                    unitPrice: parseFloat(String(item.unitPrice)),
                    totalPrice: parseFloat(String(item.totalPrice)),
                })));
            }
        }
    }, [billId, orderData]);

    const loadBill = async (id: string) => {
        setIsLoadingBill(true);
        try {
            const resultAction = await dispatch(getInvoiceById(id));
            if (getInvoiceById.fulfilled.match(resultAction)) {
                const bill = resultAction.payload;
                setCurrentBill(bill);

                // Populate form
                setCustomerName(bill.customer?.name || '');
                setCustomerPhone(bill.customer?.phone || '');
                setCustomerEmail(bill.customer?.email || '');
                setCustomerAddress(bill.customer?.address || '');
                setPaymentMethod(bill.paymentMethod || 'cash');
                setDiscountAmount(String(bill.discountAmount ?? '0'));
                setTaxAmount(String(bill.taxAmount ?? '0'));
                setNotes(bill.notes || '');

                if (bill.items) {
                    setCart(
                        bill.items.map((item: any) => ({
                            productId: item.productId,
                            productName: item.productName || item.product?.name || '', // Use snapshot
                            image: item.productImage || item.product?.image || null, // Use snapshot
                            quantity: Number(item.quantity),
                            unitPrice: parseFloat(String(item.unitPrice)),
                            totalPrice: parseFloat(String(item.totalPrice)),
                        }))
                    );
                }
            } else {
                toast.error(resultAction.payload as string || 'Failed to load invoice.');
            }
        } catch (error: any) {
            toast.error('Failed to load invoice.');
        } finally {
            setIsLoadingBill(false);
        }
    };

    /* ── Calculations ── */
    const subTotal = useMemo(() => cart.reduce((sum, i) => sum + i.totalPrice, 0), [cart]);

    const grandTotal = useMemo(() => {
        const discount = parseFloat(discountAmount) || 0;
        const tax = parseFloat(taxAmount) || 0;
        return subTotal - discount + tax;
    }, [subTotal, discountAmount, taxAmount]);

    /* ── Cart helpers ── */
    const handleAddToCart = useCallback((product: Product) => {
        const unitPrice = parseFloat(String(product.sellingPrice));
        setCart((prev) => {
            const idx = prev.findIndex((i) => i.productId === product.id);
            if (idx !== -1) {
                const updated = [...prev];
                const newQty = updated[idx].quantity + 1;
                updated[idx] = { ...updated[idx], quantity: newQty, totalPrice: newQty * unitPrice };
                return updated;
            }
            return [
                ...prev,
                {
                    productId: product.id,
                    productName: product.name,
                    image: product.image,
                    quantity: 1,
                    unitPrice,
                    totalPrice: unitPrice
                },
            ];
        });
        setIsProductModalOpen(false);
    }, []);

    const updateQuantity = useCallback((index: number, delta: number) => {
        setCart((prev) => {
            const updated = [...prev];
            const newQty = updated[index].quantity + delta;
            if (newQty <= 0) {
                updated.splice(index, 1);
            } else {
                updated[index] = { ...updated[index], quantity: newQty, totalPrice: newQty * updated[index].unitPrice };
            }
            return updated;
        });
    }, []);

    const categoryOptions = useMemo(() => {
        return categories.map(cat => ({ label: cat.name, value: cat.id }));
    }, [categories]);

    /* ── Save ── */
    const handleSaveBill = async () => {
        if (!customerPhone.trim()) {
            toast.warning('Customer phone number is required.');
            return;
        }
        if (cart.length === 0) {
            toast.warning('Add at least one product.');
            return;
        }

        setIsSaving(true);
        const payload = {
            customerName: customerName.trim() || undefined,
            customerPhone: cleanIdentityInput(customerPhone),
            customerEmail: customerEmail.trim() || undefined,
            customerAddress: customerAddress.trim() || undefined,
            items: cart.map((item) => ({
                productId: item.productId,
                productName: item.productName,
                productImage: item.image,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice,
            })),
            subTotal,
            discountAmount: parseFloat(discountAmount) || 0,
            taxAmount: parseFloat(taxAmount) || 0,
            totalAmount: grandTotal,
            paymentMethod,
            userId: user?.id,
            notes: notes.trim() || undefined,
            orderId: orderData?.id // Add reference to original order if converting
        };

        try {
            let resultAction;
            if (billId) {
                resultAction = await dispatch(updateInvoice({ id: billId, invoiceData: payload }));
            } else {
                resultAction = await dispatch(createInvoice(payload));
            }

            if (createInvoice.fulfilled.match(resultAction) || updateInvoice.fulfilled.match(resultAction)) {
                toast.success(`Invoice ${billId ? 'updated' : 'created'} successfully.`);
                navigation.navigate('bills');
            } else {
                toast.error(resultAction.payload as string || `Failed to ${billId ? 'update' : 'create'} invoice.`);
            }
        } catch (error: any) {
            toast.error(`Failed to ${billId ? 'save' : 'save'} invoice.`);
        } finally {
            setIsSaving(false);
        }
    };

    /* ── Delete ── */
    const handleDeleteBill = async () => {
        setIsDeleting(true);
        try {
            const resultAction = await dispatch(deleteInvoice(billId));
            if (deleteInvoice.fulfilled.match(resultAction)) {
                navigation.goBack();
                toast.success('Invoice deleted successfully.');
            } else {
                toast.error(resultAction.payload as string || 'Failed to delete invoice.');
            }
        } catch (error: any) {
            toast.error('Failed to delete invoice.');
        } finally {
            setIsDeleting(false);
        }
    };

    /* ── Filtered products ── */
    const filteredProducts = useMemo(() =>
        products.filter(
            (p) =>
                p.isActive &&
                p.name.toLowerCase().includes(productSearch.toLowerCase()) &&
                (selectedCategoryId === '' || p.categoryId === selectedCategoryId)
        ),
        [products, productSearch, selectedCategoryId]
    );

    /* ── Render (loading state for edit) ── */
    if (billId && isLoadingBill) {
        return (
            <View className="flex-1 items-center justify-center bg-background-light">
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text className="mt-4 text-gray-500 font-medium">Loading invoice...</Text>
            </View>
        );
    }

    /* ── JSX ── */
    return (
        <View className="flex-1 bg-background-light">
            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

            {/* Top bar */}
            <View
                className="flex-row items-center px-4 py-3 bg-white border-b border-gray-100 shadow-sm"
                style={{ paddingTop: Math.max(insets.top, 12) }}
            >
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="p-2 -ml-2 rounded-xl bg-gray-50 active:bg-gray-100"
                >
                    <ChevronLeft size={24} color={COLORS.text.primary} />
                </TouchableOpacity>

                <View className="ml-3 flex-1">
                    <Text className="text-xl font-black text-gray-800">
                        {viewOnly ? 'View Invoice' : billId ? 'Edit Invoice' : 'Create Invoice'}
                    </Text>
                    {billId && currentBill?.invoiceNumber && (
                        <Text className="text-xs text-primary font-bold">
                            {currentBill.invoiceNumber}
                        </Text>
                    )}
                </View>

                {billId && !viewOnly && (
                    <TouchableOpacity
                        onPress={() =>
                            Alert.alert(
                                'Delete Invoice',
                                `Delete ${currentBill?.invoiceNumber || 'this invoice'}? This cannot be undone.`,
                                [
                                    { text: 'Cancel', style: 'cancel' },
                                    { text: 'Delete', style: 'destructive', onPress: handleDeleteBill },
                                ]
                            )
                        }
                        disabled={isDeleting}
                        className={clsx('p-2.5 bg-red-50 rounded-xl active:bg-red-100', isDeleting && 'opacity-50')}
                    >
                        {isDeleting
                            ? <ActivityIndicator size="small" color="#ef4444" />
                            : <Trash2 size={20} color="#ef4444" />
                        }
                    </TouchableOpacity>
                )}
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{
                        padding: 16,
                        paddingBottom: insets.bottom + 130,
                        paddingTop: isWeb ? 32 : 16,
                    }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Customer card */}
                    <View className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 mb-5">
                        <View className="flex-row items-center mb-4">
                            <View className="w-10 h-10 rounded-2xl bg-primary/10 items-center justify-center">
                                <User size={20} color={COLORS.primary} />
                            </View>
                            <Text className="text-base font-bold text-gray-800 ml-3 uppercase tracking-wider">
                                Customer Details
                            </Text>
                        </View>

                        <View className="gap-y-4">
                            {/* Phone */}
                            <View>
                                <Text className="text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">
                                    Phone Number <Text className="text-red-500">*</Text>
                                </Text>
                                <View className="relative">
                                    <View className="absolute left-4 top-3.5 z-10">
                                        <Phone size={18} color="#94a3b8" />
                                    </View>
                                    <TextInput
                                        className="bg-gray-50 border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 font-semibold text-gray-800"
                                        placeholder="Enter phone number"
                                        placeholderTextColor={'gray'}
                                        keyboardType="phone-pad"
                                        editable={!viewOnly}
                                        value={formatIdentityDisplay(customerPhone)}
                                        onChangeText={(v) => setCustomerPhone(cleanIdentityInput(v))}
                                    />
                                </View>
                            </View>

                            {/* Name + Email */}
                            <View className="flex-row gap-x-3">
                                <View className="flex-1">
                                    <Text className="text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Name</Text>
                                    <TextInput
                                        className="bg-gray-50 border border-gray-100 rounded-2xl py-3.5 px-4 font-semibold text-gray-800"
                                        placeholder="Full Name"
                                        placeholderTextColor={'gray'}
                                        editable={!viewOnly}
                                        value={customerName}
                                        onChangeText={setCustomerName}
                                    />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Email</Text>
                                    <View className="relative">
                                        <View className="absolute left-4 top-3.5 z-10">
                                            <Mail size={18} color="#94a3b8" />
                                        </View>
                                        <TextInput
                                            className="bg-gray-50 border border-gray-100 rounded-2xl py-3.5 pl-11 pr-4 font-semibold text-gray-800"
                                            placeholder="email@example.com"
                                            keyboardType="email-address"
                                            placeholderTextColor={'gray'}
                                            editable={!viewOnly}
                                            value={customerEmail}
                                            onChangeText={setCustomerEmail}
                                        />
                                    </View>
                                </View>
                            </View>

                            {/* Address */}
                            <View>
                                <Text className="text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Address</Text>
                                <View className="relative">
                                    <View className="absolute left-4 top-3.5 z-10">
                                        <MapPin size={18} color="#94a3b8" />
                                    </View>
                                    <TextInput
                                        className="bg-gray-50 border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 font-semibold text-gray-800 min-h-[80px]"
                                        placeholder="Street, City, State..."
                                        multiline
                                        textAlignVertical="top"
                                        placeholderTextColor={'gray'}
                                        editable={!viewOnly}
                                        value={customerAddress}
                                        onChangeText={setCustomerAddress}
                                    />
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Cart header */}
                    <View className="flex-row items-center justify-between mb-3 px-2">
                        <View className="flex-row items-center">
                            <ShoppingCart size={22} color={COLORS.primary} />
                            <Text className="text-base font-bold text-gray-800 ml-2 uppercase tracking-wider">Items</Text>
                        </View>
                        <View className="flex-row items-center gap-x-2">
                            {/* QR Scan Button */}
                            {!viewOnly && (
                                <Pressable
                                    onPress={() => navigation.navigate('QRScan', {
                                        onScan: (barcode: string) => {
                                            // Handle barcode match logic here
                                            const matchedProduct = products.find(p => p.id === barcode || p.name === barcode);
                                            if (matchedProduct) {
                                                handleAddToCart(matchedProduct);
                                                toast.success(`Added ${matchedProduct.name}`);
                                            } else {
                                                toast.error('Product not found for this code');
                                            }
                                        }
                                    })}
                                    className="p-2 rounded-full bg-gray-100 items-center justify-center"
                                >
                                    <Scan size={20} color={COLORS.primary} />
                                </Pressable>
                            )}

                            {/* Smart Voice Billing Button */}
                            {!viewOnly && (
                                <Pressable
                                    onPress={() => setIsVoiceModalVisible(true)}
                                    disabled={isVoiceProcessing}
                                    className={clsx(
                                        'px-3 py-1.5 rounded-full flex-row items-center bg-blue-500',
                                        isVoiceProcessing && 'opacity-50'
                                    )}
                                >
                                    {isVoiceProcessing ? (
                                        <ActivityIndicator size="small" color="white" />
                                    ) : (
                                        <>
                                            <Mic size={14} color="white" />
                                            <Text className="text-white font-bold text-xs ml-1">
                                                VOICE ADD
                                            </Text>
                                        </>
                                    )}
                                </Pressable>
                            )}

                            <View className="bg-primary/10 px-3 py-1.5 rounded-full">
                                <Text className="text-primary font-bold text-xs">{cart.length} ITEMS</Text>
                            </View>
                        </View>
                    </View>

                    {/* Cart items */}
                    {cart.length === 0 ? (
                        <View className="bg-white rounded-3xl p-10 items-center border border-dashed border-gray-200 mb-5">
                            <ShoppingCart size={48} color="#cbd5e1" strokeWidth={1} />
                            <Text className="text-gray-400 font-medium mt-4">Cart is empty</Text>
                            {!viewOnly && (
                                <TouchableOpacity
                                    onPress={() => setIsProductModalOpen(true)}
                                    className="mt-4 bg-primary/10 px-6 py-2.5 rounded-full"
                                >
                                    <Text className="text-primary font-bold">+ Add Product</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ) : (
                        <View className="mb-5">
                            {/* Responsive Grid / List */}
                            <View
                                className={clsx(width < 700 ? "gap-y-3" : "flex-row flex-wrap -mx-1.5")}
                            >
                                {cart.map((item, idx) => {
                                    const colCount = width >= 1200 ? 3 : (width >= 700 ? 2 : 1);
                                    const itemWidth = colCount > 1 ? `${100 / colCount}%` : '100%';

                                    return (
                                        <View
                                            key={`${item.productId}-${idx}`}
                                            style={colCount > 1 ? { width: itemWidth as any, padding: 6 } : {}}
                                        >
                                            <View className="bg-white rounded-[24px] flex-row p-4 border border-gray-100 shadow-sm">
                                                <View className="w-16 h-16 bg-gray-50 rounded-2xl items-center justify-center border border-gray-100 overflow-hidden">
                                                    {item.image ? (
                                                        <Image
                                                            source={{ uri: getSafeImageUrl(item.image) as string }}
                                                            className="w-full h-full"
                                                            resizeMode="cover"
                                                        />
                                                    ) : (
                                                        <Package size={28} color="#94a3b8" strokeWidth={1} />
                                                    )}
                                                </View>

                                                <View className="flex-1 ml-4">
                                                    <View className="flex-row justify-between">
                                                        <View className="flex-1 pr-2">
                                                            <Text className="text-base font-bold text-gray-800" numberOfLines={2}>
                                                                {item.productName}
                                                            </Text>
                                                            <Text className="text-xs text-gray-500 mt-0.5">
                                                                {formatCurrency(item.unitPrice)} / unit
                                                            </Text>
                                                        </View>
                                                        <Text className="text-base font-black text-primary">
                                                            {formatCurrency(item.totalPrice)}
                                                        </Text>
                                                    </View>

                                                    <View className="flex-row items-center justify-between mt-3">
                                                        <View className="flex-row items-center bg-gray-50 rounded-xl px-2 py-1">
                                                            <TouchableOpacity
                                                                onPress={() => updateQuantity(idx, -1)}
                                                                disabled={viewOnly}
                                                                className={clsx('p-1.5 bg-white rounded-lg shadow-sm border border-gray-100', viewOnly && 'opacity-50')}
                                                            >
                                                                <Minus size={14} color={COLORS.primary} strokeWidth={3} />
                                                            </TouchableOpacity>
                                                            <Text className="mx-4 font-black text-gray-800 text-base">{item.quantity}</Text>
                                                            <TouchableOpacity
                                                                onPress={() => updateQuantity(idx, 1)}
                                                                disabled={viewOnly}
                                                                className={clsx('p-1.5 bg-primary rounded-lg', viewOnly && 'opacity-50')}
                                                            >
                                                                <Plus size={14} color="white" strokeWidth={3} />
                                                            </TouchableOpacity>
                                                        </View>

                                                        {!viewOnly && (
                                                            <TouchableOpacity onPress={() => updateQuantity(idx, -item.quantity)} className="p-2">
                                                                <Trash2 size={18} color="#ef4444" />
                                                            </TouchableOpacity>
                                                        )}
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>

                            {!viewOnly && (
                                <TouchableOpacity
                                    onPress={() => setIsProductModalOpen(true)}
                                    className="bg-primary/5 border border-dashed border-primary/30 rounded-2xl py-3 items-center mt-3"
                                >
                                    <Text className="text-primary font-bold">+ Add More Products</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    {/* Payment method */}
                    <View className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 mb-5">
                        <Text className="text-xs font-bold text-gray-500 uppercase mb-4 tracking-widest">
                            Payment Method
                        </Text>
                        <View className="flex-row gap-x-2">
                            {(
                                [
                                    { id: 'cash', icon: Banknote, label: 'Cash' },
                                    { id: 'upi', icon: SmartphoneNfc, label: 'UPI' },
                                    { id: 'card', icon: CreditCard, label: 'Card' },
                                ] as const
                            ).map((method) => (
                                <TouchableOpacity
                                    key={method.id}
                                    onPress={() => !viewOnly && setPaymentMethod(method.id)}
                                    disabled={viewOnly}
                                    className={clsx(
                                        'flex-1 items-center justify-center p-3.5 rounded-2xl border-2',
                                        paymentMethod === method.id
                                            ? 'bg-primary/5 border-primary'
                                            : 'bg-gray-50 border-transparent opacity-60'
                                    )}
                                >
                                    <method.icon
                                        size={22}
                                        color={paymentMethod === method.id ? COLORS.primary : '#94a3b8'}
                                    />
                                    <Text className={clsx(
                                        'text-xs font-bold mt-2',
                                        paymentMethod === method.id ? 'text-primary' : 'text-gray-400'
                                    )}>
                                        {method.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Discount / Tax / Notes */}
                    <View className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                        <Text className="text-xs font-bold text-gray-500 uppercase mb-4 tracking-widest">
                            Adjustments & Notes
                        </Text>

                        <View className="flex-row gap-x-3 mb-4">
                            <View className="flex-1">
                                <View className="flex-row items-center mb-1.5 ml-1 gap-1">
                                    <Tag size={12} color="#6b7280" />
                                    <Text className="text-xs font-bold text-gray-500 uppercase">Discount</Text>
                                </View>
                                <TextInput
                                    className="bg-gray-50 border border-gray-100 rounded-2xl py-3.5 px-4 font-semibold text-gray-800"
                                    placeholder="0.00"
                                    placeholderTextColor={'gray'}
                                    keyboardType="numeric"
                                    editable={!viewOnly}
                                    value={discountAmount}
                                    onChangeText={setDiscountAmount}
                                />
                            </View>
                            <View className="flex-1">
                                <View className="flex-row items-center mb-1.5 ml-1 gap-1">
                                    <Tag size={12} color="#6b7280" />
                                    <Text className="text-xs font-bold text-gray-500 uppercase">Tax</Text>
                                </View>
                                <TextInput
                                    className="bg-gray-50 border border-gray-100 rounded-2xl py-3.5 px-4 font-semibold text-gray-800"
                                    placeholder="0.00"
                                    placeholderTextColor={'gray'}
                                    keyboardType="numeric"
                                    editable={!viewOnly}
                                    value={taxAmount}
                                    onChangeText={setTaxAmount}
                                />
                            </View>
                        </View>

                        <View>
                            <View className="flex-row items-center mb-1.5 ml-1 gap-1">
                                <FileText size={12} color="#6b7280" />
                                <Text className="text-xs font-bold text-gray-500 uppercase">Notes</Text>
                            </View>
                            <TextInput
                                className="bg-gray-50 border border-gray-100 rounded-2xl py-3.5 px-4 font-semibold text-gray-800 min-h-[80px]"
                                placeholder="Add any notes..."
                                multiline
                                textAlignVertical="top"
                                placeholderTextColor={'gray'}
                                editable={!viewOnly}
                                value={notes}
                                onChangeText={setNotes}
                            />
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Bottom summary bar */}
            <View
                className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 py-4 shadow-2xl"
                style={{ paddingBottom: Math.max(insets.bottom, 16) }}
            >
                <View className="flex-row items-center justify-between">
                    <View>
                        <View className="flex-row gap-x-3">
                            <Text className="text-xs text-gray-400 font-bold">
                                Sub: {formatCurrency(subTotal)}
                            </Text>
                            {parseFloat(discountAmount) > 0 && (
                                <Text className="text-xs text-red-400 font-bold">
                                    -{formatCurrency(parseFloat(discountAmount))}
                                </Text>
                            )}
                            {parseFloat(taxAmount) > 0 && (
                                <Text className="text-xs text-blue-400 font-bold">
                                    +Tax {formatCurrency(parseFloat(taxAmount))}
                                </Text>
                            )}
                        </View>
                        <Text className="text-2xl font-black text-gray-800 mt-0.5">
                            {formatCurrency(grandTotal)}
                        </Text>
                    </View>

                    {!viewOnly && (
                        <TouchableOpacity
                            onPress={handleSaveBill}
                            disabled={isSaving}
                            className={clsx(
                                'bg-primary px-8 py-4 rounded-2xl flex-row items-center shadow-lg',
                                isSaving && 'opacity-70'
                            )}
                        >
                            {isSaving ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <>
                                    <Save size={20} color="white" strokeWidth={2.5} />
                                    <Text className="text-white font-black ml-2 text-base">
                                        {billId ? 'UPDATE' : 'SAVE'}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* FAB – open product picker */}
            {!viewOnly && (
                <TouchableOpacity
                    onPress={() => setIsProductModalOpen(true)}
                    style={[styles.fab, { bottom: insets.bottom + 100 }]}
                    className="bg-primary shadow-2xl elevation-8"
                >
                    <Plus size={32} color="white" strokeWidth={3} />
                </TouchableOpacity>
            )}

            {/* Product selection modal */}
            <CustomModal
                visible={isProductModalOpen}
                onClose={() => {
                    setIsProductModalOpen(false);
                    setProductSearch('');
                    setSelectedCategoryId('');
                }}
                title="Select Product"
                width={isWeb ? 800 : '95%'}
                maxWidth={900}
            >
                <View className="mb-4 relative">
                    <View className="absolute left-4 top-3.5 z-10">
                        <Search size={20} color="#94a3b8" />
                    </View>
                    <TextInput
                        className="bg-gray-50 border border-gray-100 rounded-2xl py-3.5 pl-12 pr-10 font-semibold text-gray-800"
                        placeholder="Search products..."
                        placeholderTextColor={'gray'}
                        value={productSearch}
                        onChangeText={setProductSearch}
                    />
                    {!!productSearch && (
                        <TouchableOpacity
                            onPress={() => setProductSearch('')}
                            className="absolute right-4 top-3.5 z-10"
                        >
                            <X size={18} color="#94a3b8" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Category Filter Dropdown */}
                <View className="mb-4" style={{ zIndex: 1000 }}>
                    <CustomDropDown
                        placeholder="Filter by Category"
                        items={[
                            { label: 'All Categories', value: '' },
                            ...categoryOptions
                        ]}
                        selectedValue={selectedCategoryId}
                        onSelect={(value) => {
                            setSelectedCategoryId(Array.isArray(value) ? value[0] : (value as string));
                        }}
                        searchable={true}
                        showClear={true}
                        className="w-full"
                    />
                </View>

                <ScrollView className="max-h-[60vh]" showsVerticalScrollIndicator={false}>
                    <View className="gap-y-2 pb-4">
                        {filteredProducts.map((product) => (
                            <TouchableOpacity
                                key={product.id}
                                onPress={() => handleAddToCart(product)}
                                className="bg-white border border-gray-100 rounded-2xl p-4 flex-row items-center active:bg-gray-50"
                            >
                                <View className="w-12 h-12 bg-gray-50 rounded-xl items-center justify-center overflow-hidden border border-gray-100">
                                    {product.image ? (
                                        <Image
                                            source={{ uri: getSafeImageUrl(product.image) as string }}
                                            className="w-full h-full"
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <Package size={24} color={COLORS.primary} />
                                    )}
                                </View>
                                <View className="ml-3 flex-1">
                                    <View className="flex-row items-center justify-between">
                                        <Text className="font-bold text-gray-800 flex-1" numberOfLines={1}>{product.name}</Text>
                                        <Text className="text-secondary font-black ml-2">
                                            {formatCurrency(product.sellingPrice)}
                                        </Text>
                                    </View>
                                    <View className="flex-row items-center mt-0.5">
                                        <Text className="text-xs text-gray-400">
                                            Cat: {categories.find(c => c.id === product.categoryId)?.name || 'N/A'}
                                        </Text>
                                        {product.mrp &&
                                            parseFloat(String(product.mrp)) > parseFloat(String(product.sellingPrice)) && (
                                                <Text className="text-gray-400 text-[10px] line-through ml-2">
                                                    {formatCurrency(product.mrp)}
                                                </Text>
                                            )}
                                    </View>
                                </View>
                                <View className="bg-primary/10 p-2 rounded-full ml-2">
                                    <Plus size={20} color={COLORS.primary} />
                                </View>
                            </TouchableOpacity>
                        ))}

                        {filteredProducts.length === 0 && (
                            <View className="items-center py-10">
                                <Search size={40} color="#cbd5e1" strokeWidth={1.5} />
                                <Text className="text-gray-400 mt-2">No products found</Text>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </CustomModal>

            {/* ─── Voice Processing Modal ─── */}
            <CustomModal
                visible={isVoiceModalVisible}
                onClose={() => {
                    if (!isRecording && !isVoiceProcessing) {
                        setIsVoiceModalVisible(false);
                    }
                }}
                title="Smart Voice Adding"
            >
                <View className="py-2">
                    {/* Recording Area */}
                    <View className="bg-blue-50 rounded-3xl p-6 items-center mb-6 border border-blue-100">
                        {/* Dynamic Avatar */}
                        <TouchableOpacity
                            onPress={isSessionActive ? onStopRecord : () => onStartRecord('ta-IN')}
                            className={clsx(
                                "w-24 h-24 rounded-full items-center justify-center shadow-2xl mb-4 border-4",
                                isSessionActive ? "bg-red-500 border-red-200" : "bg-blue-500 border-blue-200"
                            )}
                            style={{ elevation: isSessionActive ? 10 : 4 }}
                        >
                            {isSessionActive ? <StopCircle size={40} color="white" /> : <Mic size={40} color="white" />}
                        </TouchableOpacity>

                        <Text className="text-blue-600 font-black text-2xl mb-1">{recordTime}</Text>
                        <Text className="text-blue-500 text-sm font-bold tracking-widest uppercase">
                            {isSessionActive ? '🛑 Tap to Stop' : '🎙️ Tap mic to Speak'}
                        </Text>
                    </View>

                    {/* Live transcript preview */}
                    {(isSessionActive || isAudioPaused) && !!liveText && (
                        <View className="bg-gray-50 rounded-2xl px-4 py-3 mb-4 border border-gray-100">
                            <Text className="text-gray-400 text-[10px] font-bold uppercase mb-1">
                                {isRecording ? '🔴 Live...' : '⏸ Processing...'}
                            </Text>
                            <Text className="text-gray-700 text-sm italic" numberOfLines={3}>{liveText}</Text>
                        </View>
                    )}

                    {/* Segments List */}
                    <Text className="text-xs font-bold text-gray-400 uppercase mb-3 ml-2 tracking-widest">
                        Voice Segments ({segments.length})
                    </Text>
                    
                    <ScrollView className="max-h-[200px] mb-6">
                        {segments.length === 0 ? (
                            <View className="py-8 items-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                <Text className="text-gray-400 text-sm">No segments recorded yet</Text>
                            </View>
                        ) : (
                            <View className="gap-y-2">
                                {segments.map((seg, idx) => (
                                    <View key={seg.id} className="bg-white border border-gray-100 rounded-2xl p-3 flex-row items-center">
                                        <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center">
                                            <Text className="text-blue-600 font-bold text-xs">{idx + 1}</Text>
                                        </View>
                                        <View className="flex-1 ml-3">
                                            <Text className="text-gray-800 font-semibold text-sm" numberOfLines={2}>{seg.text}</Text>
                                        </View>
                                        <TouchableOpacity onPress={() => deleteSegment(seg.id)} className="p-2">
                                            <Trash2 size={18} color="#ef4444" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}
                    </ScrollView>

                    {/* Footer Actions */}
                    <View className="flex-row gap-x-3">
                        <TouchableOpacity
                            onPress={() => {
                                setIsVoiceModalVisible(false);
                                clearAllSegments();
                            }}
                            className="flex-1 bg-gray-100 py-4 rounded-2xl items-center"
                        >
                            <Text className="text-gray-500 font-bold">CANCEL</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            onPress={handleAudioBillingSubmit}
                            disabled={segments.length === 0 || isVoiceProcessing}
                            className={clsx(
                                "flex-[2] bg-green-500 py-4 rounded-2xl items-center flex-row justify-center",
                                (segments.length === 0 || isVoiceProcessing) && "opacity-50"
                            )}
                        >
                            {isVoiceProcessing ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <>
                                    <Check size={20} color="white" strokeWidth={3} />
                                    <Text className="text-white font-black ml-2 text-base">SUBMIT VOICES</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </CustomModal>
        </View>
    );
};

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        right: 24,
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
    },
});

export default CreateBillScreen;
