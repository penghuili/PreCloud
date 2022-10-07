import Toast from 'react-native-toast-message';

export function showToast(message, type = 'success') {
  Toast.show({
    type,
    text1: message,
    position: 'top',
    autoHide: true,
    visibilityTime: 4000,
    topOffset: 40,
    onPress: () => Toast.hide(),
  });
}
