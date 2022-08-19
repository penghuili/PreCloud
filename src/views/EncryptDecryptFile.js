import { Divider, VStack } from 'native-base';
import React from 'react';

import AppBar from '../components/AppBar';
import ContentWrapper from '../components/ContentWrapper';
import DecryptFile from '../components/DecryptFile';
import EncryptFile from '../components/EncryptFile';
import PasswordAlert from '../components/PasswordAlert';

function EncryptDecryptFile({ jumpTo }) {
  return (
    <>
      <AppBar title="Encrypt & decrypt file" />
      <ContentWrapper>
        <VStack space="sm" alignItems="center">
          <PasswordAlert navigate={jumpTo} />

          <EncryptFile />

          <Divider my={8} />

          <DecryptFile />
        </VStack>
      </ContentWrapper>
    </>
  );
}

export default EncryptDecryptFile;
