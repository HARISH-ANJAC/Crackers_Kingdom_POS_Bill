import React, { ReactNode } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    useWindowDimensions,
} from 'react-native';
import { X } from 'lucide-react-native';
import { clsx } from 'clsx';
import { COLORS } from '../../Constants/Colors';

interface CustomModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    icon?: any; // Icon component component
    children: ReactNode;
    width?: number | string;
    maxWidth?: number;
    footer?: ReactNode;
}

const CustomModal: React.FC<CustomModalProps> = ({
    visible,
    onClose,
    title,
    subtitle,
    icon: Icon,
    children,
    width: propWidth,
    maxWidth: propMaxWidth = 600,
    footer,
}) => {
    const { width, height } = useWindowDimensions();
    const isWeb = Platform.OS === 'web';
    const isMobile = width < 768;

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
            statusBarTranslucent={true}
        >
            {/* Backdrop */}
            <TouchableOpacity
                activeOpacity={1}
                onPress={onClose}
                className="absolute inset-0 bg-black/60"
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1 justify-center items-center"
            >
                {/* Modal Container */}
                <View
                    style={{
                        width: isMobile ? '94%' : (propWidth || '100%'),
                        maxWidth: isMobile ? undefined : propMaxWidth,
                    } as any}
                    className={clsx(
                        "bg-white rounded-2xl shadow-2xl overflow-hidden",
                        isMobile && "max-w-sm"
                    )}
                >
                    {/* Header - Matching CategoryModal Design */}
                    <View className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-gray-100">
                        <View className="flex-row items-center justify-between p-5 md:p-6">
                            <View className="flex-row items-center gap-3">
                                {Icon && (
                                    <View className="w-10 h-10 rounded-lg bg-primary/10 items-center justify-center">
                                        <Icon size={20} color={COLORS.primary} />
                                    </View>
                                )}
                                <View>
                                    <Text className="text-xl font-bold text-gray-800 tracking-tight leading-tight">
                                        {title}
                                    </Text>
                                    {subtitle && (
                                        <Text className="text-gray-500 text-xs md:text-sm mt-0.5">
                                            {subtitle}
                                        </Text>
                                    )}
                                </View>
                            </View>
                            <TouchableOpacity
                                onPress={onClose}
                                className="w-10 h-10 rounded-full items-center justify-center hover:bg-red-50 active:bg-red-100 transition-colors"
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <X size={22} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Body Content */}
                    <ScrollView
                        style={{ maxHeight: height * 0.75 }}
                        className="bg-white"
                        contentContainerStyle={{ padding: 20 }}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        bounces={isWeb ? false : true}
                    >
                        {children}
                    </ScrollView>

                    {/* Footer - Optional sticky footer */}
                    {footer && (
                        <View className="px-6 py-4 bg-gray-50/50 border-t border-gray-100">
                            {footer}
                        </View>
                    )}
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default CustomModal;
