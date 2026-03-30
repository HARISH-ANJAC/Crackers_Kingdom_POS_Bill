// src/components/Navigation/Sider.tsx
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import React from 'react';
import {
  LogOut,
  Store,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react-native';
import { clsx } from 'clsx';
import { MenuItem } from '../../redux/types';
import Skeleton from '../common/Skeleton';

interface SiderProps {
  activeScreen: string;
  onNavigate: (screen: string) => void;
  isOpen: boolean;
  onLogout: () => void;
  menuItems: MenuItem[];
  userEmail?: string;
  roleName?: string;
  isLoading?: boolean;
}

const Sider = ({
  activeScreen,
  onNavigate,
  isOpen,
  onLogout,
  menuItems,
  userEmail,
  roleName,
  isLoading
}: SiderProps) => {

  // Render menu item recursively
  const renderMenuItem = (item: MenuItem, isChild: boolean = false) => {
    const isActive = activeScreen.toLowerCase() === item.id.toLowerCase();
    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;

    if (hasChildren && isOpen) {
      return (
        <View key={item.id} className="mb-2">
          <View className={clsx(
            'flex-row items-center p-3 rounded-xl',
            !isOpen && 'justify-center'
          )}>
            <Icon
              size={22}
              color="#94a3b8"
              strokeWidth={2}
            />
            {isOpen && (
              <Text className="ml-3 font-semibold text-[14px] text-gray-500 uppercase text-xs tracking-wider">
                {item.label}
              </Text>
            )}
          </View>
          <View className="ml-4">
            {item.children?.map((child) => renderMenuItem(child, true))}
          </View>
        </View>
      );
    }

    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => onNavigate(item.id)}
        activeOpacity={0.7}
        className={clsx(
          'flex-row items-center p-3.5 rounded-2xl transition-all duration-200 relative',
          isActive ? 'bg-primary shadow-lg shadow-primary/30' : 'hover:bg-gray-50',
          !isOpen && 'justify-center',
          isChild && 'ml-4'
        )}
      >
        <Icon
          size={22}
          color={isActive ? 'white' : '#94a3b8'}
          strokeWidth={isActive ? 2.5 : 2}
        />
        {isOpen ? (
          <View className="flex-1 flex-row items-center justify-between ml-3">
            <Text
              className={clsx(
                'font-semibold text-[14px]',
                isActive ? 'text-white' : 'text-gray-500'
              )}
            >
              {item.label}
            </Text>
          </View>
        ) : isActive && (
          <View className="absolute left-0 w-1 h-8 bg-white rounded-r-full" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View
      className={clsx(
        'h-screen bg-white border-r border-gray-200 shadow-sm transition-all duration-300 relative',
        isOpen ? 'w-72' : 'w-20'
      )}
    >
      {/* Brand Section */}
      <View
        className={clsx(
          'flex-row items-center mt-6 mb-8',
          isOpen ? 'px-6' : 'justify-center px-0'
        )}
      >
        <View className="w-10 h-10 bg-primary rounded-xl items-center justify-center shadow-lg shadow-primary/20">
          <Store size={22} color="white" />
        </View>
        {isOpen && (
          <View className="ml-3">
            <Text className="text-lg font-bold text-text-primary tracking-tight">
              Crackers Shop
            </Text>
            <Text className="text-[10px] font-bold text-primary uppercase tracking-widest">
              {roleName || 'Admin Panel'}
            </Text>
          </View>
        )}
      </View>

      {/* Navigation Items */}
      <ScrollView
        className="flex-1 px-2"
        showsVerticalScrollIndicator={true}
        persistentScrollbar={true}
      >
        <View className="flex-col gap-y-2 pb-10">
          {isLoading ? (
            // Render Skeleton items
            Array.from({ length: 8 }).map((_, index) => (
              <View
                key={`skeleton-${index}`}
                className={clsx(
                  'flex-row items-center p-3.5 rounded-2xl',
                  !isOpen && 'justify-center'
                )}
              >
                <Skeleton
                  width={22}
                  height={22}
                  borderRadius={6}
                />
                {isOpen && (
                  <Skeleton
                    width="70%"
                    height={16}
                    className="ml-3"
                  />
                )}
              </View>
            ))
          ) : (
            menuItems.map((item) => renderMenuItem(item))
          )}
        </View>
      </ScrollView>

      {/* Footer / Logout Section */}
      <View className="p-4 border-t border-gray-100">
        {isOpen && userEmail && (
          <Text className="text-[10px] text-gray-400 text-center mb-2" numberOfLines={1}>
            {userEmail}
          </Text>
        )}

        <TouchableOpacity
          onPress={onLogout}
          activeOpacity={0.7}
          className={clsx(
            'flex-row items-center p-3.5 rounded-2xl hover:bg-red-50',
            !isOpen && 'justify-center'
          )}
        >
          <LogOut size={22} color="#f87171" />
          {isOpen && (
            <Text className="ml-3 font-semibold text-red-500">Logout</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default React.memo(Sider);