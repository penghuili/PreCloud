import { format } from 'date-fns';
import { Actionsheet } from 'native-base';
import React, { useState } from 'react';

import AppBar from '../components/AppBar';
import ContentWrapper from '../components/ContentWrapper';
import Icon from '../components/Icon';
import PasswordAlert from '../components/PasswordAlert';
import RootFolders from '../components/RootFolders';
import ScreenWrapper from '../components/ScreenWrapper';
import UnzipFolderAction from '../components/UnzipFolderAction';
import ZipAndDownloadAction from '../components/ZipAndDownloadAction';
import ZipAndShareAction from '../components/ZipAndShareAction';
import useColors from '../hooks/useColors';
import { asyncForEach } from '../lib/array';
import { moveFile } from '../lib/files/actions';
import { filesFolder } from '../lib/files/constant';
import { showToast } from '../lib/toast';
import { routeNames } from '../router/routes';
import { useStore } from '../store/store';

function EncryptFiles({ navigation }) {
  const colors = useColors();
  const rootFolders = useStore(state => state.rootFolders);
  const getRootFolders = useStore(state => state.getRootFolders);

  const [showActions, setShowActions] = useState(false);

  async function handleUnzipped(result) {
    await asyncForEach(result, async folder => {
      await moveFile(folder.path, `${filesFolder}/${folder.name}`);
    });

    await getRootFolders();

    setShowActions(false);
    showToast('Import files finished!');
  }

  const rootFolder = {
    name: `PreCloud-files-${format(new Date(), 'yyyyMMddHHmm')}`,
    path: filesFolder,
  };

  return (
    <ScreenWrapper>
      <AppBar
        title="Encrypt files"
        rightIconName="ellipsis-vertical-outline"
        onRightIconPress={() => setShowActions(true)}
      />
      <ContentWrapper>
        <PasswordAlert navigate={navigation.navigate} />

        <RootFolders navigation={navigation} rootFolders={rootFolders} />

        <Actionsheet isOpen={showActions} onClose={() => setShowActions(false)}>
          <Actionsheet.Content>
            <Actionsheet.Item
              startIcon={<Icon name="add-outline" color={colors.text} />}
              onPress={() => {
                setShowActions(false);
                navigation.navigate(routeNames.folderForm, { folder: null });
              }}
            >
              Create new folder
            </Actionsheet.Item>
            {rootFolders?.length > 0 && (
              <>
                <ZipAndShareAction
                  folder={rootFolder}
                  label="Zip and share all files"
                  onShared={() => setShowActions(false)}
                />
                <ZipAndDownloadAction
                  folder={rootFolder}
                  label="Zip and download all files"
                  onDownloaded={() => setShowActions(false)}
                />
                <UnzipFolderAction
                  label="Import zipped files"
                  folderPrefix="PreCloud-files"
                  confirmMessage={`Please only pick zipped file, and file name should start with "PreCloud-files".\n\nImportant note: Imported folders will overwrite current folders.`}
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

export default EncryptFiles;
