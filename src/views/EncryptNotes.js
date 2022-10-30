import React from 'react';

import AppBar from '../components/AppBar';
import ContentWrapper from '../components/ContentWrapper';
import Notebooks from '../components/Notebooks';
import PasswordAlert from '../components/PasswordAlert';
import ScreenWrapper from '../components/ScreenWrapper';
import { useStore } from '../store/store';

function EncryptNotes({ navigation }) {
  const notebooks = useStore(state => state.notebooks);

  return (
    <ScreenWrapper>
      <AppBar title="Encrypt notes" />
      <ContentWrapper>
        <PasswordAlert navigate={navigation.navigate} />

        <Notebooks navigation={navigation} notebooks={notebooks} />
      </ContentWrapper>
    </ScreenWrapper>
  );
}

export default EncryptNotes;
