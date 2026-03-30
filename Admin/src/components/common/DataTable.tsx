// DataTable.tsx
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
  Modal,
  Platform,
  ViewStyle,
  TextStyle,
  ListRenderItemInfo
} from 'react-native';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Check, X, ChevronDown } from 'lucide-react-native';
import { COLORS } from '../../Constants/Colors';

// ==================== TYPES ====================
export interface Column {
  key: string;
  title: string;
  width: number; // Made required for perfect alignment
  minWidth?: number;
  maxWidth?: number;
  style?: ViewStyle;
  headerStyle?: ViewStyle;
  textStyle?: TextStyle;
  render?: (item: any, index: number) => React.ReactNode;
  sortable?: boolean;
  wrap?: boolean;
  align?: 'left' | 'center' | 'right';
  flex?: number;
}

export interface DataTableProps {
  data: any[];
  columns: Column[];
  keyExtractor: (item: any, index: number) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;

  // Pagination props
  pagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageChange?: (page: number, pageSize: number) => void;
  totalItems?: number;
  currentPage?: number;

  // Selection props
  selectable?: boolean;
  selectedItems?: string[];
  onSelectItem?: (item: any, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;

  // Sorting props
  sortable?: boolean;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;

  // Styling props
  containerStyle?: ViewStyle;
  headerStyle?: ViewStyle;
  rowStyle?: ViewStyle;

  // Responsive props
  minTableWidth?: number;
  horizontalScroll?: boolean;

  // Performance props
  initialNumToRender?: number;
  maxToRenderPerBatch?: number;
  windowSize?: number;
}

// ==================== DROPDOWN COMPONENT ====================
const PageSizeDropdown = ({
  options,
  selectedValue,
  onSelect,
  isWeb
}: {
  options: number[];
  selectedValue: number;
  onSelect: (value: number) => void;
  isWeb: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 120 });
  const buttonRef = useRef<React.ElementRef<typeof TouchableOpacity>>(null);

