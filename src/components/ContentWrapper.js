import { Box, KeyboardAvoidingView, ScrollView } from 'native-base';
import React from 'react';

function ContentWrapper({ children, hasPX = true }) {
  return (
    <KeyboardAvoidingView>
      <ScrollView px={hasPX ? 4 : 0} py={4} keyboardShouldPersistTaps="handled">
        {children}
        <Box h="24" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default ContentWrapper;
