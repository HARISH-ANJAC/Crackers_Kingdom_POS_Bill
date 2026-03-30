// src/screens/CategoryScreen.tsx
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
import { Layers, Search, Plus, Edit2, Trash2, RefreshCcw, X, Save, Upload, Printer, FileUp, ChevronLeft, Image as ImageIcon, Eye } from 'lucide-react-native';
import { COLORS } from '../Constants/Colors';
import Header from '../components/Header';
import DataTable, { Column } from '../components/common/DataTable';
import { useAppDispatch, useAppSelector } from '../redux/Store';
import { fetchCategories, createCategory, updateCategory, deleteCategory, clearError, resetSuccess } from '../redux/Slice/CategorySlice';
import CustomModal from '../components/common/CustomModal';
import ConfirmDelete from '../components/common/ConfirmDelete';
import CustomDropDown from '../components/common/CustomDropDown';
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

const CategoryScreen = ({ navigation }: { navigation?: any }) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web" && width >= 980;

  const dispatch = useAppDispatch();
  const { categories, isLoading, error, success } = useAppSelector((state) => state.categories);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
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

  // Image Preview State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<{ uri: string; name: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    rank: '0',
    isActive: true,
  });
  const [selectedImage, setSelectedImage] = useState<any>(null);

  // Import Preview State
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [importPreviewData, setImportPreviewData] = useState<PreviewRow[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    dispatch(fetchCategories());
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

  const filteredCategories = useMemo(() => {
    return categories.filter(cat => {
      const matchesSearch = searchQuery === '' ||
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.slug.toLowerCase().includes(searchQuery.toLowerCase());

      const statusStr = String(cat.isActive);
      const matchesStatus = selectedStatus === '' || statusStr === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [categories, searchQuery, selectedStatus]);

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
              file: file, // Keep reference to file object for web upload
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
          toast.error('Failed to pick image. Please try again.');
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
      name: '',
      slug: '',
      description: '',
      rank: '0',
      isActive: true,
    });
    setSelectedImage(null);
    setModalError('');
    setIsModalOpen(true);
  };

  const handleEditPress = (category: any) => {
    setModalMode('edit');
    setEditingId(category.id);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      rank: String(category.rank || 0),
      isActive: category.isActive,
    });
    setSelectedImage(category.image ? { uri: getSafeImageUrl(category.image) } : null);
    setModalError('');
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.slug) {
      setModalError('Name and Slug are required');
      toast.warning('Please fill in all required fields.');
      return;
    }

    setSaving(true);
    const toastId = toast.loading(
      modalMode === 'add' ? 'Creating category...' : 'Saving changes...'
    );
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('slug', formData.slug);
      data.append('description', formData.description);
      data.append('rank', formData.rank);
      data.append('isActive', String(formData.isActive));

      if (selectedImage && selectedImage.uri && !selectedImage.uri.startsWith('http')) {
        if (Platform.OS === 'web' && selectedImage.file) {
          data.append('categoryImage', selectedImage.file);
        } else {
          data.append('categoryImage', {
            uri: selectedImage.uri,
            name: selectedImage.name,
            type: selectedImage.type,
          } as any);
        }
      }

      if (modalMode === 'add') {
        const result = await dispatch(createCategory(data));
        if (createCategory.fulfilled.match(result)) {
          toast.success(`Category "${formData.name}" created successfully!`, { id: toastId });
        } else {
          toast.error('Failed to create category. Please try again.', { id: toastId });
        }
      } else if (editingId) {
        const result = await dispatch(updateCategory({ id: editingId, formData: data }));
        if (updateCategory.fulfilled.match(result)) {
          toast.success(`Category "${formData.name}" updated successfully!`, { id: toastId });
        } else {
          toast.error('Failed to update category. Please try again.', { id: toastId });
        }
      }
    } catch (err) {
      setModalError('Failed to save category');
      toast.error('An unexpected error occurred.', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePress = (category: any) => {
    setItemToDelete({ id: category.id, name: category.name });
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    const toastId = toast.loading(`Deleting "${itemToDelete.name}"...`);
    try {
      const resultAction = await dispatch(deleteCategory(itemToDelete.id));
      if (deleteCategory.fulfilled.match(resultAction)) {
        setIsDeleteModalOpen(false);
        toast.success(`"${itemToDelete.name}" deleted successfully.`, { id: toastId });
        setItemToDelete(null);
      } else {
        toast.error('Failed to delete category. Please try again.', { id: toastId });
      }
    } catch (err) {
      toast.error('An unexpected error occurred while deleting.', { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  };

  const getExportColumns = (): ExportColumn[] => [
    { key: 'name', title: 'Name' },
    { key: 'slug', title: 'Slug' },
    { key: 'description', title: 'Description' },
    { key: 'rank', title: 'Rank' },
    { key: 'isActive', title: 'Status', render: (item: any) => item.isActive ? 'Active' : 'Inactive' }
  ];

  const getTargetData = () => {
    const data = selectedCategories.length > 0
      ? categories.filter(c => selectedCategories.includes(c.id))
      : filteredCategories;

    if (data.length === 0) {
      toast.warning('No records available to export.');
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
        await exportToCSV(data, columns, 'categories_list');
      } else {
        await printData('Category Management Report', data, columns, format as 'print' | 'pdf');
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
          toast.error('Invalid file type. Please select a valid CSV file.');
          return;
        }

        const content = await readFileAsText(file.uri);
        const rows = parseCSV(content);
        const data = csvToObjects(rows);

        if (data.length === 0) {
          toast.warning('No data found in the selected CSV file.');
          return;
        }

        // Prepare preview data with validation
        const preparedData: PreviewRow[] = data.map(item => {
          const name = getAliasedValue(item, ['name', 'categoryname', 'category']) || '';
          const validation = validateRow({ ...item, name }, ['name']);
          const warnings = [];

          // Check for existing category
          const existing = findMatch(categories, name);
          if (existing) {
            warnings.push(`Category "${existing.name}" already exists and will be updated`);
          }

          // Map values for preview columns
          const displayItem = {
            ...item,
            name: name,
            slug: getAliasedValue(item, ['slug', 'url', 'permalink']) || (name ? name.toLowerCase().replace(/\s+/g, '-') : ''),
            rank: getAliasedValue(item, ['rank', 'displayorder', 'order', 'sorting']) || 0,
            isActive: getAliasedValue(item, ['isactive', 'status', 'active', 'enabled']) !== false,
          };

          return {
            data: displayItem,
            isValid: validation.isValid,
            errors: validation.errors,
            warnings: warnings
          };
        });

        setImportPreviewData(preparedData);
        setIsPreviewModalOpen(true);
      } catch (err) {
        if (!(isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED)) {
          console.error('Import error:', err);
          toast.error('Failed to parse the CSV file. Please check the format and try again.');
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
        formData.append('name', rowData.name);
        formData.append('slug', rowData.slug);
        formData.append('description', getAliasedValue(rowData, ['description', 'desc', 'summary']) || '');
        formData.append('rank', String(rowData.rank));
        formData.append('isActive', String(rowData.isActive));

        const resultAction = await dispatch(createCategory(formData));
        if (createCategory.fulfilled.match(resultAction)) {
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
    if (failCount === 0) {
      toast.success(`Import complete! ${successCount} ${successCount === 1 ? 'category' : 'categories'} imported.`);
    } else if (successCount > 0) {
      toast.warning(`Imported ${successCount} categories. ${failCount} failed.`);
    } else {
      toast.error(`Import failed. Could not import any categories.`);
    }
    dispatch(fetchCategories());
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
                {viewMode === 'list' ? 'Categories' : 'Category Details'}
              </Text>
              {viewMode === 'list' && (
                <View className="px-2.5 py-1 bg-gray-200 rounded-full">
                  <Text className="text-gray-600 text-xs font-bold">
                    {categories.length} total
                  </Text>
                </View>
              )}
            </View>
            <Text className="text-gray-500 text-sm">
              {viewMode === 'list'
                ? 'Manage system categories'
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
                  onPress={() => dispatch(fetchCategories())}
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
                  placeholder="Search categories by name or slug..."
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
      <Layers size={64} color={COLORS.text.secondary} />
      <Text className="text-text-secondary font-medium mt-4">No categories found</Text>
    </View>
  );

  const columns = useMemo<Column[]>(() => [
    {
      key: 'image',
      title: 'Image',
      width: 80,
      render: (item) => (
        <TouchableOpacity
          onPress={() => {
            if (item.image) {
              setPreviewData({ uri: getSafeImageUrl(item.image) as string, name: item.name });
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
              <Layers size={20} color="#94A3B8" />
            </View>
          )}
        </TouchableOpacity>
      ),
    },
    {
      key: 'name',
      title: 'Category Name',
      width: isWeb ? 300 : 200,
      sortable: true,
      render: (item) => (
        <View>
          <Text className="font-semibold text-gray-900">{item.name}</Text>
          <Text className="text-gray-500 text-xs italic">{item.slug}</Text>
        </View>
      ),
    },
    {
      key: 'rank',
      title: 'Rank',
      width: 80,
      sortable: true,
      align: 'center',
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
            onPress={() => navigation.navigate('products', { categorySlug: item.slug })}
            className="p-2 bg-green-50 rounded-lg border border-green-100"
          >
            <Eye size={16} color="#10B981" />
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
  ], [isWeb]);

  return (
    <View className="flex-1 bg-background-light">
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <Header
        title="Category Management"
        icon={Layers}
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
          data={filteredCategories}
          columns={columns}
          isLoading={isLoading}
          keyExtractor={(item) => item.id}
          pagination={true}
          pageSize={10}
          selectable={true}
          selectedItems={selectedCategories}
          onSelectAll={(selected) => setSelectedCategories(selected ? filteredCategories.map(c => c.id) : [])}
          onSelectItem={(item, selected) => {
            setSelectedCategories(prev => selected ? [...prev, item.id] : prev.filter(id => id !== item.id));
          }}
          containerStyle={{
            borderRadius: 16,
            borderWidth: 1,
            borderColor: '#E5E7EB',
            backgroundColor: '#FFFFFF',
          }}
        />

        {filteredCategories.length === 0 && !isLoading && renderEmptyState()}
      </ScrollView>

      {/* Add/Edit Modal */}
      <CustomModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'add' ? 'Add New Category' : 'Edit Category'}
        icon={Layers}
        width={isWeb ? 500 : '95%'}
      >
        <View className="gap-5 p-1">
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
            <Text className="text-xs text-gray-500 mt-2">Category Image (Required)</Text>
          </View>

          <View>
            <Text className="text-sm font-semibold text-gray-700 mb-2">Category Name *</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
              placeholder="e.g. Gift Boxes"
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
              placeholder="gift-boxes"
              value={formData.slug}
              onChangeText={(text) => setFormData({ ...formData, slug: text })}
            />
          </View>

          <View>
            <Text className="text-sm font-semibold text-gray-700 mb-2">Description</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 min-h-[80px] text-gray-800"
              placeholder="Enter category description..."
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
            />
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
              <View
                className="flex-row items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-2"
              >
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

      <ImportPreviewModal
        visible={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        onConfirm={confirmImport}
        title="Category Import Preview"
        loading={isImporting}
        data={importPreviewData}
        columns={[
          { key: 'name', title: 'Name' },
          { key: 'slug', title: 'Slug' },
          { key: 'rank', title: 'Rank' },
        ]}
      />

      <ConfirmDelete
        visible={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be undone.`}
        loading={isDeleting}
      />

      {/* Image Preview Modal */}
      <CustomModal
        visible={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Image Preview"
        subtitle={previewData?.name}
        icon={ImageIcon}
        width={isWeb ? 500 : '95%'}
      >
        <View className="items-center justify-center p-2">
          {previewData?.uri ? (
            <View className="w-full aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
              <Image
                source={{ uri: previewData.uri }}
                className="w-full h-full"
                resizeMode="contain"
                style={Platform.OS === 'web' ? { width: '100%', height: '100%' } : undefined}
              />
            </View>
          ) : null}
          <View className="mt-6 w-full">
            <TouchableOpacity
              onPress={() => setIsPreviewOpen(false)}
              className="w-full bg-gray-100 py-4 rounded-xl items-center active:bg-gray-200"
            >
              <Text className="text-gray-700 font-bold text-base">Close Preview</Text>
            </TouchableOpacity>
          </View>
        </View>
      </CustomModal>
    </View>
  );
};

export default CategoryScreen;
