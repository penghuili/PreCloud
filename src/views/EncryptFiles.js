import React from 'react';

import AppBar from '../components/AppBar';
import ContentWrapper from '../components/ContentWrapper';
import Folders from '../components/Folders';
import PasswordAlert from '../components/PasswordAlert';
import ScreenWrapper from '../components/ScreenWrapper';

function EncryptFiles({ navigation }) {
  return (
    <ScreenWrapper>
      <AppBar title="Encrypt files" />
      <ContentWrapper>
        <PasswordAlert navigate={navigation.navigate} />

        <Folders navigation={navigation} />
      </ContentWrapper>
    </ScreenWrapper>
  );
}

export default EncryptFiles;
