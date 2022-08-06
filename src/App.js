import { NativeBaseProvider } from 'native-base';
import React, { useEffect } from 'react';
import SplashScreen from 'react-native-splash-screen';

import AppWrapper from './components/AppWrapper';
import { getTheme } from './lib/style';
import Router from './router/Router';
import { useStore } from './store/store';

function App() {
  const theme = getTheme();
  const getMasterPassword = useStore(state => state.getMasterPassword);

  useEffect(() => {
    SplashScreen.hide();
    getMasterPassword();
  }, []);

  return (
    <NativeBaseProvider theme={theme}>
      <AppWrapper>
        <Router />
      </AppWrapper>
    </NativeBaseProvider>
  );
}

export default App;
