import { Platform } from 'react-native';
import { platforms } from '../lib/constants';

function PlatformToggle({ children, for: forPlatform }) {
  if (
    (Platform.OS === platforms.android && forPlatform === platforms.android) ||
    (Platform.OS === platforms.ios && forPlatform === platforms.ios)
  ) {
    return children;
  }

  return null;
}

export default PlatformToggle;
