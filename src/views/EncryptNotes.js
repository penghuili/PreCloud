import { format } from 'date-fns';
import { Actionsheet } from 'native-base';
import React, { useEffect, useState } from 'react';

import AppBar from '../components/AppBar';
import ContentWrapper from '../components/ContentWrapper';
import Icon from '../components/Icon';
import Notebooks from '../components/Notebooks';
import PasswordAlert from '../components/PasswordAlert';
import ScreenWrapper from '../components/ScreenWrapper';
import UnzipFolderAction from '../components/UnzipFolderAction';
import ZipAndDownloadAction from '../components/ZipAndDownloadAction';
import ZipAndShareAction from '../components/ZipAndShareAction';
import useColors from '../hooks/useColors';
import { asyncForEach } from '../lib/array';
import { moveFile } from '../lib/files/actions';
import { notesFolder } from '../lib/files/constant';
import { readNotebooks } from '../lib/files/note';
import { showToast } from '../lib/toast';
import { routeNames } from '../router/routes';
import { useStore } from '../store/store';

function EncryptNotes({ navigation }) {
  const colors = useColors();
  const notebooks = useStore(state => state.notebooks);
  const setNotebooks = useStore(state => state.setNotebooks);

  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    loadNotebooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadNotebooks() {
    const books = await readNotebooks();
    setNotebooks(books);
  }

  async function handleUnzipped(result) {
    await asyncForEach(result, async notebook => {
      await moveFile(notebook.path, `${notesFolder}/${notebook.name}`);
    });

    await loadNotebooks();

    setShowActions(false);
    showToast('Import notes finished!');
  }

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
                <UnzipFolderAction
                  label="Import zipped notes"
                  folderPrefix="PreCloud-notes"
                  confirmMessage={`Please only pick zipped file, and file name should start with "PreCloud-notes".\n\nImportant note: Imported notebooks will overwrite current notebooks.`}
                  onUnzipped={handleUnzipped}
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
