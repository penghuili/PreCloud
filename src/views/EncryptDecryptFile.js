import { Box, Divider, VStack } from 'native-base';
import React from 'react';

import ActivePasswordAlert from '../components/ActivePasswordAlert';
import AppBar from '../components/AppBar';
import ScreenWrapper from '../components/ScreenWrapper';
import ContentWrapper from '../components/ContentWrapper';
import DecryptFile from '../components/DecryptFile';
import EncryptFile from '../components/EncryptFile';
import PasswordAlert from '../components/PasswordAlert';

function EncryptDecryptFile({ navigation }) {
  return (
    <ScreenWrapper>
      <AppBar title="Encrypt files" />
      <ContentWrapper>
        <PasswordAlert navigate={navigation.navigate} />
        <ActivePasswordAlert navigate={navigation.navigate} />
        <VStack space="sm" alignItems="center">
          <EncryptFile />

          <Divider my={8} />

          <DecryptFile />

          <Box h="8" />
        </VStack>
      </ContentWrapper>
    </ScreenWrapper>
  );
}

export default EncryptDecryptFile;
