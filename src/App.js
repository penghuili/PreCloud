// react-native-fast-openpgp
import 'fast-text-encoding';

import { NavigationContainer } from '@react-navigation/native';
import { NativeBaseProvider } from 'native-base';
import React, { useEffect } from 'react';
import { withIAPContext } from 'react-native-iap';
import SplashScreen from 'react-native-splash-screen';
import Toast from 'react-native-toast-message';

import DonateBanner from './components/DonateBanner';
import useInAppPurchase from './hooks/useInAppPurchase';
import { migrateNotesToFolders } from './lib/files/note';
import { getTheme } from './lib/style';
import { navigationRef } from './router/navigationRef';
import Router from './router/Router';
import { useStore } from './store/store';

function App() {
  const theme = getTheme();
  useInAppPurchase();

  const getPasswords = useStore(state => state.getPasswords);
  const loadRootFolders = useStore(state => state.loadRootFolders);

  useEffect(() => {
    SplashScreen.hide();
    getPasswords();
    migrateNotesToFolders().then(() => {
      loadRootFolders();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

export default withIAPContext(App);
