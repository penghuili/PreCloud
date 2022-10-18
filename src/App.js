import { NavigationContainer } from '@react-navigation/native';
import { NativeBaseProvider } from 'native-base';
import React, { useEffect } from 'react';
import SplashScreen from 'react-native-splash-screen';
import Toast from 'react-native-toast-message';
import DonateBanner from './components/DonateBanner';
import ReceiveSharingIntent from 'react-native-receive-sharing-intent';

import { getTheme } from './lib/style';
import { navigationRef } from './router/navigationRef';
import Router from './router/Router';
import { useStore } from './store/store';

const nodejs = require('nodejs-mobile-react-native');

function App() {
  const theme = getTheme();
  const getPasswords = useStore(state => state.getPasswords);

  useEffect(() => {
    nodejs.start('main.js');
    SplashScreen.hide();
    getPasswords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // To get All Recived Urls
    ReceiveSharingIntent.getReceivedFiles(
      files => {
        console.log(files);
      },
      error => {
        console.log('share file', error);
      },
      'com.precloud'
    );

    return ReceiveSharingIntent.clearReceivedFiles;
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <NativeBaseProvider theme={theme}>
        <Router />

        <Toast />
        <DonateBanner />
      </NativeBaseProvider>
    </NavigationContainer>
  );
}

export default App;
