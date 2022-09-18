import { Box, Divider, VStack } from 'native-base';
import React from 'react';

import ActivePasswordAlert from '../components/ActivePasswordAlert';
import AppBar from '../components/AppBar';
import ContentWrapper from '../components/ContentWrapper';
import DecryptFile from '../components/DecryptFile';
import EncryptFile from '../components/EncryptFile';
import PasswordAlert from '../components/PasswordAlert';

function EncryptDecryptFile({ currentRoute, jumpTo }) {
  return (
    <>
      <AppBar title="Encrypt & decrypt files" />
      <ContentWrapper>
        <VStack space="sm" alignItems="center">
          <PasswordAlert navigate={jumpTo} />
          <ActivePasswordAlert navigate={jumpTo} />

          <EncryptFile currentRoute={currentRoute} />

          <Divider my={8} />

          <DecryptFile currentRoute={currentRoute} />

          <Box h="8" />
        </VStack>
      </ContentWrapper>
    </>
  );
}

export default EncryptDecryptFile;
