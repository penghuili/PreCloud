import { Box, KeyboardAvoidingView, ScrollView } from 'native-base';
import React from 'react';
import { isAndroid } from '../lib/device';

function ContentWrapper({ children, hasPX = true }) {
  return (
    <KeyboardAvoidingView behavior={isAndroid() ? 'height' : 'padding'}>
      <ScrollView px={hasPX ? 4 : 0} py={4} keyboardShouldPersistTaps="handled">
        {children}
        <Box h="24" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default ContentWrapper;
