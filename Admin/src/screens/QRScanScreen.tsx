import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    Alert,
    ActivityIndicator,
    PermissionsAndroid
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { COLORS } from '../Constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// Conditionally import Camera to prevent Web build issues
let Camera: any = null;
if (Platform.OS !== 'web') {
    Camera = require('react-native-camera-kit').Camera;
}

/* ─────────────────────────────────────────────────────
 * QRScanScreen
 * Works on:
 *   - Web  → html5-qrcode (camera in browser)
 *   - Android → react-native-camera-kit
 * ──────────────────────────────────────────────────── */
const QRScanScreen = ({ navigation, route }: any) => {
    const { onScan } = route.params || {};
    const insets = useSafeAreaInsets();
    const [isWebReady, setIsWebReady] = useState(false);
    const [hasPermission, setHasPermission] = useState(Platform.OS === 'web');

    useEffect(() => {
        if (Platform.OS === 'android') {
            requestCameraPermission();
        }
    }, []);

    const requestCameraPermission = async () => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.CAMERA,
                {
                    title: 'Camera Permission',
                    message: 'App needs camera permission to scan QR codes',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                },
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                setHasPermission(true);
            } else {
                setHasPermission(false);
                Alert.alert('Permission Denied', 'Camera permission is required to scan QR codes.');
            }
        } catch (err) {
            console.warn(err);
        }
    };

    /* ── Web: mount html5-qrcode scanner ── */
    useEffect(() => {
        if (Platform.OS !== 'web') return;

        let scanner: any = null;

        const mountScanner = async () => {
            try {
                // Use require for web-only library to avoid Metro resolution issues on native
                const { Html5QrcodeScanner } = require('html5-qrcode');
                scanner = new Html5QrcodeScanner('qr-reader', { fps: 10, qrbox: 250 }, false);
                scanner.render(
                    (decodedText: string) => {
                        scanner?.clear?.().catch(() => { });
                        onScan?.(decodedText);
                        navigation.goBack();
                    },
                    (_err: any) => { /* quiet scan errors */ }
                );
                setIsWebReady(true);
            } catch (e) {
                console.error('html5-qrcode failed to load:', e);
            }
        };

        mountScanner();

        return () => {
            try { scanner?.clear?.(); } catch (_) { }
        };
    }, []);

    const onReadCode = (event: any) => {
        if (event.nativeEvent.codeStringValue) {
            onScan?.(event.nativeEvent.codeStringValue);
            navigation.goBack();
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color={COLORS.text?.primary ?? '#333'} />
                </TouchableOpacity>
                <Text style={styles.title}>Scan QR / Barcode</Text>
            </View>

            {/* Web: camera scanner div */}
            {Platform.OS === 'web' && (
                <View style={{ flex: 1 }}>
                    <div id="qr-reader" style={{ width: '100%', height: '100%' }} />
                    {!isWebReady && (
                        <View style={styles.loading}>
                            <ActivityIndicator color={COLORS.primary} size="large" />
                            <Text style={styles.loadingText}>Starting camera…</Text>
                        </View>
                    )}
                </View>
            )}

            {/* Android / iOS: Camera Kit */}
            {Platform.OS !== 'web' && (
                <View style={{ flex: 1 }}>
                    {hasPermission ? (
                        <View style={{ flex: 1 }}>
                            <Camera
                                style={StyleSheet.absoluteFillObject}
                                scanBarcode={true}
                                onReadCode={onReadCode}
                                showFrame={false}
                            />
                            {/* Custom Square Overlay */}
                            <View style={styles.overlay}>
                                <View style={styles.unfocusedContainer} />
                                <View style={styles.middleContainer}>
                                    <View style={styles.unfocusedContainer} />
                                    <View style={styles.focusedContainer}>
                                        {/* Scanner corners */}
                                        <View style={[styles.corner, styles.cornerTL]} />
                                        <View style={[styles.corner, styles.cornerTR]} />
                                        <View style={[styles.corner, styles.cornerBL]} />
                                        <View style={[styles.corner, styles.cornerBR]} />
                                        {/* Scanner Line Animation could be added here */}
                                        <View style={styles.laserLine} />
                                    </View>
                                    <View style={styles.unfocusedContainer} />
                                </View>
                                <View style={styles.unfocusedContainer} />
                            </View>
                        </View>
                    ) : (
                        <View style={styles.loading}>
                            <Text style={styles.loadingText}>No camera permission granted.</Text>
                        </View>
                    )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    header: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
    },
    backBtn: { padding: 6, marginRight: 8, borderRadius: 10, backgroundColor: '#F8FAFC' },
    title: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
    loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
    loadingText: { color: '#64748b', marginTop: 8 },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
    },
    unfocusedContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    middleContainer: {
        flexDirection: 'row',
        height: 250,
    },
    focusedContainer: {
        width: 250,
        height: 250,
        backgroundColor: 'transparent',
    },
    corner: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderColor: COLORS.primary,
    },
    cornerTL: { top: -2, left: -2, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 16 },
    cornerTR: { top: -2, right: -2, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 16 },
    cornerBL: { bottom: -2, left: -2, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 16 },
    cornerBR: { bottom: -2, right: -2, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 16 },
    laserLine: {
        position: 'absolute',
        top: '50%',
        left: '5%',
        right: '5%',
        height: 2,
        backgroundColor: COLORS.primary,
        shadowColor: COLORS.primary,
        shadowOpacity: 0.8,
        shadowRadius: 5,
        elevation: 4,
    },
});

export default QRScanScreen;
