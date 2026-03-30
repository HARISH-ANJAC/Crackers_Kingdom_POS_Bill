// src/screens/PDFViewer.tsx
import {
    View,
    Text,
    StatusBar,
    TouchableOpacity,
    Platform,
    ActivityIndicator,
    useWindowDimensions,
    Alert,
} from 'react-native';
import { toast } from '../components/common/Toast';
import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, RefreshCcw, Download, ExternalLink } from 'lucide-react-native';
import { WebView } from 'react-native-webview';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { COLORS } from '../Constants/Colors';
import { BACKEND_API_URL } from '../Constants';
import { permissionUtils } from '../utils/permissionUtils';

const PDFViewer = ({ navigation, route }: any) => {
    const { invoiceNumber, orderNumber, type = 'invoice' } = route.params || {};
    const identifier = type === 'order' ? orderNumber : invoiceNumber;

    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const isWeb = Platform.OS === 'web';

    const encryptedIdentifier = encodeURIComponent(identifier ? identifier.split('').map((c: string) => c.charCodeAt(0).toString(16).padStart(2, '0')).join('') : '');
    const endpoint = type === 'order' ? 'orders' : 'invoices';
    const pdfUrl = `${BACKEND_API_URL}/${endpoint}/pdf/${encryptedIdentifier}`;

    const [isLoading, setIsLoading] = useState(true);
    const [key, setKey] = useState(0); // For refresh
    const [webBlobUrl, setWebBlobUrl] = useState<string | null>(null);

    // Web-specific: Fetch PDF as blob via GET to hide invoice number from URL
    React.useEffect(() => {
        if (isWeb && identifier) {
            const fetchPdf = async () => {
                try {
                    const response = await fetch(pdfUrl, {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' },
                    });
                    if (!response.ok) throw new Error("Server responded with error");
                    const blob = await response.blob();
                    const url = URL.createObjectURL(blob);
                    setWebBlobUrl(url);
                    setIsLoading(false);
                } catch (error) {
                    console.error("PDF Fetch Error:", error);
                    setIsLoading(false);
                }
            };
            fetchPdf();
        }
        return () => {
            if (webBlobUrl) URL.revokeObjectURL(webBlobUrl);
        };
    }, [identifier, key]);

    const handleRefresh = () => {
        setKey(prev => prev + 1);
        setIsLoading(true);
    };

    const handleDownload = async () => {
        if (isWeb) {
            if (webBlobUrl) {
                const link = document.createElement('a');
                link.href = webBlobUrl;
                link.download = `${type === 'order' ? 'Order' : 'Invoice'}_${identifier}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                window.open(pdfUrl, '_blank');
            }
        } else {
            // Android professional download flow
            try {
                await permissionUtils.withPermission('download', async () => {
                    setIsLoading(true);

                    const { dirs } = ReactNativeBlobUtil.fs;
                    const fileName = `${type === 'order' ? 'Order' : 'Invoice'}_${identifier.replace(/[^a-zA-Z0-9-]/g, '_')}.pdf`;
                    const downloadPath = `${dirs.DownloadDir}/${fileName}`;

                    // Phase 1: Manual Fetch
                    const res = await ReactNativeBlobUtil
                        .config({
                            fileCache: true,
                            path: downloadPath,
                        })
                        .fetch('GET', pdfUrl, {
                            'Content-Type': 'application/json',
                        });

                    // Phase 2: Register with Android Download Manager
                    await ReactNativeBlobUtil.android.addCompleteDownload({
                        title: fileName,
                        description: `${type === 'order' ? 'Order' : 'Invoice'} downloaded successfully`,
                        mime: 'application/pdf',
                        path: res.path(),
                        showNotification: true,
                    });

                    Alert.alert(
                        '✓ Success',
                        `${type === 'order' ? 'Order' : 'Invoice'} downloaded successfully to your Downloads folder.`,
                        [
                            { text: 'OK' },
                            {
                                text: 'Open File',
                                onPress: () => ReactNativeBlobUtil.android.actionViewIntent(res.path(), 'application/pdf')
                            }
                        ]
                    );
                });
            } catch (error) {
                console.error('Download error:', error);
                toast.error('Could not save the file. Please check your connection.');
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <View className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

            {/* Header */}
            <View
                className="flex-row items-center px-4 py-3 bg-white border-b border-gray-100 shadow-sm"
                style={{ paddingTop: Math.max(insets.top, 12) }}
            >
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="p-2 -ml-2 rounded-xl bg-gray-50 active:bg-gray-100"
                >
                    <ChevronLeft size={24} color="#1f2937" />
                </TouchableOpacity>

                <View className="ml-3 flex-1">
                    <Text className="text-xl font-black text-gray-800">
                        {type === 'order' ? 'Order' : 'Invoice'} View
                    </Text>
                    <Text className="text-xs text-primary font-bold">
                        {identifier}
                    </Text>
                </View>

                <View className="flex-row items-center gap-2">
                    <TouchableOpacity
                        onPress={handleRefresh}
                        className="p-2.5 bg-gray-50 rounded-xl"
                    >
                        <RefreshCcw size={20} color="#6b7280" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleDownload}
                        className="p-2.5 bg-primary/10 rounded-xl"
                    >
                        {isWeb ? <ExternalLink size={20} color={COLORS.primary} /> : <Download size={20} color={COLORS.primary} />}
                    </TouchableOpacity>
                </View>
            </View>

            {/* Content */}
            <View className="flex-1">
                {isLoading && (
                    <View className="absolute inset-0 z-10 items-center justify-center bg-white/80">
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text className="mt-4 text-gray-400 font-medium">Generating {type === 'order' ? 'Order' : 'Invoice'} PDF...</Text>
                        {isWeb && width < 768 && (
                            <Text className="mt-2 text-[10px] text-gray-400 text-center px-6 italic">
                                Large PDFs may take a few seconds to render on mobile browsers
                            </Text>
                        )}
                    </View>
                )}

                {Platform.OS === 'web' ? (
                    width < 768 ? (
                        <View className="flex-1">
                            {/* Mobile Web Fallback Info */}
                            <View className="bg-indigo-50 p-4 border-b border-indigo-100 flex-row items-center justify-between">
                                <View className="flex-1 mr-3">
                                    <Text className="text-[10px] text-indigo-700 font-bold leading-tight">
                                        Having trouble viewing? Swipe or use the native viewer.
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => {
                                        if (webBlobUrl) window.open(webBlobUrl, '_blank');
                                        else window.open(pdfUrl, '_blank');
                                    }}
                                    className="bg-indigo-600 px-4 py-2 rounded-xl active:bg-indigo-700 shadow-sm"
                                >
                                    <Text className="text-white text-[10px] font-black uppercase">Launch Native</Text>
                                </TouchableOpacity>
                            </View>

                            <iframe
                                key={key}
                                srcDoc={`
                                    <!DOCTYPE html>
                                    <html>
                                    <head>
                                        <meta charset="utf-8">
                                        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=3, user-scalable=yes">
                                        <title>PDF Viewer</title>
                                        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js"></script>
                                        <style>
                                            body { margin: 0; padding: 0; background-color: #f1f5f9; font-family: sans-serif; }
                                            #viewer-container { 
                                                width: 100%; 
                                                display: flex; 
                                                flex-direction: column; 
                                                align-items: center; 
                                                padding: 15px 0;
                                                min-height: 100vh;
                                            }
                                            canvas { 
                                                box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); 
                                                margin-bottom: 20px; 
                                                max-width: 95%; 
                                                border-radius: 12px;
                                                background-color: white;
                                            }
                                            .loader {
                                                position: fixed;
                                                top: 50%;
                                                left: 50%;
                                                transform: translate(-50%, -50%);
                                                text-align: center;
                                                color: #6366f1;
                                                background: white;
                                                padding: 25px;
                                                border-radius: 20px;
                                                box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
                                            }
                                        </style>
                                    </head>
                                    <body>
                                        <div id="viewer-container">
                                            <div id="loading-msg" class="loader">
                                                <div style="font-weight: 800; font-size: 16px;">Rendering Document...</div>
                                                <div style="font-size: 11px; margin-top: 8px; opacity: 0.7;">Optimizing pixels</div>
                                            </div>
                                        </div>
                                        <script>
                                            const url = '${webBlobUrl || pdfUrl}';
                                            const pdfjsLib = window['pdfjs-dist/build/pdf'];
                                            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

                                            async function loadPDF() {
                                                try {
                                                    const loadingTask = pdfjsLib.getDocument(url);
                                                    const pdf = await loadingTask.promise;
                                                    const container = document.getElementById('viewer-container');
                                                    
                                                    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                                                        const page = await pdf.getPage(pageNum);
                                                        const viewport = page.getViewport({ scale: 1 });
                                                        
                                                        // Accurate Mobile Scaling
                                                        const containerWidth = window.innerWidth * 0.95;
                                                        const scale = containerWidth / viewport.width;
                                                        const finalViewport = page.getViewport({ scale: scale * (window.devicePixelRatio || 1) });
                                                        
                                                        const canvas = document.createElement('canvas');
                                                        container.appendChild(canvas);
                                                        const context = canvas.getContext('2d');
                                                        
                                                        canvas.width = Math.floor(finalViewport.width);
                                                        canvas.height = Math.floor(finalViewport.height);
                                                        canvas.style.width = Math.floor(finalViewport.width / (window.devicePixelRatio || 1)) + 'px';
                                                        canvas.style.height = Math.floor(finalViewport.height / (window.devicePixelRatio || 1)) + 'px';
                                                        
                                                        await page.render({ canvasContext: context, viewport: finalViewport }).promise;
                                                        if (pageNum === 1) {
                                                            window.parent.postMessage('FIRST_PAGE_READY', '*');
                                                            document.getElementById('loading-msg').style.display = 'none';
                                                        }
                                                    }
                                                } catch (err) {
                                                    console.error('Mobile PDF Error:', err);
                                                    window.parent.postMessage('ERROR', '*');
                                                }
                                            }
                                            loadPDF();
                                        </script>
                                    </body>
                                    </html>
                                `}
                                style={{ width: '100%', height: '100%', border: 'none' }}
                                onLoad={() => {
                                    const handleMsg = (event: any) => {
                                        if (event.data === 'FIRST_PAGE_READY') {
                                            setIsLoading(false);
                                            window.removeEventListener('message', handleMsg);
                                        }
                                    };
                                    window.addEventListener('message', handleMsg);
                                }}
                            />
                        </View>
                    ) : (
                        <iframe
                            key={key}
                            src={webBlobUrl || ''}
                            style={{ width: '100%', height: '100%', border: 'none' }}
                            onLoad={() => setIsLoading(false)}
                        />
                    )
                ) : (
                    <WebView
                        key={key}
                        source={{
                            html: `
                            <!DOCTYPE html>
                            <html>
                            <head>
                                <meta charset="utf-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=3">
                                <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js"></script>
                                <style>
                                    body { margin: 0; padding: 0; background-color: #f8fafc; font-family: sans-serif; }
                                    #viewer-container { 
                                        width: 100%; 
                                        display: flex; 
                                        flex-direction: column; 
                                        align-items: center; 
                                        padding: 20px 0;
                                    }
                                    canvas { 
                                        box-shadow: 0 4px 15px rgba(0,0,0,0.1); 
                                        margin-bottom: 25px; 
                                        max-width: 95%; 
                                        border-radius: 4px;
                                        background-color: white;
                                    }
                                    .loader {
                                        position: fixed;
                                        top: 50%;
                                        left: 50%;
                                        transform: translate(-50%, -50%);
                                        text-align: center;
                                        color: #64748b;
                                    }
                                </style>
                            </head>
                            <body>
                                <div id="viewer-container">
                                    <div id="loading-msg" class="loader">
                                        <div style="font-weight: bold; font-size: 16px;">Rendering Preview...</div>
                                        <div style="font-size: 12px; margin-top: 8px;">Please wait a moment</div>
                                    </div>
                                </div>
                                <script>
                                    const url = '${pdfUrl}';
                                    const pdfjsLib = window['pdfjs-dist/build/pdf'];
                                    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

                                    async function loadPDF() {
                                        try {
                                            const response = await fetch(url, {
                                                method: 'GET',
                                                headers: { 'Content-Type': 'application/json' },
                                            });
                                            const data = await response.arrayBuffer();
                                            const loadingTask = pdfjsLib.getDocument({ data });
                                            
                                            loadingTask.promise.then(pdf => {
                                                const container = document.getElementById('viewer-container');
                                                const renderPage = (pageNum) => {
                                                    pdf.getPage(pageNum).then(page => {
                                                        const baseScale = (window.innerWidth * 0.95) / page.getViewport({ scale: 1 }).width;
                                                        const outputScale = Math.min(window.devicePixelRatio || 1, 2.2);
                                                        const viewport = page.getViewport({ scale: baseScale * outputScale });
                                                        const canvas = document.createElement('canvas');
                                                        container.appendChild(canvas);
                                                        const context = canvas.getContext('2d', { alpha: false });
                                                        
                                                        canvas.width = Math.floor(viewport.width);
                                                        canvas.height = Math.floor(viewport.height);
                                                        canvas.style.width = Math.floor(viewport.width / outputScale) + 'px';
                                                        canvas.style.height = Math.floor(viewport.height / outputScale) + 'px';
                                                        
                                                        requestAnimationFrame(() => {
                                                            page.render({ 
                                                                canvasContext: context, 
                                                                viewport: viewport 
                                                            }).promise.then(() => {
                                                                if (pageNum === 1) {
                                                                    window.ReactNativeWebView.postMessage('FIRST_PAGE_READY');
                                                                    document.getElementById('loading-msg').style.display = 'none';
                                                                }
                                                                
                                                                if (pageNum < pdf.numPages) {
                                                                    setTimeout(() => renderPage(pageNum + 1), 50);
                                                                }
                                                            });
                                                        });
                                                    });
                                                };

                                                renderPage(1);
                                            }).catch(err => {
                                                throw err;
                                            });
                                        } catch (err) {
                                            window.ReactNativeWebView.postMessage('ERROR');
                                            document.getElementById('loading-msg').innerHTML = 
                                                '<div style="color: #ef4444; font-weight: bold;">Failed to load PDF</div>' +
                                                '<div style="font-size: 12px; margin-top: 8px;">' + err.message + '</div>';
                                        }
                                    }

                                    loadPDF();
                                </script>
                            </body>
                            </html>
                            `
                        }}
                        style={{ flex: 1 }}
                        onLoadStart={() => setIsLoading(true)}
                        onMessage={(event) => {
                            if (event.nativeEvent.data === 'FIRST_PAGE_READY') {
                                setIsLoading(false);
                            }
                        }}
                        scalesPageToFit={true}
                        originWhitelist={['*']}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        allowFileAccess={true}
                        allowUniversalAccessFromFileURLs={true}
                        mixedContentMode="always"
                    />
                )}
            </View>
        </View>
    );
};

export default PDFViewer;
