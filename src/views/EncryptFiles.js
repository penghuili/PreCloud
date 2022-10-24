import React from 'react';

import AppBar from '../components/AppBar';
import ContentWrapper from '../components/ContentWrapper';
import RootFolders from '../components/RootFolders';
import PasswordAlert from '../components/PasswordAlert';
import ScreenWrapper from '../components/ScreenWrapper';

function EncryptFiles({ navigation }) {
  return (
    <ScreenWrapper>
      <AppBar title="Encrypt files" />
      <ContentWrapper>
        <PasswordAlert navigate={navigation.navigate} />

        <RootFolders navigation={navigation} />
      </ContentWrapper>
    </ScreenWrapper>
  );
}

export default EncryptFiles;
