import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Trash2, AlertTriangle } from 'lucide-react-native';
import CustomModal from './CustomModal';
import { COLORS } from '../../Constants/Colors';

interface ConfirmDeleteProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    loading?: boolean;
    itemName?: string;
}

const ConfirmDelete: React.FC<ConfirmDeleteProps> = ({
    visible,
    onClose,
    onConfirm,
    title = "Confirm Delete",
    message = "Are you sure you want to delete this item? This action cannot be undone.",
    loading = false,
    itemName,
}) => {
    return (
        <CustomModal
            visible={visible}
            onClose={onClose}
            title={title}
            icon={Trash2}
            width={400}
        >
            <View className="items-center py-4">
                <View className="w-16 h-16 bg-red-50 rounded-full items-center justify-center mb-4">
                    <AlertTriangle size={32} color={'#DC2626'} />
                </View>

                <Text className="text-gray-800 text-center text-lg font-bold mb-2">
                    Delete {itemName ? `"${itemName}"` : "Item"}?
                </Text>

                <Text className="text-gray-500 text-center text-base leading-6 px-4">
                    {message}
                </Text>

                <View className="flex-row w-full gap-3 mt-8">
                    <TouchableOpacity
                        onPress={onClose}
                        disabled={loading}
                        className="flex-1 bg-white border border-gray-200 py-3.5 rounded-xl items-center"
                    >
                        <Text className="text-gray-700 font-bold">Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={onConfirm}
                        disabled={loading}
                        className="flex-1 bg-red-600 py-3.5 rounded-xl items-center justify-center flex-row gap-2 shadow-sm shadow-red-200"
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <>
                                <Trash2 size={18} color="white" />
                                <Text className="text-white font-bold">Delete</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </CustomModal>
    );
};

export default ConfirmDelete;
