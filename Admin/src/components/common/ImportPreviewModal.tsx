import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { FileDown, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react-native';
import CustomModal from './CustomModal';
import { COLORS } from '../../Constants/Colors';
import clsx from 'clsx';

export interface PreviewRow {
    data: any;
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

interface ImportPreviewModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    data: PreviewRow[];
    columns: { key: string; title: string }[];
    loading?: boolean;
}

const ImportPreviewModal: React.FC<ImportPreviewModalProps> = ({
    visible,
    onClose,
    onConfirm,
    title,
    data,
    columns,
    loading = false,
}) => {
    const validCount = data.filter(d => d.isValid).length;
    const errorCount = data.length - validCount;

    const renderFooter = () => (
        <View className="flex-row gap-3">
            <TouchableOpacity
                onPress={onClose}
                className="flex-1 bg-white border border-gray-200 py-3.5 rounded-xl items-center"
            >
                <Text className="text-gray-700 font-bold">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={onConfirm}
                disabled={validCount === 0 || loading}
                className={clsx(
                    "flex-1 py-3.5 rounded-xl items-center flex-row justify-center gap-2",
                    validCount === 0 || loading ? "bg-gray-300" : "bg-primary"
                )}
            >
                {loading ? (
                    <ActivityIndicator size="small" color="white" />
                ) : (
                    <>
                        <CheckCircle size={18} color="white" />
                        <Text className="text-white font-bold">
                            Import {validCount} Items
                        </Text>
                    </>
                )}
            </TouchableOpacity>
        </View>
    );

    return (
        <CustomModal
            visible={visible}
            onClose={onClose}
            title={title}
            subtitle={`Previewing ${data.length} records from file`}
            icon={FileDown}
            footer={renderFooter()}
            maxWidth={900}
        >
            <View className="gap-4">
                {/* Summary Banner */}
                <View className="flex-row items-center justify-between bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <View className="flex-row items-center gap-3">
                        <Info size={20} color="#2563EB" />
                        <View>
                            <Text className="text-blue-900 font-bold">Import Summary</Text>
                            <Text className="text-blue-700 text-xs">
                                {validCount} ready to import, {errorCount} issues found
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Table Header */}
                <View className="bg-gray-100 rounded-t-xl flex-row border-b border-gray-200">
                    <View className="w-12 p-3 items-center justify-center">
                        <Text className="text-[10px] font-bold text-gray-400 uppercase">Status</Text>
                    </View>
                    {columns.map(col => (
                        <View key={col.key} className="flex-1 p-3">
                            <Text className="text-[10px] font-bold text-gray-400 uppercase">{col.title}</Text>
                        </View>
                    ))}
                </View>

                {/* Table Body */}
                <ScrollView
                    style={{ maxHeight: 400 }}
                    showsVerticalScrollIndicator={true}
                    nestedScrollEnabled={true}
                >
                    {data.map((row, idx) => (
                        <View
                            key={idx}
                            className={clsx(
                                "flex-row border-b border-gray-100",
                                !row.isValid ? "bg-red-50/30" : row.warnings.length > 0 ? "bg-amber-50/30" : ""
                            )}
                        >
                            <View className="w-12 p-3 items-center">
                                {!row.isValid ? (
                                    <XCircle size={18} color="#DC2626" />
                                ) : row.warnings.length > 0 ? (
                                    <AlertTriangle size={18} color="#D97706" />
                                ) : (
                                    <CheckCircle size={18} color="#16A34A" />
                                )}
                            </View>

                            {columns.map(col => (
                                <View key={col.key} className="flex-1 p-3 justify-center">
                                    <Text
                                        numberOfLines={1}
                                        className={clsx(
                                            "text-xs",
                                            !row.isValid ? "text-red-900" : "text-gray-700"
                                        )}
                                    >
                                        {String(row.data[col.key] || '-')}
                                    </Text>

                                    {/* Show errors under the relevant column if possible, or just first col */}
                                    {idx === 0 && !row.isValid && idx === 0 && (
                                        <Text className="text-[9px] text-red-500 mt-0.5">{row.errors[0]}</Text>
                                    )}
                                </View>
                            ))}
                        </View>
                    ))}
                </ScrollView>

                {/* Error/Warning Legend */}
                {errorCount > 0 && (
                    <View className="mt-2 p-3 bg-red-50 rounded-lg border border-red-100">
                        <View className="flex-row items-center gap-2 mb-1">
                            <XCircle size={14} color="#DC2626" />
                            <Text className="text-red-800 text-xs font-bold">Errors found:</Text>
                        </View>
                        {Array.from(new Set(data.flatMap(d => d.errors))).slice(0, 3).map((err, i) => (
                            <Text key={i} className="text-red-600 text-[10px] ml-6">• {err}</Text>
                        ))}
                    </View>
                )}
            </View>
        </CustomModal>
    );
};

export default ImportPreviewModal;
