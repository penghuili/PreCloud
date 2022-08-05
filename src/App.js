import { extendTheme, NativeBaseProvider } from 'native-base';
import React, { useEffect } from 'react';
import SplashScreen from 'react-native-splash-screen';

import AppWrapper from './components/AppWrapper';
import Router from './router/Router';

// primary color: #051726

function App() {
  const theme = extendTheme({
    colors: {
      primary: {
        50: '#defef3',
        100: '#b9f4e0',
        200: '#90eccc',
        300: '#67e3b8',
        400: '#3edba4',
        500: '#24c18b',
        600: '#17966c',
        700: '#0b6b4c',
        800: '#00412d',
        900: '#00170c',
      },
    },
  });

  useEffect(() => {
    SplashScreen.hide();
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
