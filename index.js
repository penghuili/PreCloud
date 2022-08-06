import { AppRegistry, LogBox } from 'react-native';

import App from './src/App';
import { name as appName } from './app.json';

LogBox.ignoreLogs([
  'new NativeEventEmitter',
  'When server rendering',
  'Failed prop type: Invalid prop `color`',
  'EventEmitter.removeListener'
]);

AppRegistry.registerComponent(appName, () => App);
