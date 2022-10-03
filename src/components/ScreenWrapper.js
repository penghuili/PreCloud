import { StatusBar } from 'native-base';
import React from 'react';
import { View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import useColors from '../hooks/useColors';

function ScreenWrapper({ children }) {
  const colors = useColors();
  const { top } = useSafeAreaInsets();
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.white, paddingBottom: 80 }}
      edges={['left', 'right', 'bottom']}
    >
      <View style={{ height: top, width: '100%', backgroundColor: colors.primary }} />
      <StatusBar backgroundColor={colors.primary} barStyle="dark-content" />
      {children}
    </SafeAreaView>
  );
}

export default ScreenWrapper;