  // ── WEB: Fully styled native <select> — most reliable cross-browser approach ──
  if (Platform.OS === 'web') {
    return (
      <select
        value={selectedValue}
        onChange={(e: any) => onSelect(Number(e.target.value))}
        style={{
          appearance: 'none',
          WebkitAppearance: 'none',
          MozAppearance: 'none',
          backgroundColor: '#FFFFFF',
          border: '1.5px solid #E5E7EB',
          borderRadius: '8px',
          paddingTop: '8px',
          paddingBottom: '8px',
          paddingLeft: '14px',
          paddingRight: '36px',
          fontSize: '14px',
          fontWeight: '600',
          color: '#1F2937',
          cursor: 'pointer',
          outline: 'none',
          minWidth: '130px',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 10px center',
          backgroundSize: '14px',
          transition: 'border-color 0.15s ease',
          fontFamily: 'inherit',
          lineHeight: '1.4',
        } as any}
        onMouseEnter={(e: any) => { e.target.style.borderColor = '#9CA3AF'; }}
        onMouseLeave={(e: any) => { e.target.style.borderColor = '#E5E7EB'; }}
        onFocus={(e: any) => { e.target.style.borderColor = '#6366F1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
        onBlur={(e: any) => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }}
      >
        {options.map((opt) => (
          <option key={opt} value={opt} style={{ fontWeight: '500', padding: '8px' }}>
            {opt === -1 ? 'Display All' : `${opt} rows`}
          </option>
        ))}
      </select>
    );
  }

  // ── MOBILE: Bottom-sheet Modal ──
  const handleOpen = () => {
    if (buttonRef.current) {
      (buttonRef.current as any).measure((_x: any, _y: any, width: any, height: any, pageX: any, pageY: any) => {
        setDropdownPosition({
          top: pageY + height + 4,
          left: pageX,
          width: Math.max(width, 130),
        });
        setIsOpen(true);
      });
    }
  };

  const handleSelect = (value: number) => {
    onSelect(value);
    setIsOpen(false);
  };

  return (
    <View>
      <TouchableOpacity
        ref={buttonRef}
        onPress={handleOpen}
        activeOpacity={0.7}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#FFFFFF',
          borderWidth: 1,
          borderColor: '#E5E7EB',
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 10,
          minWidth: 90,
        }}
      >
        <Text style={{ fontSize: 14, color: '#1F2937', fontWeight: '600', marginRight: 6 }}>
          {selectedValue === -1 ? 'All' : `${selectedValue}`}
        </Text>
        <ChevronDown size={14} color="#6B7280" />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}
        >
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingBottom: 40,
              maxHeight: '60%',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 10,
            }}
          >
            {/* Handle bar */}
            <View style={{ alignItems: 'center', paddingVertical: 14 }}>
              <View style={{ width: 40, height: 4, backgroundColor: '#E5E7EB', borderRadius: 2 }} />
              <Text style={{ marginTop: 10, fontSize: 16, fontWeight: '700', color: '#1F2937' }}>
                Rows per page
              </Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {options.map((option) => (
                <TouchableOpacity
                  key={option}
                  onPress={() => handleSelect(option)}
                  style={[
                    {
                      paddingHorizontal: 24,
                      paddingVertical: 16,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    },
                    selectedValue === option && { backgroundColor: '#F0F7FF' }
                  ]}
                >
                  <Text style={[
                    { fontSize: 16, color: '#374151', fontWeight: '500' },
                    selectedValue === option && { color: COLORS.primary, fontWeight: '700' }
                  ]}>
                    {option === -1 ? 'Display All' : `${option} records`}
                  </Text>
                  {selectedValue === option && (
                    <Check size={18} color={COLORS.primary} strokeWidth={3} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};


// ==================== DATA ROW COMPONENT ====================
const DataRow = React.memo(({
  item,
  index,
  columns,
  selectable,
  isSelected,
  onSelectItem,
  keyExtractor,
  isWeb,
  rowStyle,
  getColumnStyle,
  getTextAlign,
  Checkbox
}: {
  item: any;
  index: number;
  columns: Column[];
  selectable: boolean;
  isSelected: boolean;
  onSelectItem: (item: any, checked: boolean) => void;
  keyExtractor: (item: any, index: number) => string;
  isWeb: boolean;
  rowStyle?: ViewStyle;
  getColumnStyle: (column: Column) => ViewStyle;
  getTextAlign: (column: Column) => TextStyle;
  Checkbox: any;
}) => {
  return (
    <View style={[
      {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        minWidth: '100%',
      },
      index % 2 === 0 ? { backgroundColor: '#FFFFFF' } : { backgroundColor: '#FAFAFA' },
      rowStyle
    ]}>
      {selectable && (
        <View style={{
          width: isWeb ? 52 : 48,
          paddingHorizontal: 0,
          paddingVertical: isWeb ? 14 : 12,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Checkbox
            checked={isSelected}
            onPress={() => onSelectItem(item, !isSelected)}
          />
        </View>
      )}

      {columns.map((column) => {
        const columnStyle = getColumnStyle(column);
        const textAlign = getTextAlign(column);

        return (
          <View
            key={`${keyExtractor(item, index)}-${column.key}`}
            style={[
              columnStyle,
              {
                paddingHorizontal: isWeb ? 16 : 12,
                paddingVertical: isWeb ? 14 : 12,
                justifyContent: 'center',
              }
            ]}
          >
            {column.render ? (
              <View style={{
                flex: 1,
                alignItems: column.align === 'right' ? 'flex-end' : column.align === 'center' ? 'center' : 'flex-start',
              }}>
                {column.render(item, index)}
              </View>
            ) : (
              <Text
                numberOfLines={column.wrap ? undefined : 2}
                style={[
                  {
                    color: '#1F2937',
                    fontSize: isWeb ? 14 : 15,
                    lineHeight: isWeb ? 20 : 22,
                    flexWrap: column.wrap ? 'wrap' : 'nowrap',
                  },
                  column.textStyle,
                  textAlign
                ]}
              >
                {item[column.key]?.toString() || '-'}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
});

const DataTable: React.FC<DataTableProps> = ({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  emptyMessage = 'No data available',
  emptyIcon,

  pagination = true,
  pageSize: initialPageSize = 10,
  pageSizeOptions = [5, 10, 25, 50, 100, -1],
  onPageChange,
  totalItems,
  currentPage: initialCurrentPage,

  selectable = false,
  selectedItems = [],
  onSelectItem,
  onSelectAll,

  sortable = false,
  onSort,

  containerStyle,
  headerStyle,
  rowStyle,

  minTableWidth = 768,
  horizontalScroll = true,

  initialNumToRender = 10,
  maxToRenderPerBatch = 10,
  windowSize = 5,
}) => {
  const { width } = useWindowDimensions();
  const isWeb = width >= minTableWidth;
  const flatListRef = useRef<FlatList>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // ==================== STATE ====================
  const [currentPage, setCurrentPage] = useState(initialCurrentPage || 1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Sync from props if controlled
  useEffect(() => {
    if (initialCurrentPage !== undefined) {
      setCurrentPage(initialCurrentPage);
    }
  }, [initialCurrentPage]);

  // ==================== TOTAL WIDTH CALCULATION ====================
  const totalColumnsWidth = useMemo(() => {
    let sum = columns.reduce((acc, col) => acc + (col.width || 0), 0);
    if (selectable) {
      sum += isWeb ? 52 : 48;
    }
    return sum;
  }, [columns, selectable, isWeb]);

  const tableMinWidth = useMemo(() => {
    return Math.max(totalColumnsWidth, isWeb ? 0 : minTableWidth);
  }, [totalColumnsWidth, isWeb, minTableWidth]);

  // ==================== MEMOIZED DATA ====================
  const paginatedData = useMemo(() => {
    // If totalItems is provided, we assume data is already paginated by the server
    if (totalItems !== undefined) return data;
    if (!pagination || pageSize === -1) return data;
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return data.slice(start, end);
  }, [data, currentPage, pageSize, pagination, totalItems]);

  const totalPages = useMemo(() => {
    if (!pagination || pageSize === -1) return 1;
    const itemsCount = totalItems !== undefined ? totalItems : data.length;
    return Math.ceil(itemsCount / pageSize);
  }, [data.length, pageSize, pagination, totalItems]);

  // ==================== EFFECTS ====================
  useEffect(() => {
    if (totalItems === undefined) {
      setCurrentPage(1);
    }
  }, [data.length, pageSize, totalItems]);

  // ==================== HANDLERS ====================
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    onPageChange?.(page, pageSize);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
  }, [pageSize, onPageChange]);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
    onPageChange?.(1, size);
  }, [onPageChange]);

  const handleSort = useCallback((columnKey: string) => {
    if (!sortable) return;

    let direction: 'asc' | 'desc' = 'asc';
    if (sortColumn === columnKey) {
      direction = sortDirection === 'asc' ? 'desc' : 'asc';
    }

    setSortColumn(columnKey);
    setSortDirection(direction);
    onSort?.(columnKey, direction);
  }, [sortable, sortColumn, sortDirection, onSort]);

  const handleSelectAll = useCallback((checked: boolean) => {
    onSelectAll?.(checked);
  }, [onSelectAll]);

  const handleSelectItem = useCallback((item: any, checked: boolean) => {
    onSelectItem?.(item, checked);
  }, [onSelectItem]);

  // ==================== SELECTION HELPERS ====================
  const isAllSelectedOnPage = useMemo(() => {
    if (!selectable || !selectedItems.length || !paginatedData.length) return false;
    return paginatedData.every((item, index) =>
      selectedItems.includes(keyExtractor(item, index))
    );
  }, [paginatedData, selectedItems, selectable, keyExtractor]);

  const isIndeterminate = useMemo(() => {
    if (!selectable || !selectedItems.length) return false;
    const selectedCount = paginatedData.filter((item, index) =>
      selectedItems.includes(keyExtractor(item, index))
    ).length;
    return selectedCount > 0 && selectedCount < paginatedData.length;
  }, [paginatedData, selectedItems, selectable, keyExtractor]);

  // ==================== UI COMPONENTS ====================
  const Checkbox = useCallback(({ checked, indeterminate, onPress }: { checked: boolean; indeterminate?: boolean; onPress: () => void }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        width: isWeb ? 20 : 22,
        height: isWeb ? 20 : 22,
        borderWidth: 2,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: checked || indeterminate ? '#2563EB' : '#FFFFFF',
        borderColor: checked || indeterminate ? '#2563EB' : '#D1D5DB',
      }}
    >
      {indeterminate ? (
        <View style={{ width: 10, height: 2, backgroundColor: '#FFFFFF', borderRadius: 1 }} />
      ) : checked ? (
        <Check size={isWeb ? 14 : 12} color="#FFFFFF" strokeWidth={3} />
      ) : null}
    </TouchableOpacity>
  ), [isWeb]);

  const getColumnStyle = useCallback((column: Column): ViewStyle => {
    return {
      width: column.width,
      minWidth: column.minWidth || column.width,
      maxWidth: column.maxWidth,
      flex: column.flex,
      ...column.style,
    };
  }, []);

  const getTextAlign = useCallback((column: Column): TextStyle => {
    switch (column.align) {
      case 'center': return { textAlign: 'center' as const };
      case 'right': return { textAlign: 'right' as const };
      default: return { textAlign: 'left' as const };
    }
  }, []);

  // ==================== RENDERERS ====================
  const renderHeader = useCallback(() => (
    <View style={[
      {
        flexDirection: 'row',
        backgroundColor: '#F9FAFB',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        minWidth: '100%',
      },
      headerStyle
    ]}>
      {selectable && (
        <View style={{
          width: isWeb ? 52 : 48,
          paddingHorizontal: 0,
          paddingVertical: isWeb ? 14 : 12,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Checkbox
            checked={isAllSelectedOnPage}
            indeterminate={isIndeterminate}
            onPress={() => handleSelectAll(!isAllSelectedOnPage)}
          />
        </View>
      )}

      {columns.map((column) => {
        const columnStyle = getColumnStyle(column);
        const textAlign = getTextAlign(column);

        return (
          <View
            key={column.key}
            style={[
              columnStyle,
              {
                paddingHorizontal: isWeb ? 16 : 12,
                paddingVertical: isWeb ? 14 : 12,
                justifyContent: 'center',
              }
            ]}
          >
            <TouchableOpacity
              onPress={() => handleSort(column.key)}
              disabled={!column.sortable}
              activeOpacity={0.7}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: column.align === 'right' ? 'flex-end' : column.align === 'center' ? 'center' : 'flex-start',
              }}
            >
              <Text
                numberOfLines={2}
                style={[
                  {
                    fontWeight: '600',
                    color: '#1F2937',
                    fontSize: isWeb ? 15 : 16,
                    letterSpacing: 0.3,
                  },
                  column.headerStyle,
                  column.textStyle,
                  textAlign
                ]}
              >
                {column.title}
              </Text>
              {column.sortable && sortColumn === column.key && (
                <Text style={{
                  marginLeft: 6,
                  color: '#4B5563',
                  fontSize: isWeb ? 15 : 16,
                  fontWeight: '600',
                }}>
                  {sortDirection === 'asc' ? '^' : 'v'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  ), [columns, selectable, isAllSelectedOnPage, isIndeterminate, sortColumn, sortDirection, handleSort, handleSelectAll, getColumnStyle, getTextAlign, isWeb, headerStyle, Checkbox]);

  const renderRow = useCallback(({ item, index }: ListRenderItemInfo<any>) => (
    <DataRow
      item={item}
      index={index}
      columns={columns}
      selectable={selectable}
      isSelected={selectedItems.includes(keyExtractor(item, index))}
      onSelectItem={handleSelectItem}
      keyExtractor={keyExtractor}
      isWeb={isWeb}
      rowStyle={rowStyle}
      getColumnStyle={getColumnStyle}
      getTextAlign={getTextAlign}
      Checkbox={Checkbox}
    />
  ), [columns, selectable, selectedItems, keyExtractor, handleSelectItem, getColumnStyle, getTextAlign, isWeb, rowStyle, Checkbox]);

  const renderEmpty = useCallback(() => (
    <View style={{
      paddingVertical: isWeb ? 80 : 60,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FFFFFF',
      minWidth: '100%',
    }}>
      {emptyIcon || (
        <View style={{
          padding: isWeb ? 20 : 16,
          backgroundColor: '#F3F4F6',
          borderRadius: 9999,
        }}>
          <X size={isWeb ? 48 : 40} color="#9CA3AF" />
        </View>
      )}
      <Text style={{
        marginTop: isWeb ? 20 : 16,
        color: '#6B7280',
        fontSize: isWeb ? 18 : 17,
        fontWeight: '500',
      }}>
        {emptyMessage}
      </Text>
    </View>
  ), [emptyIcon, emptyMessage, isWeb]);

  const renderPagination = useCallback(() => {
    if (!pagination || (totalItems === undefined && data.length === 0)) return null;

    const start = pageSize === -1 ? 1 : (currentPage - 1) * pageSize + 1;
    const displayTotal = totalItems !== undefined ? totalItems : data.length;
    const end = pageSize === -1 ? displayTotal : Math.min(currentPage * pageSize, displayTotal);

    return (
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: isWeb ? 20 : 16,
        paddingVertical: isWeb ? 14 : 12,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        flexWrap: 'wrap',
        gap: 12,
        width: '100%',
        alignSelf: 'stretch',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <Text style={{
            fontSize: isWeb ? 14 : 15,
            color: '#4B5563',
            fontWeight: '500',
          }}>
            Rows per page:
          </Text>
          <PageSizeDropdown
            options={pageSizeOptions}
            selectedValue={pageSize}
            onSelect={handlePageSizeChange}
            isWeb={isWeb}
          />
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: isWeb ? 20 : 16 }}>
          <Text style={{
            fontSize: isWeb ? 14 : 15,
            color: '#4B5563',
            fontWeight: '500',
          }}>
            {pageSize === -1
              ? `${displayTotal} total records`
              : `${start}-${end} of ${displayTotal}`
            }
          </Text>

          {pageSize !== -1 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <TouchableOpacity
                onPress={() => handlePageChange(1)}
                disabled={currentPage === 1}
                activeOpacity={0.7}
                style={[
                  {
                    padding: isWeb ? 8 : 10,
                    borderRadius: 8,
                  },
                  currentPage === 1 && { opacity: 0.5 }
                ]}
              >
                <ChevronsLeft size={isWeb ? 20 : 18} color="#374151" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                activeOpacity={0.7}
                style={[
                  {
                    padding: isWeb ? 8 : 10,
                    borderRadius: 8,
                  },
                  currentPage === 1 && { opacity: 0.5 }
                ]}
              >
                <ChevronLeft size={isWeb ? 20 : 18} color="#374151" />
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                {Array.from({ length: totalPages }, (_, index) => {
                  const page = index + 1;
                  const isActivePage = currentPage === page;

                  // Limit page numbers shown?
                  if (totalPages > 7) {
                    if (page !== 1 && page !== totalPages && (page < currentPage - 1 || page > currentPage + 1)) {
                      if (page === currentPage - 2 || page === currentPage + 2) {
                        return <Text key={page} style={{ color: '#9CA3AF' }}>...</Text>;
                      }
                      return null;
                    }
                  }

                  return (
                    <TouchableOpacity
                      key={page}
                      onPress={() => handlePageChange(page)}
                      activeOpacity={0.7}
                      style={{
                        minWidth: isWeb ? 34 : 36,
                        paddingHorizontal: isWeb ? 10 : 9,
                        paddingVertical: isWeb ? 7 : 8,
                        borderRadius: 8,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isActivePage ? COLORS.primary : COLORS.secondary,
                      }}
                    >
                      <Text style={{
                        fontSize: isWeb ? 13 : 14,
                        fontWeight: '600',
                        color: isActivePage ? '#FFFFFF' : '#1F2937',
                      }}>
                        {page}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                onPress={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                activeOpacity={0.7}
                style={[
                  {
                    padding: isWeb ? 8 : 10,
                    borderRadius: 8,
                  },
                  currentPage === totalPages && { opacity: 0.5 }
                ]}
              >
                <ChevronRight size={isWeb ? 20 : 18} color="#374151" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                activeOpacity={0.7}
                style={[
                  {
                    padding: isWeb ? 8 : 10,
                    borderRadius: 8,
                  },
                  currentPage === totalPages && { opacity: 0.5 }
                ]}
              >
                <ChevronsRight size={isWeb ? 20 : 18} color="#374151" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  }, [pagination, totalItems, data.length, pageSize, currentPage, totalPages, pageSizeOptions, handlePageSizeChange, handlePageChange, isWeb]);

  const tableContent = horizontalScroll ? (
    <ScrollView
      ref={scrollViewRef}
      horizontal
      showsHorizontalScrollIndicator={true}
      contentContainerStyle={{
        minWidth: '100%',
        flexGrow: 1
      }}
    >
      <View style={{
        width: totalColumnsWidth > width ? totalColumnsWidth : '100%',
        minWidth: '100%',
        flex: 1
      }}>
        {renderHeader()}
        {isLoading ? (
          <View style={{ paddingVertical: 100, alignItems: 'center', minWidth: '100%' }}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={{ marginTop: 12, color: '#6B7280', fontSize: 14 }}>Loading data...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={paginatedData}
            renderItem={renderRow}
            keyExtractor={keyExtractor}
            ListEmptyComponent={renderEmpty}
            initialNumToRender={initialNumToRender}
            maxToRenderPerBatch={maxToRenderPerBatch}
            windowSize={windowSize}
            scrollEnabled={false}
          />
        )}
      </View>
    </ScrollView>
  ) : (
    <View style={{ flex: 1 }}>
      {renderHeader()}
      {isLoading ? (
        <View style={{ paddingVertical: 100, alignItems: 'center', minWidth: '100%' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={paginatedData}
          renderItem={renderRow}
          keyExtractor={keyExtractor}
          ListEmptyComponent={renderEmpty}
          initialNumToRender={initialNumToRender}
          maxToRenderPerBatch={maxToRenderPerBatch}
          windowSize={windowSize}
        />
      )}
    </View>
  );

  return (
    <View style={[{ backgroundColor: '#FFFFFF', width: '100%' }, containerStyle]}>
      {/* Table area — can be clipped by border-radius */}
      <View style={{ overflow: 'hidden', }}>
        {tableContent}
      </View>
      {/* Pagination — always full width, outside the clipped area */}
      {renderPagination()}
    </View>
  );
};

export default DataTable;
