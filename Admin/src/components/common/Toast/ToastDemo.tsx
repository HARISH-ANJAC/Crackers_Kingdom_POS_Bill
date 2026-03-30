/**
 * ToastDemo.tsx
 * ---------------------
 * A demo screen to preview all react-hot-toast style toasts.
 * Import this into any screen or navigator during development.
 *
 * Usage:
 *   import ToastDemo from '../components/common/Toast/ToastDemo';
 */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { toast } from './index';
import { COLORS } from '../../../Constants/Colors';


interface ButtonProps {
  label: string;
  onPress: () => void;
  color?: string;
  textColor?: string;
}

const DemoButton: React.FC<ButtonProps> = ({
  label,
  onPress,
  color = COLORS.primary,
  textColor = '#fff',
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.82}
    style={[styles.btn, { backgroundColor: color }]}
  >
    <Text style={[styles.btnText, { color: textColor }]}>{label}</Text>
  </TouchableOpacity>
);

const ToastDemo: React.FC = () => {
  const handlePromise = () => {
    const fakeApi = new Promise<string>((resolve, reject) => {
      const ok = Math.random() > 0.4;
      setTimeout(() => (ok ? resolve('Saved!') : reject(new Error('Failed'))), 2000);
    });
    toast.promise(fakeApi, {
      loading: '⏳ Saving to server...',
      success: (data) => `✅ ${data}`,
      error: (err) => `❌ ${err.message}`,
    });
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>🔔 Toast</Text>
        </View>
        <Text style={styles.title}>React Hot Toast</Text>
        <Text style={styles.subtitle}>
          A clone of react-hot-toast for React Native {'&'} Web
        </Text>
      </View>

      {/* Section: Types */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Toast Types</Text>
        <View style={styles.grid}>
          <DemoButton
            label="✅ Success"
            color="#ECFDF5"
            textColor="#059669"
            onPress={() => toast.success('Order saved successfully!')}
          />
          <DemoButton
            label="❌ Error"
            color="#FEF2F2"
            textColor="#DC2626"
            onPress={() => toast.error('Something went wrong. Please try again.')}
          />
          <DemoButton
            label="⏳ Loading"
            color="#EEF2FF"
            textColor="#4F46E5"
            onPress={() => {
              const id = toast.loading('Processing your request...');
              setTimeout(() => {
                toast.success('Done!', { id });
              }, 3000);
            }}
          />
          <DemoButton
            label="ℹ️ Info"
            color="#EFF6FF"
            textColor="#2563EB"
            onPress={() => toast.info('App updated to version 2.1.0')}
          />
          <DemoButton
            label="⚠️ Warning"
            color="#FFFBEB"
            textColor="#D97706"
            onPress={() => toast.warning('Low stock: only 3 units left!')}
          />
          <DemoButton
            label="💬 Blank"
            color="#F9FAFB"
            textColor="#374151"
            onPress={() => toast('Hello! This is a blank toast.')}
          />
        </View>
      </View>

      {/* Section: Promise */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Promise Toast</Text>
        <Text style={styles.sectionHint}>
          Automatically transitions Loading → Success/Error
        </Text>
        <DemoButton
          label="🚀 Run Promise (60% success)"
          color={COLORS.primary}
          onPress={handlePromise}
        />
      </View>

      {/* Section: Positions */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Positions</Text>
        <View style={styles.grid}>
          {(
            [
              'top-left',
              'top-center',
              'top-right',
              'bottom-left',
              'bottom-center',
              'bottom-right',
            ] as const
          ).map((pos) => (
            <DemoButton
              key={pos}
              label={pos}
              color="#F3F4F6"
              textColor="#374151"
              onPress={() =>
                toast.info(`Position: ${pos}`, { position: pos, duration: 2500 })
              }
            />
          ))}
        </View>
      </View>

      {/* Section: Long message */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Long Message</Text>
        <DemoButton
          label="📄 Multi-line Toast"
          color="#F0FDF4"
          textColor="#16A34A"
          onPress={() =>
            toast.success(
              'Your invoice #INV-2024-001 has been generated and sent to customer@example.com',
              { duration: 5000 },
            )
          }
        />
      </View>

      {/* Section: Dismiss */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Dismiss</Text>
        <DemoButton
          label="🗑️ Dismiss All Toasts"
          color="#FEF2F2"
          textColor="#DC2626"
          onPress={() => toast.dismiss()}
        />
      </View>

      {/* Section: Stacked */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Stacked Toasts</Text>
        <DemoButton
          label="📚 Fire 3 Toasts"
          color="#EEF2FF"
          textColor="#4F46E5"
          onPress={() => {
            toast.success('First toast ✅');
            setTimeout(() => toast.error('Second toast ❌'), 300);
            setTimeout(() => toast.info('Third toast ℹ️'), 600);
          }}
        />
      </View>
    </ScrollView>
  );
};

export default ToastDemo;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 60,
    backgroundColor: '#F8FAFC',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 8,
  },
  headerBadge: {
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 12,
  },
  headerBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    ...Platform.select({
      android: { elevation: 2 },
      web: { boxShadow: '0 2px 8px rgba(0,0,0,0.06)' } as any,
    }),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  sectionHint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  btn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  btnText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
});
