import Toast from 'react-native-toast-message';
import { heights } from './constants';

export function showToast(message, type = 'success') {
  Toast.show({
    type,
    text1: message,
    position: 'top',
    autoHide: true,
    visibilityTime: 4000,
    topOffset: heights.appBar / 2,
    onPress: () => Toast.hide(),
  });
}
