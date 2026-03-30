// src/screens/ProductScreen.tsx
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
import { Package, Search, Plus, Edit2, Trash2, RefreshCcw, X, Save, Upload, Printer, FileUp, ChevronLeft, Image as ImageIcon, Layers, Database } from 'lucide-react-native';
import { COLORS } from '../Constants/Colors';
import Header from '../components/Header';
import DataTable, { Column } from '../components/common/DataTable';
import { useAppDispatch, useAppSelector } from '../redux/Store';
import { fetchProducts, createProduct, updateProduct, deleteProduct, updateProductStock, clearError, resetSuccess } from '../redux/Slice/ProductSlice';
import { fetchCategories } from '../redux/Slice/CategorySlice';
import { fetchTags } from '../redux/Slice/TagSlice';
import CustomModal from '../components/common/CustomModal';
import ConfirmDelete from '../components/common/ConfirmDelete';
import CustomDropDown from '../components/common/CustomDropDown';
import { Product } from '../redux/types';
import clsx from 'clsx';
import { BACKEND_API_URL } from '../Constants';
import { IMAGES } from '../Constants/Images';
import { pick, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import { permissionUtils } from '../utils/permissionUtils';
import { exportToCSV, printData, ExportColumn } from '../utils/exportUtils';
import { readFileAsText, parseCSV, csvToObjects, validateRow, findMatch, getAliasedValue } from '../utils/importUtils';
import ImportPreviewModal, { PreviewRow } from '../components/common/ImportPreviewModal';

const API_BASE_URL = BACKEND_API_URL.split('/api')[0];

const getSafeImageUrl = (imagePath: string | null) => {
    if (!imagePath) return null;
    const path = imagePath.replace(/\\/g, '/');
    return `${API_BASE_URL}/${path.startsWith('/') ? path.slice(1) : path}`;
};

const ProductScreen = ({ navigation, route }: { navigation?: any, route?: any }) => {
    const categorySlugFromParams = route?.params?.categorySlug;
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const isWeb = Platform.OS === "web" && width >= 980;

    const dispatch = useAppDispatch();
    const { products, isLoading, error, success } = useAppSelector((state) => state.products);
    const { categories } = useAppSelector((state) => state.categories);
    const { tags } = useAppSelector((state) => state.tags);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
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

    // Stock Modal State
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [stockData, setStockData] = useState({ id: '', name: '', quantity: '0' });
    const [isUpdatingStock, setIsUpdatingStock] = useState(false);

    // Image Preview State
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [imagePreviewData, setImagePreviewData] = useState<{ uri: string; name: string } | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        categoryId: '',
        name: '',
        slug: '',
        rank: '0',
        mrp: '0',
        sellingPrice: '0',
        isActive: true,
        quantity: '0',
        tags: [] as string[],
    });
    const [selectedImage, setSelectedImage] = useState<any>(null);

    // Import Preview State
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [importPreviewData, setImportPreviewData] = useState<PreviewRow[]>([]);
    const [isImporting, setIsImporting] = useState(false);

    useEffect(() => {
        dispatch(fetchProducts());
        dispatch(fetchCategories());
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

    useEffect(() => {
        if (categorySlugFromParams && categories.length > 0) {
            const category = categories.find(cat => cat.slug === categorySlugFromParams);
            if (category) {
                setSelectedCategory(category.id);
            }
        }
    }, [categorySlugFromParams, categories]);

    const filteredProducts = useMemo(() => {
        return products.filter(prod => {
            const matchesSearch = searchQuery === '' ||
                prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                prod.slug.toLowerCase().includes(searchQuery.toLowerCase());

            const statusStr = String(prod.isActive);
            const matchesStatus = selectedStatus === '' || statusStr === selectedStatus;

            const matchesCategory = selectedCategory === '' || prod.categoryId === selectedCategory;

            return matchesSearch && matchesStatus && matchesCategory;
        });
    }, [products, searchQuery, selectedStatus, selectedCategory]);

    const categoryOptions = useMemo(() => {
        return categories.map(cat => ({ label: cat.name, value: cat.id }));
    }, [categories]);

    const tagOptions = useMemo(() => {
        return tags.filter(t => t.isActive).map(tag => ({ label: tag.name, value: tag.id }));
    }, [tags]);

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
                const res = await pick({
                    type: [types.images],
                });

                const file = res[0];
                setSelectedImage({
                    uri: file.uri,
                    name: file.name || 'image.jpg',
                    type: file.type || 'image/jpeg',
                });
            } catch (err) {
                if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
                    // Silent cancel
                } else {
                    console.error('Picker error:', err);
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
            categoryId: categories.length > 0 ? categories[0].id : '',
            name: '',
            slug: '',
            rank: '0',
            mrp: '0',
            sellingPrice: '0',
            isActive: true,
            quantity: '0',
            tags: [],
        });
        setSelectedImage(null);
        setModalError('');
        setIsModalOpen(true);
    };

    const handleStockPress = (product: Product) => {
        setStockData({
            id: product.id,
            name: product.name,
            quantity: String(product.quantity || 0)
        });
        setIsStockModalOpen(true);
    };

    const handleUpdateStock = async () => {
        if (!stockData.id) return;
        setIsUpdatingStock(true);
        try {
            const resultAction = await dispatch(updateProductStock({
                id: stockData.id,
                quantity: parseInt(stockData.quantity) || 0
            }));
            if (updateProductStock.fulfilled.match(resultAction)) {
                setIsStockModalOpen(false);
                toast.success('Stock updated successfully');
            }
        } catch (err) {
            toast.error('Failed to update stock');
        } finally {
            setIsUpdatingStock(false);
        }
    };

    const handleEditPress = (product: Product) => {
        setModalMode('edit');
        setEditingId(product.id);
        setFormData({
            categoryId: product.categoryId,
            name: product.name,
            slug: product.slug,
            rank: String(product.rank || 0),
            mrp: String(product.mrp || 0),
            sellingPrice: String(product.sellingPrice || 0),
            isActive: product.isActive,
            quantity: String(product.quantity || 0),
            tags: product.tags || [],
        });
        setSelectedImage(product.image ? { uri: getSafeImageUrl(product.image) } : null);
        setModalError('');
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.slug || !formData.categoryId) {
            setModalError('Name, Slug, and Category are required');
            return;
        }

        setSaving(true);
        try {
            const data = new FormData();
            data.append('categoryId', formData.categoryId);
            data.append('name', formData.name);
            data.append('slug', formData.slug);
            data.append('rank', formData.rank);
            data.append('mrp', formData.mrp);
            data.append('sellingPrice', formData.sellingPrice);
            data.append('isActive', String(formData.isActive));
            data.append('tags', JSON.stringify(formData.tags));
            if (modalMode === 'add') {
                data.append('quantity', formData.quantity);
            }

            if (selectedImage && selectedImage.uri && !selectedImage.uri.startsWith('http')) {
                if (Platform.OS === 'web' && selectedImage.file) {
                    data.append('productImage', selectedImage.file);
                } else {
                    data.append('productImage', {
                        uri: selectedImage.uri,
                        name: selectedImage.name,
                        type: selectedImage.type,
                    } as any);
                }
            }

            if (modalMode === 'add') {
                await dispatch(createProduct(data));
            } else if (editingId) {
                await dispatch(updateProduct({ id: editingId, formData: data }));
                toast.success('Product updated successfully');
            } else {
                toast.success('Product created successfully');
            }
        } catch (err) {
            setModalError('Failed to save product');
            toast.error('Failed to save product');
        } finally {
            setSaving(false);
        }
    };

    const handleDeletePress = (product: Product) => {
        setItemToDelete({ id: product.id, name: product.name });
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        setIsDeleting(true);
        try {
            const resultAction = await dispatch(deleteProduct(itemToDelete.id));
            if (deleteProduct.fulfilled.match(resultAction)) {
                setIsDeleteModalOpen(false);
                setItemToDelete(null);
                toast.success('Product deleted successfully');
            }
        } catch (err) {
            toast.error('Failed to delete product');
        } finally {
            setIsDeleting(false);
        }
    };

    const getExportColumns = (): ExportColumn[] => [
        { key: 'name', title: 'Name' },
        { key: 'slug', title: 'Slug' },
        { key: 'mrp', title: 'MRP' },
        { key: 'sellingPrice', title: 'Price' },
        { key: 'rank', title: 'Rank' },
        { key: 'isActive', title: 'Status', render: (item: any) => item.isActive ? 'Active' : 'Inactive' }
    ];

    const getTargetData = () => {
        const data = selectedProducts.length > 0
            ? products.filter(p => selectedProducts.includes(p.id))
            : filteredProducts;

        if (data.length === 0) {
            toast.warning('There are no records available to export.');
            return null;
        }
        return data;
    };

    const handleDownload = async (format: 'pdf' | 'excel' | 'print') => {
        const data = getTargetData();
        if (!data) return;

        const columns = getExportColumns();
        const executeAction = async () => {
            if (format === 'excel') {
                await exportToCSV(data, columns, 'products_list');
            } else {
                await printData('Product Management Report', data, columns, format as 'print' | 'pdf');
            }
        };

        if (Platform.OS === 'android') {
            permissionUtils.withPermission('download', executeAction);
        } else {
            executeAction();
        }
    };

    const handleImportCSV = () => {
        const executeImport = async () => {
            try {
                const res = await pick({
                    type: [types.csv],
                });

                const file = res[0];
                const fileName = file.name || 'Unknown';

                if (!fileName.toLowerCase().endsWith('.csv')) {
                    toast.error('Please select a valid CSV file.');
                    return;
                }

                const content = await readFileAsText(file.uri);
                const rows = parseCSV(content);
                const data = csvToObjects(rows);

                if (data.length === 0) {
                    toast.warning('No data found in the CSV file.');
                    return;
                }

                // Prepare preview data with validation
                const preparedData: PreviewRow[] = data.map(item => {
                    const name = getAliasedValue(item, ['name', 'productname', 'title']) || '';
                    const categoryName = getAliasedValue(item, ['category', 'categoryname', 'parentcategory']) || '';

                    const validation = validateRow({ ...item, name, category: categoryName }, ['name', 'category']);
                    const errors = [...validation.errors];
                    const warnings = [];

                    // Validate category
                    const category = findMatch(categories, categoryName);

                    if (categoryName && !category) {
                        errors.push(`Category "${categoryName}" not found`);
                    }

                    // Check for existing product (by name)
                    const existing = findMatch(products, name);
                    if (existing) {
                        warnings.push(`Product "${existing.name}" already exists`);
                    }

                    // Map values for preview columns
                    const displayItem = {
                        originalData: item,
                        name: name,
                        category: categoryName,
                        price: getAliasedValue(item, ['price', 'sellingprice', 'sale_price', 'mrp']) || 0,
                        stock: getAliasedValue(item, ['stock', 'quantity', 'qty', 'count']) || 0,
                        slug: getAliasedValue(item, ['slug', 'url', 'permalink']) || (name ? name.toLowerCase().replace(/\s+/g, '-') : ''),
                    };

                    return {
                        data: displayItem,
                        isValid: errors.length === 0,
                        errors: errors,
                        warnings: warnings
                    };
                });

                setImportPreviewData(preparedData);
                setIsPreviewModalOpen(true);
            } catch (err) {
                if (!(isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED)) {
                    console.error('Import error:', err);
                    toast.error('Failed to parse CSV file');
                }
            }
        };

        if (Platform.OS === 'android') {
            permissionUtils.withPermission('csv_import', executeImport);
        } else {
            executeImport();
        }
    };

    const confirmImport = async () => {
        setIsImporting(true);
        let successCount = 0;
        let failCount = 0;

        const validItems = importPreviewData.filter(d => d.isValid);

        for (const item of validItems) {
            try {
                const { data: rowData } = item;
                const formData = new FormData();

                // Find category ID from name (guaranteed to exist because of validation)
                const categoryName = rowData.categoryname || rowData.category || '';
                const category = findMatch(categories, categoryName);

                formData.append('categoryId', category?.id || '');
                formData.append('name', rowData.name || rowData.productname || '');
                formData.append('slug', rowData.slug || (rowData.name || rowData.productname || '').toLowerCase().replace(/\s+/g, '-'));
                formData.append('rank', String(rowData.rank || 0));
                formData.append('mrp', String(rowData.mrp || 0));
                formData.append('sellingPrice', String(rowData.sellingprice || rowData.price || 0));
                formData.append('isActive', String(rowData.isactive !== undefined ? rowData.isactive : true));
                formData.append('quantity', String(rowData.quantity || rowData.stock || 0));

                // Handle Tags
                const tagValues = rowData.tags ? String(rowData.tags).split(',').map(t => t.trim()) : [];
                const tagIds: string[] = [];

                tagValues.forEach(val => {
                    const foundTag = findMatch(tags, val);
                    if (foundTag) tagIds.push(foundTag.id);
                });

                formData.append('tags', JSON.stringify(tagIds));

                const resultAction = await dispatch(createProduct(formData));
                if (createProduct.fulfilled.match(resultAction)) {
                    successCount++;
                } else {
                    failCount++;
                }
            } catch (err) {
                failCount++;
            }
        }

        setIsImporting(false);
        setIsPreviewModalOpen(false);
        if (failCount > 0) {
            toast.warning(`Successfully imported ${successCount} products.\nFailed to import ${failCount} products.`);
        } else {
            toast.success(`Successfully imported ${successCount} products.`);
        }
        dispatch(fetchProducts());
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
                                {viewMode === 'list' ? 'Products' : 'Product Details'}
                            </Text>
                            {viewMode === 'list' && (
                                <View className="px-2.5 py-1 bg-gray-200 rounded-full">
                                    <Text className="text-gray-600 text-xs font-bold">
                                        {products.length} total
                                    </Text>
                                </View>
                            )}
                        </View>
                        <Text className="text-gray-500 text-sm">
                            {viewMode === 'list'
                                ? 'Manage system products'
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
                                    onPress={() => dispatch(fetchProducts())}
                                    className="p-2.5 bg-white rounded-lg border border-gray-200 shadow-sm"
                                >
                                    <RefreshCcw size={18} color="#64748b" />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={handleAddPress}
                                    className="py-2.5 px-5 bg-primary rounded-lg flex-row items-center gap-2 shadow-md"
                                >
                                    <Plus size={18} color="white" />
                                    <Text className="text-white font-bold">Add New</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                onPress={handleSave}
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
                        isWeb ? "flex-row items-center justify-between" : "flex-col"
                    )}>
                        <View className={clsx("flex-1", !isWeb && "w-full")}>
                            <View className="relative">
                                <View className="absolute left-4 top-0 bottom-0 justify-center z-10">
                                    <Search
                                        size={20}
                                        color={searchQuery ? COLORS.primary : "#9CA3AF"}
                                    />
                                </View>
                                <TextInput
                                    placeholder="Search products by name or slug..."
                                    className={clsx(
                                        "w-full bg-white border-2 rounded-xl text-gray-800",
                                        "focus:border-primary transition-all duration-200",
                                        "border-gray-300/80",
                                        Platform.OS === 'android' ? "pl-12 pr-10 py-4" : "pl-12 pr-10 py-3"
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
                        </View>

                        <View className={clsx(isWeb ? "w-[240px]" : "w-full")}>
                            <CustomDropDown
                                placeholder="Filter by category"
                                items={[
                                    { label: 'All Categories', value: '' },
                                    ...categoryOptions
                                ]}
                                selectedValue={selectedCategory}
                                onSelect={(value) => {
                                    setSelectedCategory(Array.isArray(value) ? value[0] : value);
                                }}
                                searchable={true}
                                showClear={true}
                                className="w-full"
                            />
                        </View>

                        <View className={clsx(isWeb ? "w-[180px]" : "w-full")}>
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

    const renderEmptyState = () => (
        <View className="items-center justify-center py-20 opacity-50">
            <Package size={64} color={COLORS.text.secondary} />
            <Text className="text-text-secondary font-medium mt-4">No products found</Text>
        </View>
    );

    const columns = useMemo<Column[]>(() => [
        {
            key: 'image',
            title: 'Image',
            width: 100,
            render: (item) => (
                <TouchableOpacity
                    onPress={() => {
                        if (item.image) {
                            setImagePreviewData({ uri: getSafeImageUrl(item.image) as string, name: item.name });
                            setIsPreviewOpen(true);
                        }
                    }}
                    className="w-10 h-10 bg-gray-100 rounded-md overflow-hidden active:opacity-70 shadow-sm"
                >
                    {item.image ? (
                        <Image
                            source={{ uri: getSafeImageUrl(item.image) as string }}
                            className="w-full h-full"
                            style={Platform.OS === 'web' ? { width: '100%', height: '100%' } : undefined}
                            resizeMode="cover"
                        />
                    ) : (
                        <View className="flex-1 items-center justify-center">
                            <Package size={20} color="#94A3B8" />
                        </View>
                    )}
                </TouchableOpacity>
            ),
        },
        {
            key: 'name',
            title: 'Product Name',
            width: isWeb ? 250 : 180,
            sortable: true,
            render: (item) => (
                <View>
                    <Text className="font-semibold text-gray-900">{item.name}</Text>
                    <Text className="text-gray-500 text-xs italic">{item.slug}</Text>
                </View>
            ),
        },
        {
            key: 'categoryName',
            title: 'Category',
            width: 150,
            render: (item) => {
                const category = categories.find(c => c.id === item.categoryId);
                return <Text className="text-gray-600 text-sm">{category?.name || 'N/A'}</Text>;
            },
        },
        {
            key: 'tags',
            title: 'Tags',
            width: 150,
            render: (item) => (
                <View className="flex-row flex-wrap gap-1">
                    {(item.tags || []).map((tagId: string) => {
                        const tag = tags.find(t => t.id === tagId);
                        if (!tag) return null;
                        return (
                            <View key={tagId} style={{ backgroundColor: tag.color || '#EEF2FF' }} className="px-2 py-0.5 rounded-md">
                                <Text className="text-[10px] font-bold text-white shadow-sm">{tag.name}</Text>
                            </View>
                        );
                    })}
                    {(item.tags || []).length === 0 && <Text className="text-gray-400 text-xs">-</Text>}
                </View>
            ),
        },
        {
            key: 'sellingPrice',
            title: 'Price',
            width: 100,
            sortable: true,
            render: (item) => (
                <View>
                    <Text className="text-gray-900 font-bold">₹{item.sellingPrice}</Text>
                    <Text className="text-gray-400 text-xs line-through">₹{item.mrp}</Text>
                </View>
            ),
        },
        {
            key: 'quantity',
            title: 'Stock',
            width: 100,
            sortable: true,
            render: (item) => (
                <TouchableOpacity
                    onPress={() => handleStockPress(item)}
                    className={clsx(
                        "px-3 py-1 rounded-lg flex-row items-center gap-2",
                        (item.quantity || 0) <= 5 ? "bg-orange-50" : "bg-gray-50"
                    )}
                >
                    <Database size={14} color={(item.quantity || 0) <= 5 ? "#F97316" : "#64748B"} />
                    <Text className={clsx(
                        "font-bold",
                        (item.quantity || 0) <= 5 ? "text-orange-600" : "text-gray-700"
                    )}>
                        {item.quantity || 0}
                    </Text>
                </TouchableOpacity>
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
                        onPress={() => handleStockPress(item)}
                        className="p-2 bg-orange-50 rounded-lg border border-orange-100"
                    >
                        <Layers size={16} color="#F97316" />
                    </TouchableOpacity>
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
    ], [isWeb, categories]);

    return (
        <View className="flex-1 bg-background-light">
            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

            <Header
                title="Product Management"
                icon={Package}
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
                {renderHeader()}
                {renderFilters()}

                <DataTable
                    data={filteredProducts}
                    columns={columns}
                    isLoading={isLoading}
                    keyExtractor={(item) => item.id}
                    pagination={true}
                    pageSize={10}
                    selectable={true}
                    selectedItems={selectedProducts}
                    onSelectAll={(selected) => setSelectedProducts(selected ? filteredProducts.map(p => p.id) : [])}
                    onSelectItem={(item, selected) => {
                        setSelectedProducts(prev => selected ? [...prev, item.id] : prev.filter(id => id !== item.id));
                    }}
                    containerStyle={{
                        borderRadius: 16,
                        borderWidth: 1,
                        maxWidth: '100%',
                        borderColor: '#E5E7EB',
                        backgroundColor: '#FFFFFF',
                    }}
                />

                {filteredProducts.length === 0 && !isLoading && renderEmptyState()}
            </ScrollView>

            {/* Stock Management Modal */}
            <CustomModal
                visible={isStockModalOpen}
                onClose={() => setIsStockModalOpen(false)}
                title="Manage Stock"
                icon={Database}
                width={isWeb ? 400 : '90%'}
            >
                <View className="p-4">
                    <Text className="text-gray-500 mb-4">Updating stock for <Text className="font-bold text-gray-800">{stockData.name}</Text></Text>

                    <View className="mb-6">
                        <Text className="text-sm font-semibold text-gray-700 mb-2">Available Quantity</Text>
                        <View className="flex-row items-center gap-3">
                            <TouchableOpacity
                                onPress={() => setStockData(prev => ({ ...prev, quantity: String(Math.max(0, parseInt(prev.quantity) - 1)) }))}
                                className="w-12 h-12 bg-gray-100 rounded-xl items-center justify-center border border-gray-200"
                            >
                                <Text className="text-2xl font-bold text-gray-600">-</Text>
                            </TouchableOpacity>

                            <TextInput
                                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-center text-xl font-bold text-gray-800"
                                keyboardType="numeric"
                                value={stockData.quantity}
                                onChangeText={(text) => setStockData(prev => ({ ...prev, quantity: text.replace(/[^0-9]/g, '') }))}
                            />

                            <TouchableOpacity
                                onPress={() => setStockData(prev => ({ ...prev, quantity: String(parseInt(prev.quantity) + 1) }))}
                                className="w-12 h-12 bg-primary/10 rounded-xl items-center justify-center border border-primary/20"
                            >
                                <Text className="text-2xl font-bold text-primary">+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={handleUpdateStock}
                        disabled={isUpdatingStock}
                        className="bg-primary py-4 rounded-xl flex-row items-center justify-center gap-2 shadow-md shadow-primary/30"
                    >
                        {isUpdatingStock ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <>
                                <Save size={18} color="white" />
                                <Text className="text-white font-bold text-lg">Update Stock</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </CustomModal>

            {/* Add/Edit Modal */}
            <CustomModal
                visible={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={modalMode === 'add' ? 'Add New Product' : 'Edit Product'}
                icon={Package}
                width={isWeb ? 550 : '95%'}
            >
                <ScrollView className="p-1" showsVerticalScrollIndicator={false}>
                    <View className="gap-5">
                        {/* Image Picker */}
                        <View className="items-center">
                            <TouchableOpacity
                                onPress={handlePickImage}
                                className="w-24 h-24 bg-gray-100 rounded-2xl items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden"
                            >
                                {selectedImage ? (
                                    <Image
                                        source={{ uri: selectedImage.uri }}
                                        className="w-full h-full"
                                        style={Platform.OS === 'web' ? { width: '100%', height: '100%' } : undefined}
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <View className="items-center">
                                        <Upload size={24} color="#94A3B8" />
                                        <Text className="text-[10px] text-gray-400 mt-1 uppercase font-bold">Upload</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                            <Text className="text-xs text-gray-500 mt-2">Product Image (Required)</Text>
                        </View>

                        <View style={Platform.OS === 'web' ? { zIndex: 60 } : undefined}>
                            <Text className="text-sm font-semibold text-gray-700 mb-2">Category *</Text>
                            <CustomDropDown
                                placeholder="Select Category"
                                items={categoryOptions}
                                selectedValue={formData.categoryId}
                                onSelect={(value) => setFormData({ ...formData, categoryId: Array.isArray(value) ? value[0] : value })}
                                className="w-full"
                            />
                        </View>

                        <View>
                            <Text className="text-sm font-semibold text-gray-700 mb-2">Product Name *</Text>
                            <TextInput
                                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                                placeholder="e.g. Standard Crackers"
                                value={formData.name}
                                onChangeText={(text) => {
                                    setFormData({ ...formData, name: text, slug: text.toLowerCase().replace(/\s+/g, '-') });
                                }}
                            />
                        </View>

                        <View style={Platform.OS === 'web' ? { zIndex: 50 } : undefined}>
                            <Text className="text-sm font-semibold text-gray-700 mb-2">Tags</Text>
                            <CustomDropDown
                                placeholder="Select Tags"
                                items={tagOptions}
                                selectedValue={formData.tags}
                                onSelect={(value) => setFormData({ ...formData, tags: Array.isArray(value) ? value : [value] })}
                                multiple={true}
                                className="w-full"
                            />
                        </View>

                        <View>
                            <Text className="text-sm font-semibold text-gray-700 mb-2">Slug *</Text>
                            <TextInput
                                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                                placeholder="standard-crackers"
                                value={formData.slug}
                                onChangeText={(text) => setFormData({ ...formData, slug: text })}
                            />
                        </View>

                        <View className="flex-row gap-4">
                            <View className="flex-1">
                                <Text className="text-sm font-semibold text-gray-700 mb-2">MRP (₹) *</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                                    placeholder="0.00"
                                    keyboardType="numeric"
                                    value={formData.mrp}
                                    onChangeText={(text) => setFormData({ ...formData, mrp: text })}
                                />
                            </View>
                            <View className="flex-1">
                                <Text className="text-sm font-semibold text-gray-700 mb-2">Selling Price (₹) *</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                                    placeholder="0.00"
                                    keyboardType="numeric"
                                    value={formData.sellingPrice}
                                    onChangeText={(text) => setFormData({ ...formData, sellingPrice: text })}
                                />
                            </View>
                        </View>

                        <View className="flex-row gap-4">
                            <View className="flex-1">
                                <Text className="text-sm font-semibold text-gray-700 mb-2">Rank</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                                    placeholder="0"
                                    keyboardType="numeric"
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
                                        ios_backgroundColor="#D1D5DB"
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

                        {modalMode === 'add' && (
                            <View>
                                <Text className="text-sm font-semibold text-gray-700 mb-2">Initial Stock Quantity</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                                    placeholder="0"
                                    keyboardType="numeric"
                                    value={formData.quantity}
                                    onChangeText={(text) => setFormData({ ...formData, quantity: text.replace(/[^0-9]/g, '') })}
                                />
                            </View>
                        )}
                    </View>
                </ScrollView>
            </CustomModal>

            <ImportPreviewModal
                visible={isPreviewModalOpen}
                onClose={() => setIsPreviewModalOpen(false)}
                onConfirm={confirmImport}
                title="Product Import Preview"
                loading={isImporting}
                data={importPreviewData}
                columns={[
                    { key: 'name', title: 'Name' },
                    { key: 'category', title: 'Category' },
                    { key: 'price', title: 'Price' },
                    { key: 'stock', title: 'Stock' },
                ]}
            />

            <ConfirmDelete
                visible={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Product"
                message={`Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be undone.`}
                loading={isDeleting}
            />

            <ImagePreviewModal
                visible={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                uri={imagePreviewData?.uri || ''}
                name={imagePreviewData?.name || ''}
            />
        </View>
    );
};

// Helper component for Image Preview (to keep main component cleaner)
const ImagePreviewModal = ({ visible, onClose, uri, name }: { visible: boolean; onClose: () => void; uri: string; name: string }) => {
    const { width } = useWindowDimensions();
    const isWeb = Platform.OS === "web" && width >= 980;

    return (
        <CustomModal
            visible={visible}
            onClose={onClose}
            title="Image Preview"
            subtitle={name}
            icon={ImageIcon}
            width={isWeb ? 500 : '95%'}
        >
            <View className="items-center justify-center p-2">
                {uri ? (
                    <View className="w-full aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                        <Image
                            source={{ uri }}
                            className="w-full h-full"
                            resizeMode="contain"
                            style={Platform.OS === 'web' ? { width: '100%', height: '100%' } : undefined}
                        />
                    </View>
                ) : null}
                <View className="mt-6 w-full">
                    <TouchableOpacity
                        onPress={onClose}
                        className="w-full bg-gray-100 py-4 rounded-xl items-center active:bg-gray-200"
                    >
                        <Text className="text-gray-700 font-bold text-base">Close Preview</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </CustomModal>
    );
};

export default ProductScreen;
