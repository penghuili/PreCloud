import { NativeBaseProvider } from 'native-base';
import React, { useEffect } from 'react';
import SplashScreen from 'react-native-splash-screen';

import AppWrapper from './components/AppWrapper';
import ShareMenu from './components/ShareMenu';
import { getTheme } from './lib/style';
import Router from './router/Router';
import { useStore } from './store/store';

const nodejs = require('nodejs-mobile-react-native');

function App() {
  const theme = getTheme();
  const getMasterPassword = useStore(state => state.getMasterPassword);

  useEffect(() => {
    nodejs.start('main.js');
    SplashScreen.hide();
    getMasterPassword();
  }, []);

  return (
    <NativeBaseProvider theme={theme}>
      <AppWrapper>
        <Router />
        <ShareMenu />
      </AppWrapper>
    </NativeBaseProvider>
  );
}

export default App;
