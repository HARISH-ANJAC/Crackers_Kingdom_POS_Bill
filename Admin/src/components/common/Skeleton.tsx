import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, ViewStyle, Platform } from 'react-native';

interface SkeletonProps {
    width?: number | string;
    height?: number | string;
    borderRadius?: number;
    className?: string;
    style?: ViewStyle;
}

const Skeleton = ({
    width = '100%',
    height = 20,
    borderRadius = 8,
    className = '',
    style,
}: SkeletonProps) => {
    const animatedValue = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 0.7,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: Platform.OS !== 'web',
                }),
                Animated.timing(animatedValue, {
                    toValue: 0.3,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: Platform.OS !== 'web',
                }),
            ])
        );

        pulse.start();

        return () => pulse.stop();
    }, [animatedValue]);

    return (
        <Animated.View
            className={`bg-gray-200 ${className}`}
            style={[
                {
                    width: width as any,
                    height: height as any,
                    borderRadius,
                    opacity: animatedValue,
                },
                style,
            ]}
        />
    );
};

export default Skeleton;
