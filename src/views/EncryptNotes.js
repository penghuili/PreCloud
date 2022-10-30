import { format } from 'date-fns';
import { Actionsheet } from 'native-base';
import React, { useEffect, useState } from 'react';

import AppBar from '../components/AppBar';
import ContentWrapper from '../components/ContentWrapper';
import Icon from '../components/Icon';
import Notebooks from '../components/Notebooks';
import PasswordAlert from '../components/PasswordAlert';
import ScreenWrapper from '../components/ScreenWrapper';
import ZipAndDownloadAction from '../components/ZipAndDownloadAction';
import ZipAndShareAction from '../components/ZipAndShareAction';
import useColors from '../hooks/useColors';
import { notesFolder } from '../lib/files/constant';
import { readNotebooks } from '../lib/files/note';
import { routeNames } from '../router/routes';
import { useStore } from '../store/store';

function EncryptNotes({ navigation }) {
  const colors = useColors();
  const notebooks = useStore(state => state.notebooks);
  const setNotebooks = useStore(state => state.setNotebooks);

  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    readNotebooks().then(value => {
      setNotebooks(value);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rootFolder = {
    name: `PreCloud-notes-${format(new Date(), 'yyyyMMddHHmm')}`,
    path: notesFolder,
  };

  return (
    <ScreenWrapper>
      <AppBar
        title="Encrypt notes"
        rightIconName="ellipsis-vertical-outline"
        onRightIconPress={() => setShowActions(true)}
      />
      <ContentWrapper>
        <PasswordAlert navigate={navigation.navigate} />

        <Notebooks navigation={navigation} notebooks={notebooks} />

        <Actionsheet isOpen={showActions} onClose={() => setShowActions(false)}>
          <Actionsheet.Content>
            <Actionsheet.Item
              startIcon={<Icon name="add-outline" color={colors.text} />}
              onPress={() => {
                setShowActions(false);
                navigation.navigate(routeNames.notebookForm, { notebook: null });
              }}
            >
              Create new folder
            </Actionsheet.Item>
            {notebooks?.length > 0 && (
              <>
                <ZipAndShareAction
                  folder={rootFolder}
                  label="Zip and share all notes"
                  onShared={() => setShowActions(false)}
                />
                <ZipAndDownloadAction
                  folder={rootFolder}
                  label="Zip and download all notes"
                  onDownloaded={() => setShowActions(false)}
                />
              </>
            )}
          </Actionsheet.Content>
        </Actionsheet>
      </ContentWrapper>
    </ScreenWrapper>
  );
}

export default EncryptNotes;
