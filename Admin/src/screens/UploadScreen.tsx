import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { toast } from '../components/common/Toast';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UploadCloud, RefreshCcw, Trash2, Edit2, Link2, Camera, Video } from 'lucide-react-native';
import Header from '../components/Header';
import DataTable, { Column } from '../components/common/DataTable';
import CustomDropDown from '../components/common/CustomDropDown';
import CustomModal from '../components/common/CustomModal';
import ConfirmDelete from '../components/common/ConfirmDelete';
import { pick, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import api from '../services/api';
import clsx from 'clsx';
import { COLORS } from '../Constants/Colors';
import { permissionUtils } from '../utils/permissionUtils';

type AssetType = 'categoryImage' | 'productImage' | 'videoFile';

type LinkedRecord = {
  table: string;
  id: string;
  title: string;
  meta?: string;
};

type UploadAssetItem = {
  fileName: string;
  assetType: AssetType;
  relativePath: string;
  size: number;
  updatedAt: string;
  linkedCount: number;
  linkedRecords: LinkedRecord[];
};

type SelectedUploadFile = {
  uri: string;
  name: string;
  type: string;
  webFile?: Blob;
};

const API_ROOT = (api.defaults.baseURL || '').replace(/\/api\/?$/, '');

const getAssetUrl = (relativePath: string) => {
  if (!relativePath) return '';
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) return relativePath;
  if (relativePath.startsWith('/')) return `${API_ROOT}${relativePath}`;
  return `${API_ROOT}/${relativePath}`;
};

