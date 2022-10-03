import { Box, StatusBar } from 'native-base';
import React from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import useColors from '../hooks/useColors';

function ScreenWrapper({ children }) {
  const colors = useColors();
  const { top } = useSafeAreaInsets();

  return (
    <>
      <Box h={top} bgColor={colors.primary} />
      <SafeAreaView style={{flex: 1}} edges={['left', 'right', 'bottom']}>
        <StatusBar backgroundColor={colors.primary} barStyle="dark-content" />
        {children}
      </SafeAreaView>
    </>
  );
}

export default ScreenWrapper;
