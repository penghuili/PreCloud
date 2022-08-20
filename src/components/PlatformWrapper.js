import { Platform } from 'react-native';
import { platforms } from '../lib/constants';

function PlatformWrapper({ children, for: forPlatform }) {
  if (
    (Platform.OS === platforms.android && forPlatform === platforms.android) ||
    (Platform.OS === platforms.ios && forPlatform === platforms.ios)
  ) {
    return children;
  }

  return null;
}

export default PlatformWrapper;
