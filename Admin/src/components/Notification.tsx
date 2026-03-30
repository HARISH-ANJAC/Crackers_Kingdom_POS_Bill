import { View, Text, TouchableOpacity, ScrollView, Animated } from 'react-native'
import React, { useState, useRef, useEffect } from 'react'
import { Bell, X, Check, CheckCheck } from 'lucide-react-native'
import { clsx } from 'clsx'

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

const Notification = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;

//   const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 10
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true
        }),
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true
        })
      ]).start();
    }
  }, [isOpen]);

//   const markAsRead = (id: string) => {
//     setNotifications(prev =>
//       prev.map(notif =>
//         notif.id === id ? { ...notif, read: true } : notif
//       )
//     );
//   };

//   const markAllAsRead = () => {
//     setNotifications(prev =>
//       prev.map(notif => ({ ...notif, read: true }))
//     );
//   };

//   const clearAll = () => {
//     setNotifications([]);
//   };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-100 border-green-200';
      case 'warning': return 'bg-yellow-100 border-yellow-200';
      case 'error': return 'bg-red-100 border-red-200';
      default: return 'bg-blue-100 border-blue-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return '✓';
      case 'warning': return '⚠';
      case 'error': return '✕';
      default: return 'ℹ';
    }
  };

  return (
    <View className="relative">
      {/* Bell Icon Button */}
      <TouchableOpacity
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.7}
        className="relative p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-all"
      >
        <Bell size={22} color="#374151" strokeWidth={2} />
        
        {/* Badge */}
        {/* {unreadCount > 0 && (
          <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[18px] h-[18px] items-center justify-center px-1">
            <Text className="text-white text-[10px] font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Text>
          </View>
        )} */}
      </TouchableOpacity>

      {/* Dropdown Panel */}
      {/* {isOpen && (
        <>
          Backdrop */}
          {/* <TouchableOpacity
            activeOpacity={1}
            onPress={() => setIsOpen(false)}
            className="fixed inset-0 z-40"
            style={{ position: 'fixed' as any }}
          /> */}

          {/* Notification Panel */}
          {/* <Animated.View
            style={{
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-10, 0]
                  })
                },
                { scale: scaleAnim }
              ],
              opacity: slideAnim
            }}
            className="absolute right-0 top-12 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
          >
            Header */}
            {/* <View className="flex-row items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <View>
                <Text className="text-lg font-bold text-gray-900">Notifications</Text>
                <Text className="text-xs text-gray-500 mt-0.5">
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                </Text>
              </View>
              
              <View className="flex-row gap-x-2">
                {unreadCount > 0 && (
                  <TouchableOpacity
                    onPress={markAllAsRead}
                    activeOpacity={0.7}
                    className="p-2 rounded-lg hover:bg-gray-200 active:bg-gray-300"
                  >
                    <CheckCheck size={18} color="#6B7280" />
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity
                  onPress={() => setIsOpen(false)}
                  activeOpacity={0.7}
                  className="p-2 rounded-lg hover:bg-gray-200 active:bg-gray-300"
                >
                  <X size={18} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>

            Notifications List */}
            {/* <ScrollView
              className="max-h-96"
              showsVerticalScrollIndicator={false}
            >
              {notifications.length === 0 ? (
                <View className="p-8 items-center justify-center">
                  <Bell size={48} color="#D1D5DB" strokeWidth={1.5} />
                  <Text className="text-gray-400 mt-3 text-sm">No notifications</Text>
                </View>
              ) : (
                notifications.map((notif, index) => (
                  <TouchableOpacity
                    key={notif.id}
                    onPress={() => markAsRead(notif.id)}
                    activeOpacity={0.7}
                    className={clsx(
                      'p-4 border-b border-gray-100 hover:bg-gray-50 active:bg-gray-100 transition-all',
                      !notif.read && 'bg-blue-50/50'
                    )}
                  >
                    <View className="flex-row gap-x-3"> */}
                      {/* Type Icon */}
                      {/* <View className={clsx(
                        'w-10 h-10 rounded-xl items-center justify-center border',
                        getTypeColor(notif.type)
                      )}>
                        <Text className="text-lg">{getTypeIcon(notif.type)}</Text>
                      </View> */}

                      {/* Content */}
                      {/* <View className="flex-1">
                        <View className="flex-row items-start justify-between mb-1">
                          <Text className={clsx(
                            'text-sm font-semibold flex-1',
                            notif.read ? 'text-gray-700' : 'text-gray-900'
                          )}>
                            {notif.title}
                          </Text>
                          {!notif.read && (
                            <View className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1" />
                          )}
                        </View>
                        
                        <Text className="text-xs text-gray-600 mb-2 leading-relaxed">
                          {notif.message}
                        </Text>
                        
                        <Text className="text-[10px] text-gray-400 font-medium">
                          {notif.time}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView> */}

            {/* Footer */}
            {/* {notifications.length > 0 && (
              <View className="p-3 border-t border-gray-200 bg-gray-50">
                <TouchableOpacity
                  onPress={clearAll}
                  activeOpacity={0.7}
                  className="py-2 px-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 active:bg-gray-200"
                >
                  <Text className="text-center text-sm font-semibold text-gray-700">
                    Clear All
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </>
      )} */}
    </View>
  );
};

export default Notification;