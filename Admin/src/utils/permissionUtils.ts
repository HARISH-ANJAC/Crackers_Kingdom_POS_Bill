import { PermissionsAndroid, Platform, Alert, Linking } from 'react-native';

/**
 * Permission Utilities for Android
 * Handles professional permission flows for media uploads, file downloads, and CSV imports.
 * Designed specifically for Android to ensure perfect compliance with API Level 33+.
 */

export type PermissionType = 'upload' | 'download' | 'csv_import';

class PermissionUtils {
    /**
     * Professional wrapper to request permissions before performing an action.
     * @param type - 'upload' (Gallery), 'download' (Storage), or 'csv_import'
     * @param onGranted - Callback to execute if permission is granted
     */
    async withPermission(type: PermissionType, onGranted: () => void | Promise<void>) {
        if (Platform.OS !== 'android') {
            return onGranted();
        }

        const isGranted = await this.requestAndroidPermission(type);
        if (isGranted) {
            return onGranted();
        }
    }

    /**
     * Request all required permissions at once (used for first-time install in SplashScreen)
     * @returns boolean - true if the essential permissions are handled
     */
    async requestInitialPermissions(): Promise<boolean> {
        if (Platform.OS !== 'android') return true;

        const apiLevel = Platform.Version as number;
        
        try {
            if (apiLevel >= 33) {
                const permissions = [
                    PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
                    PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
                    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS, // Professional addition
                ];

                const results = await PermissionsAndroid.requestMultiple(permissions);
                return results[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES] === PermissionsAndroid.RESULTS.GRANTED;
            } else {
                const permissions = [
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                ];

                const results = await PermissionsAndroid.requestMultiple(permissions);
                return results[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] === PermissionsAndroid.RESULTS.GRANTED;
            }
        } catch (err) {
            console.warn('Initial Permission Error:', err);
            return false;
        }
    }

    /**
     * Request permissions based on the required action
     * @returns boolean - true if granted, false otherwise
     */
    private async requestAndroidPermission(type: PermissionType): Promise<boolean> {
        try {
            if (type === 'upload' || type === 'csv_import') {
                return await this.handleMediaAndFilePermissions(type);
            } else if (type === 'download') {
                return await this.handleDownloadPermissions();
            }
            return false;
        } catch (err) {
            console.warn('Permission request error:', err);
            return false;
        }
    }

    /**
     * Specifically handles Upload permissions (Images/Videos/CSV)
     * Considers Android 13 (API 33) media permission changes
     */
    private async handleMediaAndFilePermissions(type: PermissionType): Promise<boolean> {
        const apiLevel = Platform.Version as number;
        const isCSV = type === 'csv_import';

        // Android 13 (API 33) and above uses granular permissions
        if (apiLevel >= 33) {
            const permissions = [
                PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
                PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
            ];

            const results = await PermissionsAndroid.requestMultiple(permissions);

            const isGranted =
                results[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES] === PermissionsAndroid.RESULTS.GRANTED ||
                results[PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO] === PermissionsAndroid.RESULTS.GRANTED;

            if (!isGranted) {
                const status = results[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES];
                if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
                    this.showSettingsAlert(isCSV ? 'File Import' : 'Upload');
                } else {
                    this.showPermissionAlert(
                        isCSV ? 'File Access Required' : 'Gallery Access',
                        isCSV 
                            ? 'We need access to your files to allow you to import CSV data safely.'
                            : 'We need access to your photos and videos to allow you to upload them to the platform.'
                    );
                }
            }
            return isGranted;
        }

        // Android 12 and below use standard storage permission
        else {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                {
                    title: isCSV ? 'File Access Required' : 'Gallery Access Required',
                    message: isCSV 
                        ? 'Crackers Shop needs access to your storage to select CSV files for import.'
                        : 'Crackers Shop needs access to your storage to select images and videos for upload.',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'Allow',
                }
            );

            if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
                this.showSettingsAlert(isCSV ? 'File Import' : 'Upload');
            }

            return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
    }

    /**
     * Specifically handles Download/Saving permissions
     */
    private async handleDownloadPermissions(): Promise<boolean> {
        const apiLevel = Platform.Version as number;

        // On Android 13+, WRITE_EXTERNAL_STORAGE is deprecated and not needed for Downloads folder via DownloadManager
        if (apiLevel >= 33) {
            return true;
        }

        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            {
                title: 'Storage Access Required',
                message: 'Storage permission is needed to save downloaded reports and files to your device.',
                buttonNeutral: 'Ask Me Later',
                buttonNegative: 'Cancel',
                buttonPositive: 'Allow',
            }
        );

        if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
            this.showSettingsAlert('Download');
        } else if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            this.showPermissionAlert(
                'Storage Access',
                'Downloading is disabled because storage access was denied.'
            );
        }

        return granted === PermissionsAndroid.RESULTS.GRANTED;
    }

    private showPermissionAlert(title: string, message: string) {
        Alert.alert(
            title,
            message,
            [{ text: 'Understand', style: 'default' }]
        );
    }

    private showSettingsAlert(type: string) {
        Alert.alert(
            'Permissions Required',
            `You have previously denied ${type.toLowerCase()} permissions. Please enable them in system settings to use this feature.`,
            [
                { text: 'Not Now', style: 'cancel' },
                { text: 'Open Settings', onPress: () => Linking.openSettings() }
            ]
        );
    }

    /**
     * Check current permission status without prompting
     */
    async checkPermission(type: PermissionType): Promise<boolean> {
        if (Platform.OS !== 'android') return true;
        const apiLevel = Platform.Version as number;

        if (type === 'upload' || type === 'csv_import') {
            if (apiLevel >= 33) {
                const hasImages = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES);
                const hasVideos = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO);
                return hasImages || hasVideos;
            }
            return await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
        } else {
            if (apiLevel >= 33) return true;
            return await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
        }
    }
}

export const permissionUtils = new PermissionUtils();
