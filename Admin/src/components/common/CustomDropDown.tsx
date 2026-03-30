import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Platform,
  useWindowDimensions,
  ScrollView,
  TextInput,
  Pressable,
  StyleSheet,
} from 'react-native';
import {
  ChevronDown,
  Search,
  Check,
  X,
  ChevronUp,
  LucideIcon
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { clsx } from 'clsx';

export type DropDownItem = {
  label: string;
  value: string;
  icon?: LucideIcon;
  disabled?: boolean;
  subtitle?: string;
};

type DropDownProps = {
  label?: string;
  placeholder?: string;
  items: DropDownItem[];
  selectedValue?: string | string[];
  onSelect: (value: string | string[]) => void;
  multiple?: boolean;
  searchable?: boolean;
  disabled?: boolean;
  error?: string;
  success?: string;
  required?: boolean;
  className?: string;
  maxHeight?: number;
  showClear?: boolean;
  emptyText?: string;
};

// Styles for proper z-index management
const styles = StyleSheet.create({
  webContainer: {
    position: 'relative',
    zIndex: Platform.OS === 'web' ? 10 : undefined,
  } as any,
  webDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 9999, // High z-index for the dropdown content
  } as any,
});

const CustomDropDown = ({
  label,
  placeholder = 'Select an option',
  items,
  selectedValue,
  onSelect,
  multiple = false,
  searchable = false,
  disabled = false,
  error,
  success,
  required = false,
  className = '',
  maxHeight = 300,
  showClear = false,
  emptyText = 'No options available',
}: DropDownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<View>(null);
  const dropdownContentRef = useRef<View>(null);

  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';

  // Filter items based on search
  const filteredItems = React.useMemo(() => {
    return searchable
      ? items.filter(item =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      : items;
  }, [items, searchable, searchQuery]);

  // Get selected labels
  const getSelectedLabel = () => {
    if (!selectedValue || (multiple && Array.isArray(selectedValue) && selectedValue.length === 0)) {
      return placeholder;
    }

    if (multiple && Array.isArray(selectedValue)) {
      const selectedItems = items.filter(item => selectedValue.includes(item.value));
      if (selectedItems.length === 0) return placeholder;
      if (selectedItems.length === 1) return selectedItems[0].label;
      return `${selectedItems.length} selected`;
    }

    if (!multiple && typeof selectedValue === 'string') {
      const item = items.find(i => i.value === selectedValue);
      return item?.label || placeholder;
    }

    return placeholder;
  };

  // Check if item is selected
  const isSelected = (value: string) => {
    if (multiple && Array.isArray(selectedValue)) {
      return selectedValue.includes(value);
    }
    return selectedValue === value;
  };

  // Handle item selection
  const handleSelect = (value: string) => {
    if (disabled) return;

    if (multiple) {
      const currentValues = Array.isArray(selectedValue) ? [...selectedValue] : [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      onSelect(newValues);
    } else {
      onSelect(value);
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  // Clear selection
  const handleClear = (e?: any) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (disabled) return;
    onSelect(multiple ? [] : '');
    if (multiple) {
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  // Open dropdown
  const handleOpen = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
  };

  // Close dropdown on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: any) => {
      if (isWeb) {
        const target = event.target as HTMLElement;
        const dropdownEl = dropdownRef.current as any;
        const contentEl = dropdownContentRef.current as any;

        if (dropdownEl &&
          !dropdownEl.contains(target) &&
          (!contentEl || !contentEl.contains(target))) {
          setIsOpen(false);
          setSearchQuery('');
        }
      }
    };

    if (isWeb) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          setIsOpen(false);
          setSearchQuery('');
        }
      });
    }

    return () => {
      if (isWeb) {
        document.removeEventListener('mousedown', handleClickOutside);
      }
    };
  }, [isOpen, isWeb]);

  const selectedLabel = getSelectedLabel();
  const hasSelection = multiple
    ? Array.isArray(selectedValue) && selectedValue.length > 0
    : selectedValue && selectedValue !== '';

  return (
    <View
      className={`relative ${className}`}
      ref={dropdownRef}
      style={isWeb ? [styles.webContainer, isOpen && { zIndex: 10000 }] : {}}
    >
      {/* Label */}
      {label && (
        <Text className="text-sm font-semibold text-text-primary mb-2 flex-row items-center">
          {label}
          {required && <Text className="text-red-500 ml-1">*</Text>}
        </Text>
      )}

      {/* Dropdown Trigger */}
      <TouchableOpacity
        onPress={handleOpen}
        disabled={disabled}
        activeOpacity={0.7}
        className={clsx(
          'flex-row items-center justify-between px-4 py-3 border rounded-xl',
          disabled && 'opacity-50',
          error ? 'border-red-500 bg-red-50' :
            success ? 'border-green-500 bg-green-50' :
              isOpen ? 'border-primary' : 'border-gray-300',
          !disabled && 'active:opacity-80'
        )}
      >
        <View className="flex-1">
          <Text
            className={clsx(
              'text-base',
              selectedLabel === placeholder ? 'text-gray-500' : 'text-gray-800'
            )}
            numberOfLines={1}
          >
            {selectedLabel}
          </Text>
        </View>

        <View className="flex-row items-center ml-2">
          {showClear && hasSelection && !disabled && (
            <TouchableOpacity
              onPress={handleClear}
              className="p-1 mr-2"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={16} color="#9CA3AF" />
            </TouchableOpacity>
          )}
          {isOpen ? (
            <ChevronUp size={18} color="#6B7280" />
          ) : (
            <ChevronDown size={18} color="#6B7280" />
          )}
        </View>
      </TouchableOpacity>

      {/* Error/Success Messages */}
      {(error || success) && (
        <Text className={`text-xs mt-1.5 ml-1 ${error ? 'text-red-500' : 'text-green-600'}`}>
          {error || success}
        </Text>
      )}

      {/* Dropdown Content */}
      {isOpen && (
        <>
          {isWeb ? (
            // Web version - positioned absolutely
            <View
              ref={dropdownContentRef}
              style={[
                styles.webDropdown,
                {
                  marginTop: 4,
                }
              ]}
            >
              <View
                className="bg-white rounded-xl border border-gray-200 shadow-xl"
                style={{
                  maxHeight: Math.min(maxHeight, height * 0.6),
                }}
              >
                {/* Search Bar (if searchable) */}
                {searchable && (
                  <View className="px-3 py-2 border-b border-gray-100">
                    <View className="flex-row items-center bg-gray-50 rounded-lg px-3 py-2">
                      <Search size={16} color="#9CA3AF" />
                      <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search..."
                        placeholderTextColor="#9CA3AF"
                        className={clsx(
                          'flex-1 text-text-primary text-sm ml-2',
                          isWeb && 'outline-none'
                        )}
                        autoFocus={isWeb}
                      />
                      {searchQuery.length > 0 && (
                        <TouchableOpacity
                          onPress={() => setSearchQuery('')}
                          className="p-1"
                        >
                          <X size={14} color="#9CA3AF" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}

                {/* Options List */}
                {filteredItems.length > 0 ? (
                  <ScrollView
                    style={{ maxHeight: Math.min(maxHeight - (searchable ? 60 : 0), 300) }}
                    showsVerticalScrollIndicator={true}
                  >
                    {filteredItems.map((item, index) => {
                      const Icon = item.icon;
                      const selected = isSelected(item.value);

                      return (
                        <TouchableOpacity
                          key={`${item.value}-${index}`}
                          onPress={() => !item.disabled && handleSelect(item.value)}
                          disabled={item.disabled}
                          activeOpacity={0.7}
                          className={clsx(
                            'flex-row items-center px-4 py-3 border-b border-gray-100 last:border-b-0',
                            selected && 'bg-blue-50',
                            item.disabled && 'opacity-40',
                            !item.disabled && 'hover:bg-gray-50'
                          )}
                        >
                          {/* Icon */}
                          {Icon && (
                            <Icon
                              size={18}
                              color={selected ? '#4F46E5' : '#6B7280'}
                              className="mr-3"
                            />
                          )}

                          {/* Content */}
                          <View className="flex-1 flex-row items-center justify-between">
                            <View>
                              <Text
                                className={clsx(
                                  'text-sm font-medium',
                                  selected ? 'text-primary' : 'text-gray-800',
                                  item.disabled && 'text-gray-400'
                                )}
                              >
                                {item.label}
                              </Text>
                              {item.subtitle && (
                                <Text
                                  className={clsx(
                                    'text-xs mt-0.5',
                                    selected ? 'text-primary/80' : 'text-gray-500',
                                    item.disabled && 'text-gray-400'
                                  )}
                                >
                                  {item.subtitle}
                                </Text>
                              )}
                            </View>
                            {selected && (
                              <Check size={16} color="#4F46E5" strokeWidth={3} />
                            )}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                ) : (
                  /* Empty State */
                  <View className="py-6 items-center justify-center">
                    <Search size={32} color="#D1D5DB" />
                    <Text className="text-gray-500 text-sm font-medium mt-2">
                      {emptyText}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ) : (
            // Native version - using Modal
            <Modal
              transparent
              visible={isOpen}
              animationType="fade"
              onRequestClose={() => setIsOpen(false)}
            >
              <Pressable
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  paddingTop: insets.top,
                  paddingBottom: insets.bottom,
                }}
                onPress={() => setIsOpen(false)}
              >
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Pressable
                    style={{
                      width: width * 0.9,
                      maxWidth: 400,
                      backgroundColor: 'white',
                      borderRadius: 12,
                      maxHeight: height * 0.7,
                    }}
                    onPress={(e) => e.stopPropagation()}
                  >
                    {/* Search Bar (if searchable) */}
                    {searchable && (
                      <View className="px-4 py-3 border-b border-gray-100">
                        <View className="flex-row items-center bg-gray-50 rounded-lg px-3 py-2">
                          <Search size={18} color="#9CA3AF" />
                          <TextInput
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder="Search..."
                            placeholderTextColor="#9CA3AF"
                            className="flex-1 text-text-primary text-base ml-2"
                          />
                          {searchQuery.length > 0 && (
                            <TouchableOpacity
                              onPress={() => setSearchQuery('')}
                              className="p-1"
                            >
                              <X size={16} color="#9CA3AF" />
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    )}

                    {/* Options List */}
                    <ScrollView style={{ maxHeight: height * 0.7 - (searchable ? 60 : 0) }}>
                      {filteredItems.length > 0 ? (
                        filteredItems.map((item, index) => {
                          const Icon = item.icon;
                          const selected = isSelected(item.value);

                          return (
                            <TouchableOpacity
                              key={`${item.value}-${index}`}
                              onPress={() => !item.disabled && handleSelect(item.value)}
                              disabled={item.disabled}
                              activeOpacity={0.7}
                              className={clsx(
                                'flex-row items-center px-4 py-3 border-b border-gray-100',
                                selected && 'bg-blue-50',
                                item.disabled && 'opacity-40'
                              )}
                            >
                              {/* Icon */}
                              {Icon && (
                                <Icon
                                  size={20}
                                  color={selected ? '#4F46E5' : '#6B7280'}
                                  className="mr-3"
                                />
                              )}

                              {/* Content */}
                              <View className="flex-1 flex-row items-center justify-between">
                                <View>
                                  <Text
                                    className={clsx(
                                      'text-base font-medium',
                                      selected ? 'text-primary' : 'text-gray-800',
                                      item.disabled && 'text-gray-400'
                                    )}
                                  >
                                    {item.label}
                                  </Text>
                                  {item.subtitle && (
                                    <Text
                                      className={clsx(
                                        'text-sm mt-0.5',
                                        selected ? 'text-primary/80' : 'text-gray-500',
                                        item.disabled && 'text-gray-400'
                                      )}
                                    >
                                      {item.subtitle}
                                    </Text>
                                  )}
                                </View>
                                {selected && (
                                  <Check size={18} color="#4F46E5" strokeWidth={3} />
                                )}
                              </View>
                            </TouchableOpacity>
                          );
                        })
                      ) : (
                        <View className="py-8 items-center justify-center">
                          <Search size={40} color="#D1D5DB" />
                          <Text className="text-gray-500 text-base font-medium mt-3">
                            {emptyText}
                          </Text>
                        </View>
                      )}
                    </ScrollView>
                  </Pressable>
                </View>
              </Pressable>
            </Modal>
          )}
        </>
      )}
    </View>
  );
};

export default CustomDropDown;