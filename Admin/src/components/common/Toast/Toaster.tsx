import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import {
  Animated,
  Text,
  View,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  LayoutChangeEvent,
} from 'react-native';
import { Toast, ToastPosition } from './types';
import { dismiss } from './ToastStore';

// ─── Constants ────────────────────────────────────────────────────────────────

const SAFE_AREA_TOP = Platform.OS === 'android' ? 44 : 50;
const SAFE_AREA_BOTTOM = Platform.OS === 'android' ? 24 : 40;
const GAP = 8; // gap between stacked toasts (px)

// ─── Icons ────────────────────────────────────────────────────────────────────

const SuccessIcon = () => (
  <View style={styles.iconWrapper}>
    <View style={[styles.iconCircle, { backgroundColor: '#D1FAE5' }]}>
      <Text style={[styles.iconEmoji, { color: '#059669' }]}>✓</Text>
    </View>
  </View>
);

const ErrorIcon = () => (
  <View style={styles.iconWrapper}>
    <View style={[styles.iconCircle, { backgroundColor: '#FEE2E2' }]}>
      <Text style={[styles.iconEmoji, { color: '#DC2626' }]}>✕</Text>
    </View>
  </View>
);

const WarningIcon = () => (
  <View style={styles.iconWrapper}>
    <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
      <Text style={[styles.iconEmoji, { color: '#D97706' }]}>!</Text>
    </View>
  </View>
);

const InfoIcon = () => (
  <View style={styles.iconWrapper}>
    <View style={[styles.iconCircle, { backgroundColor: '#DBEAFE' }]}>
      <Text style={[styles.iconEmoji, { color: '#2563EB' }]}>i</Text>
    </View>
  </View>
);

const LoadingIcon = () => (
  <View style={styles.iconWrapper}>
    <ActivityIndicator size="small" color={COLORS.primary} />
  </View>
);

function getIcon(toast: Toast) {
  if (toast.icon) return <View style={styles.iconWrapper}>{toast.icon as any}</View>;
  switch (toast.type) {
    case 'success': return <SuccessIcon />;
    case 'error': return <ErrorIcon />;
    case 'warning': return <WarningIcon />;
    case 'info': return <InfoIcon />;
    case 'loading': return <LoadingIcon />;
    default: return null;
  }
}

// ─── Toast accent bar color ───────────────────────────────────────────────────

function getAccentColor(type: Toast['type']): string {
  switch (type) {
    case 'success': return '#10B981';
    case 'error': return '#EF4444';
    case 'warning': return '#F59E0B';
    case 'info': return '#3B82F6';
    case 'loading': return COLORS.primary;
    default: return COLORS.primary;
  }
}

// ─── Single Toast Item ────────────────────────────────────────────────────────

interface ToastItemProps {
  toast: Toast;
  offset: number; // vertical offset from container edge
  isTop: boolean;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, offset, isTop }) => {
  const translateY = useRef(new Animated.Value(isTop ? -80 : 80)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;

  // Enter animation
  useEffect(() => {
    if (toast.visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          damping: 18,
          stiffness: 220,
          mass: 0.8,
          useNativeDriver: true,
        }),
        Animated.spring(opacity, {
          toValue: 1,
          damping: 18,
          stiffness: 220,
          mass: 0.8,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          damping: 18,
          stiffness: 220,
          mass: 0.8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Exit animation
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: isTop ? -20 : 20,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.9,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [toast.visible]);

  const accentColor = getAccentColor(toast.type);
  const icon = getIcon(toast);

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          opacity,
          transform: [{ translateY }, { scale }],
          [isTop ? 'top' : 'bottom']: offset,
        },
        toast.style,
      ]}
    >
      {/* Left accent bar */}
      <View style={[styles.accentBar, { backgroundColor: accentColor }]} />

      {/* Content */}
      <View style={styles.toastContent}>
        {icon && <View style={styles.iconArea}>{icon}</View>}
        <View style={styles.messageArea}>
          <Text style={styles.messageText} numberOfLines={3}>
            {typeof toast.message === 'string'
              ? toast.message
              : toast.message as any}
          </Text>
        </View>
        {/* Close button */}
        <TouchableOpacity
          onPress={() => dismiss(toast.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.closeBtn}
          accessibilityLabel="Dismiss toast"
        >
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Progress bar (only for finite durations) */}
      {toast.duration !== Infinity && toast.visible && (
        <ProgressBar duration={toast.duration} color={accentColor} />
      )}
    </Animated.View>
  );
};

