import React from 'react';

import ActivePasswordAlert from '../components/ActivePasswordAlert';
import AppBar from '../components/AppBar';
import ContentWrapper from '../components/ContentWrapper';
import Notebooks from '../components/Notebooks';
import PasswordAlert from '../components/PasswordAlert';
import ScreenWrapper from '../components/ScreenWrapper';

function EncryptDecryptText({ navigation }) {
  return (
    <ScreenWrapper>
      <AppBar title="Encrypt notes" />
      <ContentWrapper>
        <PasswordAlert navigate={navigation.navigate} />
        <ActivePasswordAlert navigate={navigation.navigate} />

        <Notebooks navigation={navigation} />
      </ContentWrapper>
    </ScreenWrapper>
  );
}

export default EncryptDecryptText;
