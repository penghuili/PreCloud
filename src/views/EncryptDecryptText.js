import { Box, Button, HStack } from 'native-base';
import React, { useState } from 'react';

import ActivePasswordAlert from '../components/ActivePasswordAlert';
import AppBar from '../components/AppBar';
import ContentWrapper from '../components/ContentWrapper';
import EncryptDecryptPlainText from '../components/EncryptDecryptPlainText';
import EncryptDecryptRichText from '../components/EncryptDecryptRichText';
import PasswordAlert from '../components/PasswordAlert';
import ScreenWrapper from '../components/ScreenWrapper';

const tabs = {
  plainText: 'plainText',
  richText: 'richText',
};

function EncryptDecryptText({ navigation }) {
  const [activeTab, setActiveTab] = useState(tabs.plainText);

  return (
    <ScreenWrapper>
      <AppBar title="Encrypt & decrypt text" />
      <ContentWrapper hasPX={false}>
        <Box px={4} w="full">
          <PasswordAlert navigate={navigation.navigate} />
          <ActivePasswordAlert navigate={navigation.navigate} />
        </Box>

        <HStack justifyContent="center" my="4">
          <Button.Group isAttached size="sm">
            <Button
              variant={activeTab === tabs.plainText ? 'solid' : 'outline'}
              onPress={() => setActiveTab(tabs.plainText)}
            >
              Plain text
            </Button>
            <Button
              variant={activeTab === tabs.richText ? 'solid' : 'outline'}
              onPress={() => setActiveTab(tabs.richText)}
            >
              Rich text
            </Button>
          </Button.Group>
        </HStack>

        {activeTab === tabs.plainText ? (
          <EncryptDecryptPlainText />
        ) : (
          <EncryptDecryptRichText navigation={navigation} />
        )}
      </ContentWrapper>
    </ScreenWrapper>
  );
}

export default EncryptDecryptText;
