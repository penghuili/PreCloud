import { AppRegistry, LogBox } from 'react-native';

import App from './src/App';
import { name as appName } from './app.json';

LogBox.ignoreLogs(['new NativeEventEmitter']); 

AppRegistry.registerComponent(appName, () => App);
