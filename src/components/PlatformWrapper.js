import { Platform } from 'react-native';
import { platforms } from '../lib/constants';

function PlatformWrapper({ children, platform }) {
  if (
    (Platform.OS === platforms.android && platform === platforms.android) ||
    (Platform.OS === platforms.ios && platform === platforms.ios)
  ) {
    return children;
  }

  return null;
}

export default PlatformWrapper;
