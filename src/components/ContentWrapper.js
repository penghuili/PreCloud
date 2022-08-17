import { Box, KeyboardAvoidingView, ScrollView } from 'native-base';
import React from 'react';

function ContentWrapper({ children }) {
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView px={4} py={4} keyboardShouldPersistTaps="handled">
        {children}
        <Box h="24" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default ContentWrapper;
