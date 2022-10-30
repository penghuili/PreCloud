import React from 'react';

import AppBar from '../components/AppBar';
import ContentWrapper from '../components/ContentWrapper';
import PasswordAlert from '../components/PasswordAlert';
import RootFolders from '../components/RootFolders';
import ScreenWrapper from '../components/ScreenWrapper';
import { useStore } from '../store/store';

function EncryptFiles({ navigation }) {
  const rootFolders = useStore(state => state.rootFolders);

  return (
    <ScreenWrapper>
      <AppBar title="Encrypt files" />
      <ContentWrapper>
        <PasswordAlert navigate={navigation.navigate} />

        <RootFolders navigation={navigation} rootFolders={rootFolders} />
      </ContentWrapper>
    </ScreenWrapper>
  );
}

export default EncryptFiles;
