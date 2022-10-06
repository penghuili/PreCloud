import { Box, KeyboardAvoidingView, ScrollView } from 'native-base';
import React from 'react';

function ContentWrapper({ children, hasPX = true }) {
  return (
    <KeyboardAvoidingView>
      <ScrollView px={hasPX ? 2 : 0} py={4} keyboardShouldPersistTaps="handled" h="full">
        {children}
        <Box h="24" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default ContentWrapper;
