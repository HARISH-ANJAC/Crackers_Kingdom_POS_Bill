import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Check } from 'lucide-react-native';
import { clsx } from 'clsx';

type CustomCheckBoxProps = {
  checked: boolean;
  onPress: () => void;
  label?: string;
  disabled?: boolean;
  size?: number;
  className?: string;
  labelClassName?: string;
};

const CustomCheckBox = ({
  checked,
  onPress,
  label,
  disabled = false,
  size = 20,
  className = '',
  labelClassName = '',
}: CustomCheckBoxProps) => {
  const [isPressed, setIsPressed] = useState(false);

  const handlePressIn = () => {
    if (!disabled) {
      setIsPressed(true);
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      setIsPressed(false);
    }
  };

  const handlePress = () => {
    if (!disabled) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={disabled ? 1 : 0.7}
      className={clsx(
        'flex-row items-center',
        disabled && 'opacity-50',
        className
      )}
    >
      {/* Checkbox Container */}
      <View
        className={clsx(
          'items-center justify-center border-2 rounded transition-all duration-200',
          checked
            ? 'bg-primary border-primary'
            : 'bg-white border-gray-300',
          isPressed && !disabled && (checked ? 'bg-primary/90' : 'bg-gray-50'),
          disabled && 'bg-gray-100 border-gray-300'
        )}
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.25, // 25% of size for rounded corners
        }}
      >
        {/* Check Icon */}
        {checked && (
          <Check
            size={size * 0.7} // 70% of container size
            color="white"
            strokeWidth={3}
            style={{
              position: 'absolute',
            }}
          />
        )}
      </View>

      {/* Label */}
      {label && (
        <Text
          className={clsx(
            'ml-3 text-gray-700 text-sm',
            disabled && 'text-gray-400',
            labelClassName
          )}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default CustomCheckBox;