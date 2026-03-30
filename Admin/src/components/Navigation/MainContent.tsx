import { View, Text, TouchableOpacity, ScrollView, useWindowDimensions, Platform } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Bell, Menu, User, Maximize, Minimize } from 'lucide-react-native'
import DashboardScreen from '../../screens/DashboardScreen'
import CategoryScreen from '../../screens/CategoryScreen'
import { COLORS } from '../../Constants/Colors'

type MainContentProps = {
  activeScreen: string;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const MainContent = ({ activeScreen, isSidebarOpen, onToggleSidebar }: MainContentProps) => {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web" && width >= 980;
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (Platform.OS !== 'web') return;

    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err: any) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case "dashboard":
        return <DashboardScreen />;
      case "category":
        return <CategoryScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <View className='flex-1 min-w-0 flex-col h-screen transition-all duration-300'>
      {/* Header */}
      <View className='h-14 bg-white border-b  border-gray-200 flex-row items-center justify-between px-6 shadow-sm z-10'>
        <View className='flex-row items-center'>
          <TouchableOpacity
            onPress={onToggleSidebar}
            className='mr-4 p-2 hover:bg-gray-100 rounded-lg lg:hidden'
          >
            <Menu size={16} color="#64748b" />
          </TouchableOpacity>
        </View>


        {/* Right Header Actions */}
        <View className='flex-row items-center gap-x-4'>
          {/* full screen in isweb only show like a F11 press Funcationality  */}
          {isWeb && (
            <TouchableOpacity
              onPress={toggleFullscreen}
              className='p-2 hover:bg-gray-100 rounded-full relative'
            >
              {isFullscreen ? (
                <Minimize size={20} color="#64748b" />
              ) : (
                <Maximize size={20} color="#64748b" />
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity className='p-2 hover:bg-gray-100 rounded-full relative'>
            <Bell size={20} color="#64748b" />
            <View className='absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white' />
          </TouchableOpacity>

          <View className='h-8 w-[1px] bg-gray-200 mx-2' />

          <TouchableOpacity className='flex-row items-center gap-x-3 p-1.5 hover:bg-gray-50 rounded-xl'>
            <View className='flex-col items-end hidden sm:flex'>
              <Text className='text-[13px] font-bold text-text-primary'>Admin User</Text>
              <Text className='text-[11px] text-gray-400 capitalize'>Super Admin</Text>
            </View>
            <View className='w-9 h-9 bg-primary/10 rounded-full items-center justify-center border border-primary/20'>
              <User size={18} color="#4F46E5" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content Area */}
      <ScrollView
        className='flex-1 p-6'
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {renderScreen()}
      </ScrollView>
    </View>
  )
}

export default MainContent
