import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Menu, Bell, Search, Plus, LucideIcon } from 'lucide-react-native';
import { COLORS } from '../Constants/Colors';

interface HeaderProps {
  title: string;
  icon?: LucideIcon;
  navigation?: any;
  showSearch?: boolean;
  searchPlaceholder?: string;
  addButtonText?: string;
  onAddPress?: () => void;
}

const Header = ({ 
  title, 
  icon: Icon, 
  navigation, 
  showSearch = false,
  searchPlaceholder = "Search...",
}: HeaderProps) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  
  const isWeb = Platform.OS === "web" && width >= 980;


  return (
    <>{!isWeb&&(
          <View 
      className={`bg-white w-full shadow-sm border-b border-gray-100 flex-row items-center justify-between
        ${isWeb ? "px-8 py-4" : "px-4 py-3"}`}
      style={{ paddingTop: isWeb ? 16 : Math.max(insets.top, 10) }}
    >
      <View className="flex-row items-center">
        {!isWeb && (
          <TouchableOpacity 
            onPress={() => navigation?.openDrawer()}
            className="mr-3 p-2 rounded-xl bg-gray-50 active:bg-gray-100"
          >
            <Menu size={20} color={COLORS.text.primary} />
          </TouchableOpacity>
        )}
        
        {Icon && (
          <View className={`bg-primary/10 rounded-xl items-center justify-center mr-3 ${isWeb ? "p-3" : "p-2"}`}>
            <Icon size={isWeb ? 24 : 20} color={COLORS.primary} />
          </View>
        )}
        
        <Text className={`font-black text-text-primary ${isWeb ? "text-2xl" : "text-lg"}`}>
          {title}
        </Text>
      </View>

      <View className="flex-row items-center">
          <>
            {isWeb && showSearch && (
              <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5 mr-4 w-64 focus-within:bg-white focus-within:border-primary transition-all">
                <Search size={18} color={COLORS.text.secondary} className="mr-2" />
                <Text className="text-text-secondary text-sm">{searchPlaceholder}</Text>
              </View>
            )}
            
            <TouchableOpacity className="p-2 rounded-xl bg-gray-50 active:bg-gray-100 relative">
              <Bell size={20} color={COLORS.text.primary} />
              <View className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </TouchableOpacity>
          </>
       </View>
    </View>
    )}</>
  );
};

export default Header;
