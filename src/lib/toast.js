import Toast from 'react-native-toast-message';

export function showToast(message, type = 'success') {
  Toast.show({
    type,
    text1: message,
    position: 'top',
    visibilityTime: 4000,
    autoHide: true,
    topOffset: 100,
    onPress: () => Toast.hide(),
  });
}
