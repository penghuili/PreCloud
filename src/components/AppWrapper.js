import { StatusBar } from 'native-base';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import useColors from '../hooks/useColors';

function AppWrapper({ children }) {
  const colors = useColors();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.primary }}>
      <StatusBar backgroundColor={colors.primary} barStyle="dark-content" />
      {children}
    </SafeAreaView>
  );
}

export default AppWrapper;