const formatBytes = (bytes: number) => {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, index);
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[index]}`;
};

const UploadScreen = ({ navigation }: { navigation?: any }) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web' && width >= 768;

  const [assets, setAssets] = useState<UploadAssetItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<AssetType>('categoryImage');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingAsset, setEditingAsset] = useState<UploadAssetItem | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<SelectedUploadFile[]>([]);
  const [saving, setSaving] = useState(false);

  const [selectedAssets, setSelectedAssets] = useState<UploadAssetItem[]>([]);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [assetsToDelete, setAssetsToDelete] = useState<UploadAssetItem[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAssets = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/uploads', {
        params: { assetType: selectedType },
      });
      if (response.data?.success) {
        setAssets(response.data.data || []);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.msg || 'Failed to fetch assets');
    } finally {
      setIsLoading(false);
    }
  }, [selectedType]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const pickAssetFile = useCallback(
    (assetType: AssetType) => {
      const executePick = async () => {
        try {
          const pickerTypes =
            assetType === 'videoFile'
              ? [((types as any).video as string) || types.allFiles]
              : [types.images];

          const res = await pick({
            type: pickerTypes,
            allowMultiSelection: modalMode === 'add',
          });

          const mappedFiles = res.map((file: any, index: number) => {
            const fallbackName = `${assetType}-${Date.now()}-${index + 1}`;
            const webFile = Platform.OS === 'web' ? (file.file as Blob | undefined) : undefined;
            return {
              uri: file.fileCopyUri || file.uri,
              name: file.name || fallbackName,
              type: file.type || (assetType === 'videoFile' ? 'video/mp4' : 'image/jpeg'),
              webFile,
            };
          });

          setSelectedFiles(modalMode === 'add' ? mappedFiles : mappedFiles.slice(0, 1));
        } catch (err) {
          if (!(isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED)) {
            toast.error('Failed to pick file');
          }
        }
      };

      if (Platform.OS === 'android') {
        permissionUtils.withPermission('upload', executePick);
      } else {
        executePick();
      }
    },
    [modalMode],
  );

  const handleOpenAdd = useCallback(() => {
    setModalMode('add');
    setEditingAsset(null);
    setSelectedFiles([]);
    setIsModalOpen(true);
  }, []);

  const handleOpenEdit = useCallback((asset: UploadAssetItem) => {
    setModalMode('edit');
    setEditingAsset(asset);
    setSelectedFiles([]);
    setIsModalOpen(true);
  }, []);

  const handleSaveAsset = useCallback(async () => {
    if (selectedFiles.length === 0) {
      toast.warning('Please choose at least one file');
      return;
    }

    setSaving(true);
    try {
      const payload = new FormData();
      const appendFileToPayload = async (file: SelectedUploadFile) => {
        if (Platform.OS === 'web') {
          if (file.webFile) {
            payload.append(selectedType, file.webFile as any, file.name);
            return;
          }
          if (file.uri) {
            const blob = await fetch(file.uri).then((r) => r.blob());
            payload.append(selectedType, blob as any, file.name);
            return;
          }
        }
        payload.append(selectedType, {
          uri: file.uri,
          name: file.name,
          type: file.type,
        } as any);
      };
      if (modalMode === 'add') {
        for (const file of selectedFiles) {
          await appendFileToPayload(file);
        }
      } else {
        await appendFileToPayload(selectedFiles[0]);
      }

      if (modalMode === 'add') {
        const response = await api.post(`/uploads/${selectedType}`, payload);
        if (response.data?.success) {
          toast.success(`${selectedFiles.length} asset${selectedFiles.length > 1 ? 's' : ''} uploaded successfully`);
          setIsModalOpen(false);
          fetchAssets();
        }
      } else if (editingAsset) {
        const response = await api.put(`/uploads/${selectedType}/${encodeURIComponent(editingAsset.fileName)}`, payload);
        if (response.data?.success) {
          toast.success('Asset updated successfully');
          setIsModalOpen(false);
          fetchAssets();
        }
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.msg || 'Failed to save asset');
    } finally {
      setSaving(false);
    }
  }, [selectedType, selectedFiles, modalMode, editingAsset, fetchAssets]);

  const handleDeleteAsset = useCallback((asset: UploadAssetItem) => {
    setAssetsToDelete([asset]);
    setIsDeleteModalOpen(true);
  }, []);

  const confirmDeleteAsset = useCallback(async () => {
    if (assetsToDelete.length === 0) return;
    setIsDeleting(true);
    try {
      for (const asset of assetsToDelete) {
        const response = await api.delete(
          `/uploads/${asset.assetType}/${encodeURIComponent(asset.fileName)}`,
        );
        if (!response.data?.success) {
          throw new Error(response.data?.msg || 'Failed to delete asset');
        }
      }
      setIsDeleteModalOpen(false);
      setAssetsToDelete([]);
      setSelectedAssets([]);
      toast.success(`${assetsToDelete.length} asset${assetsToDelete.length > 1 ? 's' : ''} deleted successfully`);
      fetchAssets();
    } catch (error: any) {
      const linked = error?.response?.data?.data?.linkedRecords;
      if (linked?.length) {
        const info = linked
          .slice(0, 3)
          .map((r: any) => `${r.table}: ${r.title}`)
          .join('\n');
        Alert.alert('Linked Records', `Cannot delete this asset.\n\n${info}`);
      } else {
        toast.error(error?.response?.data?.msg || 'Failed to delete asset');
      }
    } finally {
      setIsDeleting(false);
    }
  }, [assetsToDelete, fetchAssets]);

  const columns = useMemo<Column[]>(
    () => [
      {
        key: 'preview',
        title: 'Preview',
        width: isWeb ? 120 : 100,
        render: (item) => {
          const assetUrl = getAssetUrl(item.relativePath);
          if (item.assetType === 'videoFile') {
            return (
              <View className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-100 items-center justify-center">
                <Video size={18} color="#2563EB" />
              </View>
            );
          }

          return assetUrl ? (
            <Image source={{ uri: assetUrl }} style={{ width: 48, height: 48, borderRadius: 8 }} />
          ) : (
            <View className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 items-center justify-center">
              <Camera size={16} color="#9CA3AF" />
            </View>
          );
        },
      },
      {
        key: 'fileName',
        title: 'File',
        width: isWeb ? 280 : 220,
        sortable: true,
        render: (item) => (
          <View>
            <Text className="font-semibold text-gray-900" numberOfLines={1}>
              {item.fileName}
            </Text>
            <Text className="text-xs text-gray-500">{formatBytes(item.size)}</Text>
          </View>
        ),
      },
      {
        key: 'assetType',
        title: 'Type',
        width: isWeb ? 170 : 150,
        sortable: true,
        render: (item) => (
          <Text className="text-gray-700">
            {item.assetType === 'categoryImage'
              ? 'Category Image'
              : item.assetType === 'productImage'
                ? 'Product Image'
                : 'Video File'}
          </Text>
        ),
      },
      {
        key: 'linkedCount',
        title: 'Linked',
        width: isWeb ? 260 : 220,
        render: (item) => (
          <View>
            <Text className={clsx('font-semibold', item.linkedCount > 0 ? 'text-green-700' : 'text-gray-500')}>
              {item.linkedCount} record{item.linkedCount === 1 ? '' : 's'}
            </Text>
            {item.linkedRecords?.length > 0 ? (
              <Text className="text-xs text-gray-500" numberOfLines={1}>
                {item.linkedRecords
                  .slice(0, 2)
                  .map((r: LinkedRecord) => `${r.table}: ${r.title}`)
                  .join(', ')}
              </Text>
            ) : null}
          </View>
        ),
      },
      {
        key: 'updatedAt',
        title: 'Updated',
        width: isWeb ? 170 : 150,
        sortable: true,
        render: (item) => <Text className="text-gray-600">{new Date(item.updatedAt).toLocaleString()}</Text>,
      },
      {
        key: 'action',
        title: 'Actions',
        width: isWeb ? 140 : 130,
        align: 'center' as const,
        render: (item) => (
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={() => handleOpenEdit(item)}
              className="p-2 bg-blue-50 rounded-lg border border-blue-100"
            >
              <Edit2 size={16} color="#2563EB" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDeleteAsset(item)}
              className="p-2 bg-red-50 rounded-lg border border-red-100"
            >
              <Trash2 size={16} color="#DC2626" />
            </TouchableOpacity>
          </View>
        ),
      },
    ],
    [handleDeleteAsset, handleOpenEdit, isWeb],
  );

  return (
    <View className="flex-1 bg-background-light">
      <Header title="Upload Assets" icon={UploadCloud} navigation={navigation} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: insets.bottom + 20,
          paddingHorizontal: isWeb ? 32 : 16,
          paddingTop: isWeb ? 32 : 16,
        }}
      >
        <View className="mb-6 flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-gray-800">Uploads</Text>
            <Text className="text-gray-500 text-sm">Manage category, product and video files</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={fetchAssets}
              className="p-2.5 bg-white rounded-lg border border-gray-200 shadow-sm"
            >
              <RefreshCcw size={18} color="#64748b" />
            </TouchableOpacity>
            {selectedAssets.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setAssetsToDelete(selectedAssets);
                  setIsDeleteModalOpen(true);
                }}
                className="py-2.5 px-5 bg-red-500 rounded-lg flex-row items-center gap-2 shadow-md"
              >
                <Trash2 size={18} color="white" />
                <Text className="text-white font-bold">Delete Selected ({selectedAssets.length})</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={handleOpenAdd}
              className="py-2.5 px-5 bg-primary rounded-lg flex-row items-center gap-2 shadow-md"
            >
              <UploadCloud size={18} color="white" />
              <Text className="text-white font-bold">Upload</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="bg-white rounded-xl border border-gray-200 mb-6 p-4">
          <View className={clsx('gap-4', isWeb ? 'flex-row items-center justify-between' : 'flex-col')}>
            <View className={clsx(isWeb ? 'w-[260px]' : 'w-full')}>
              <CustomDropDown
                placeholder="Select asset type"
                items={[
                  { label: 'Category Image', value: 'categoryImage' },
                  { label: 'Product Image', value: 'productImage' },
                  { label: 'Video File', value: 'videoFile' },
                ]}
                selectedValue={selectedType}
                onSelect={(value) => setSelectedType((Array.isArray(value) ? value[0] : value) as AssetType)}
                searchable={false}
                showClear={false}
              />
            </View>
            <View className="flex-row items-center gap-2">
              <Link2 size={16} color={COLORS.primary} />
              <Text className="text-gray-600 text-sm">
                Linked records are shown for each file and block deletion.
              </Text>
            </View>
          </View>
        </View>

        <DataTable
          data={assets}
          columns={columns}
          keyExtractor={(item) => `${item.assetType}-${item.fileName}`}
          isLoading={isLoading}
          pagination={true}
          pageSize={10}
          selectable={true}
          selectedItems={selectedAssets.map(item => `${item.assetType}-${item.fileName}`)}
          onSelectItem={(item, selected) => {
            const key = `${item.assetType}-${item.fileName}`;
            if (selected) {
              setSelectedAssets(prev => [...prev, item]);
            } else {
              setSelectedAssets(prev => prev.filter(i => `${i.assetType}-${i.fileName}` !== key));
            }
          }}
          onSelectAll={(selected) => {
            if (selected) {
              setSelectedAssets(assets);
            } else {
              setSelectedAssets([]);
            }
          }}
          sortable={false}
          emptyMessage="No assets found"
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
        title={modalMode === 'add' ? 'Upload Asset' : 'Update Asset'}
        subtitle={modalMode === 'add' ? 'Upload one or more files' : 'Replace selected file'}
        icon={UploadCloud}
        width={isWeb ? 560 : '95%'}
      >
        <View className="gap-5 p-1">
          <View>
            <Text className="text-sm font-semibold text-gray-700 mb-2">Asset Type</Text>
            <CustomDropDown
              placeholder="Select asset type"
              items={[
                { label: 'Category Image', value: 'categoryImage' },
                { label: 'Product Image', value: 'productImage' },
                { label: 'Video File', value: 'videoFile' },
              ]}
              selectedValue={selectedType}
              onSelect={(value) => setSelectedType((Array.isArray(value) ? value[0] : value) as AssetType)}
              searchable={false}
              showClear={false}
            />
          </View>

          {modalMode === 'edit' && editingAsset ? (
            <View className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <Text className="text-xs text-gray-500">Current File</Text>
              <Text className="text-sm text-gray-800 font-semibold">{editingAsset.fileName}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            onPress={() => pickAssetFile(selectedType)}
            className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-5 items-center justify-center"
          >
            <UploadCloud size={24} color="#4B5563" />
            <Text className="text-gray-700 mt-2 font-semibold">{modalMode === 'add' ? 'Choose Files' : 'Choose File'}</Text>
            <Text className="text-gray-500 text-xs mt-1">
              {selectedType === 'videoFile'
                ? modalMode === 'add'
                  ? 'Select one or more video files'
                  : 'Select a video file'
                : modalMode === 'add'
                  ? 'Select one or more image files'
                  : 'Select an image file'}
            </Text>
          </TouchableOpacity>

          {modalMode === 'edit' && editingAsset && selectedType !== 'videoFile' && selectedFiles.length === 0 ? (
            <View className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <Text className="text-xs text-gray-500 mb-2">Current Image Preview</Text>
              <Image
                source={{ uri: getAssetUrl(editingAsset.relativePath) }}
                style={{ width: 110, height: 110, borderRadius: 10 }}
              />
            </View>
          ) : null}

          {selectedFiles.length > 0 ? (
            <View className="bg-blue-50 border border-blue-100 rounded-lg p-3">
              <Text className="text-xs text-blue-600">
                Selected File{selectedFiles.length > 1 ? 's' : ''} ({selectedFiles.length})
              </Text>
              <View className="mt-2 gap-2">
                {selectedFiles.slice(0, 6).map((file, index) => (
                  <View key={`${file.name}-${index}`} className="flex-row items-center gap-3">
                    {selectedType === 'videoFile' ? (
                      <View className="w-12 h-12 rounded-lg bg-blue-100 border border-blue-200 items-center justify-center">
                        <Video size={18} color="#2563EB" />
                      </View>
                    ) : (
                      <Image source={{ uri: file.uri }} style={{ width: 48, height: 48, borderRadius: 8 }} />
                    )}
                    <Text className="text-sm text-blue-800 font-semibold flex-1" numberOfLines={1}>
                      {file.name}
                    </Text>
                  </View>
                ))}
                {selectedFiles.length > 6 ? (
                  <Text className="text-xs text-blue-700 font-medium">+ {selectedFiles.length - 6} more</Text>
                ) : null}
              </View>
            </View>
          ) : null}

          <View className="flex-row gap-3 pt-4">
            <TouchableOpacity
              onPress={() => setIsModalOpen(false)}
              disabled={saving}
              className="flex-1 bg-white border border-gray-200 py-3.5 rounded-xl items-center"
            >
              <Text className="text-gray-700 font-bold">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSaveAsset}
              disabled={saving}
              className="flex-1 bg-primary py-3.5 rounded-xl items-center justify-center flex-row gap-2"
            >
              {saving ? <ActivityIndicator size="small" color="white" /> : <UploadCloud size={18} color="white" />}
              <Text className="text-white font-bold">{modalMode === 'add' ? 'Upload' : 'Update'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </CustomModal>

      <ConfirmDelete
        visible={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteAsset}
        itemName={assetsToDelete.length === 1 ? assetsToDelete[0].fileName : `${assetsToDelete.length} assets`}
        loading={isDeleting}
        message="Delete this asset? Deletion is blocked if linked to category/product/video records."
      />
    </View>
  );
};

export default React.memo(UploadScreen);
