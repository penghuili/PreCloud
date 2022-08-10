import { Platform } from 'react-native';
import { appStoreLink } from './constants';

export function isAndroid() {
  return Platform.OS === 'android';
}

export function getStoreLink() {
  return isAndroid() ? appStoreLink.android : appStoreLink.ios;
}
