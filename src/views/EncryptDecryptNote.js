import { Alert, Text } from 'native-base';
import React from 'react';

import ActivePasswordAlert from '../components/ActivePasswordAlert';
import AppBar from '../components/AppBar';
import ContentWrapper from '../components/ContentWrapper';
import Notebooks from '../components/Notebooks';
import PasswordAlert from '../components/PasswordAlert';
import ScreenWrapper from '../components/ScreenWrapper';
import { routeNames } from '../router/routes';

function EncryptDecryptText({ navigation }) {
  return (
    <ScreenWrapper>
      <AppBar title="Encrypt notes" />
      <ContentWrapper>
        <PasswordAlert navigate={navigation.navigate} />
        <ActivePasswordAlert navigate={navigation.navigate} />

        <Notebooks navigation={navigation} />

        <Alert w="100%" status="info" mt="10">
          <Text>
            Plain text encryption is moved to{' '}
            <Text underline onPress={() => navigation.navigate(routeNames.settings)}>
              Settings
            </Text>
            .
          </Text>
        </Alert>
      </ContentWrapper>
    </ScreenWrapper>
  );
}

export default EncryptDecryptText;