// ─── Progress Bar ─────────────────────────────────────────────────────────────

const ProgressBar: React.FC<{ duration: number; color: string }> = ({
  duration,
  color,
}) => {
  const width = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(width, {
      toValue: 0,
      duration: duration,
      useNativeDriver: false,
    }).start();
  }, []);

  return (
    <View style={styles.progressTrack}>
      <Animated.View
        style={[
          styles.progressBar,
          {
            backgroundColor: color,
            flex: width,
          },
        ]}
      />
    </View>
  );
};

// ─── Toast Group by Position ──────────────────────────────────────────────────

interface GroupProps {
  toasts: Toast[];
  position: ToastPosition;
}

const ToastGroup: React.FC<GroupProps> = ({ toasts, position }) => {
  const isTop = position.startsWith('top');
  const { width } = Dimensions.get('window');

  // Sort: newest on top for top positions, newest on bottom for bottom
  const sorted = isTop ? [...toasts].reverse() : [...toasts];

  // Each toast is absolutely positioned; we compute cumulative offsets
  const safeArea = isTop ? SAFE_AREA_TOP : SAFE_AREA_BOTTOM;
  const TOAST_HEIGHT = 64; // estimated fallback height

  // Horizontal alignment
  let horizontal: object = { left: 16, right: 16 }; // center
  if (position.endsWith('left')) horizontal = { left: 16, right: undefined, maxWidth: 340 };
  if (position.endsWith('right')) horizontal = { right: 16, left: undefined, maxWidth: 340 };

  return (
    <>
      {sorted.map((t, idx) => {
        const offset = safeArea + idx * (TOAST_HEIGHT + GAP);
        return (
          <ToastItem
            key={t.id}
            toast={t}
            offset={offset}
            isTop={isTop}
          />
        );
      })}
    </>
  );
};

// ─── Toaster (root container) ─────────────────────────────────────────────────

export interface ToasterProps {
  position?: ToastPosition;
  containerStyle?: object;
}

import { subscribe } from './ToastStore';
import { COLORS } from '../../../Constants/Colors';

const Toaster: React.FC<ToasterProps> = ({
  position: defaultPosition = 'top-center',
  containerStyle,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    return subscribe(setToasts);
  }, []);

  // Group by position
  const groups = toasts.reduce<Record<ToastPosition, Toast[]>>(
    (acc, t) => {
      const pos = t.position;
      if (!acc[pos]) acc[pos] = [];
      acc[pos].push(t);
      return acc;
    },
    {} as Record<ToastPosition, Toast[]>,
  );

  const { width, height } = Dimensions.get('window');

  return (
    <View
      style={[
        StyleSheet.absoluteFillObject,
        styles.root,
        containerStyle,
      ]}
      pointerEvents="box-none"
    >
      {(Object.entries(groups) as [ToastPosition, Toast[]][]).map(
        ([position, groupToasts]) => (
          <ToastGroup key={position} toasts={groupToasts} position={position} />
        ),
      )}
    </View>
  );
};

export default Toaster;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    zIndex: 99999,
    elevation: 99999,
    pointerEvents: 'box-none',
  } as any,
  toastContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    maxWidth: 420,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    ...Platform.select({
      android: {
        elevation: 12,
      },
      ios: {},
      web: {
        boxShadow:
          '0 4px 24px rgba(0,0,0,0.13), 0 1.5px 6px rgba(0,0,0,0.08)',
      },
    }),
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
  },
  accentBar: {
    width: 4,
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingLeft: 16,
    paddingRight: 10,
    minHeight: 56,
  },
  iconArea: {
    marginRight: 10,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 16,
  },
  messageArea: {
    flex: 1,
    justifyContent: 'center',
  },
  messageText: {
    fontSize: 13.5,
    fontWeight: '500',
    color: '#1F2937',
    lineHeight: 20,
    letterSpacing: -0.1,
  },
  closeBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
    borderRadius: 14,
  },
  closeText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '700',
  },
  progressTrack: {
    height: 3,
    backgroundColor: '#F3F4F6',
    flexDirection: 'row',
  },
  progressBar: {
    height: 3,
    opacity: 0.85,
  },
});
