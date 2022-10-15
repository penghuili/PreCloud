import { Actionsheet } from 'native-base';
import React, { useEffect, useState } from 'react';

import AppBar from '../components/AppBar';
import Confirm from '../components/Confirm';
import ContentWrapper from '../components/ContentWrapper';
import EncryptFile from '../components/EncryptFile';
import Icon from '../components/Icon';
import PasswordAlert from '../components/PasswordAlert';
import ScreenWrapper from '../components/ScreenWrapper';
import useColors from '../hooks/useColors';
import { deleteFile, readFiles } from '../lib/files';
import { routeNames } from '../router/routes';
import { useStore } from '../store/store';

function Folder({ navigation }) {
  const colors = useColors();
  const folder = useStore(state => state.activeFolder);
  const setFiles = useStore(state => state.setFiles);
  const folders = useStore(state => state.folders);
  const setFolders = useStore(state => state.setFolders);
  const setActiveFolder = useStore(state => state.setActiveFolder);

  const [showActions, setShowActions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    readFiles(folder.path).then(result => {
      setFiles(result);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folder]);

  return (
    <ScreenWrapper>
      <AppBar
        title={folder.name}
        hasBack
        rightIconName="ellipsis-vertical-outline"
        onRightIconPress={() => setShowActions(true)}
      />

      <ContentWrapper>
        <PasswordAlert navigate={navigation.navigate} />

        <EncryptFile folder={folder} navigate={navigation.navigate} />
      </ContentWrapper>

      <Actionsheet isOpen={showActions} onClose={() => setShowActions(false)}>
        <Actionsheet.Content>
          <Actionsheet.Item
            startIcon={<Icon name="create-outline" color={colors.text} />}
            onPress={() => {
              setShowActions(false);
              navigation.navigate(routeNames.folderForm, {
                folder: { name: folder.name, path: folder.path },
              });
            }}
          >
            Rename
          </Actionsheet.Item>
          <Actionsheet.Item
            startIcon={<Icon name="trash-outline" color={colors.text} />}
            onPress={() => {
              setShowDeleteConfirm(true);
              setShowActions(false);
            }}
          >
            Delete
          </Actionsheet.Item>
        </Actionsheet.Content>
      </Actionsheet>

      <Confirm
        isOpen={showDeleteConfirm}
        message="All files in this folder will be deleted. Are you sure?"
        onClose={() => {
          setShowDeleteConfirm(false);
        }}
        onConfirm={async () => {
          setShowDeleteConfirm(false);
          await deleteFile(folder.path);
          navigation.goBack();
          setFolders(folders.filter(f => f.path !== folder.path));
          setActiveFolder(null);
        }}
        isDanger
      />
    </ScreenWrapper>
  );
}

export default Folder;
