import { Box, KeyboardAvoidingView, ScrollView } from 'native-base';
import React from 'react';
import { isAndroid } from '../lib/device';

function ContentWrapper({ children }) {
  return (
    <KeyboardAvoidingView behavior={isAndroid() ? 'height' : 'padding'}>
      <ScrollView px={4} py={4} keyboardShouldPersistTaps="handled">
        {children}
        <Box h="24" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default ContentWrapper;
