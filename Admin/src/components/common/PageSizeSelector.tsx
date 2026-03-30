import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { clsx } from 'clsx';
import { ChevronDown } from 'lucide-react-native';

const PageSizeSelector = ({ 
  value, 
  options, 
  onChange,
  Direction = 'auto'
}: { 
  value: number; 
  options: number[]; 
  onChange: (value: number) => void;
  Direction?: 'top' | 'bottom' | 'auto';
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View className="relative">
      <TouchableOpacity
        onPress={() => setIsOpen(!isOpen)}
        className="flex-row items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-lg"
      >
        <Text className="text-gray-700 text-sm">{value}</Text>
        <ChevronDown size={16} color="#6b7280" />
      </TouchableOpacity>

      {isOpen && (
        <View className={clsx(
          "absolute left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50",
          Direction === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'
        )}>
          {options.map(option => (
            <TouchableOpacity
              key={option}
              onPress={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className={clsx(
                'px-3 py-2',
                value === option ? 'bg-primary/10' : 'bg-white'
              )}
            >
              <Text className={clsx(
                value === option ? 'text-primary font-medium' : 'text-gray-700',
                'text-sm'
              )}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export default PageSizeSelector;