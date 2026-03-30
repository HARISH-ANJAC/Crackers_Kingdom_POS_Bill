import { Linking } from 'react-native';

const openURLInBrowser = (url) => {
    Linking.openURL(url).catch((err) => console.error('An error occurred', err));
};

export default openURLInBrowser;
