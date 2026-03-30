/**
 * Unified web shim for native-only modules.
 * This is aliased in webpack.config.js for:
 * - react-native-html-to-pdf
 * - react-native-print
 * - react-native-blob-util
 */

const DummyImplementation = {
    // blob-util properties
    base64: {
        encode: (input) => btoa(input),
        decode: (input) => atob(input),
    },
    fs: {
        dirs: {
            DownloadDir: '',
            DocumentDir: '',
            CacheDir: '',
        },
        writeFile: async () => { },
        cp: async () => { },
    },
    android: {
        addCompleteDownload: () => { },
    },
    // html-to-pdf properties
    convert: async () => ({ filePath: '' }),
    // print properties
    print: async () => { },
    selectPrinter: async () => ({ name: 'Web', url: '' }),
};

// Export as both default and named to handle different import styles
export const RNHTMLtoPDF = DummyImplementation;
export const RNPrint = DummyImplementation;
export const ReactNativeBlobUtil = DummyImplementation;

export default DummyImplementation;
