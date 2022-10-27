import Toast from 'react-native-toast-message';
import { heights } from './constants';

export function showToast(message, type = 'success', durationInSeconds = 4) {
  Toast.show({
    type,
    text1: message,
    position: 'top',
    autoHide: true,
    visibilityTime: durationInSeconds * 1000,
    topOffset: heights.appBar / 2,
    onPress: () => Toast.hide(),
  });
}

export function hideToast() {
  Toast.hide();
}
