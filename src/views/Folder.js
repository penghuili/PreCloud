import { Actionsheet, Text } from 'native-base';
import React, { useEffect, useState } from 'react';

import AppBar from '../components/AppBar';
import Confirm from '../components/Confirm';
import ContentWrapper from '../components/ContentWrapper';
import EncryptFile from '../components/EncryptFile';
import Icon from '../components/Icon';
import PasswordAlert from '../components/PasswordAlert';
import ScreenWrapper from '../components/ScreenWrapper';
import useColors from '../hooks/useColors';
import { deleteFile, getFolderSize, getSizeText, readFiles } from '../lib/files';
import { showToast } from '../lib/toast';
import { routeNames } from '../router/routes';
import { useStore } from '../store/store';

function Folder({ navigation, route: { params } }) {
  const colors = useColors();
  const folder = useStore(state => state.activeFolder);
  const defaultFolder = useStore(state => state.defaultFolder);
  const setFiles = useStore(state => state.setFiles);
  const folders = useStore(state => state.folders);
  const setFolders = useStore(state => state.setFolders);
  const setActiveFolder = useStore(state => state.setActiveFolder);
  const updateDefaultFolder = useStore(state => state.updateDefaultFolder);

  const [showActions, setShowActions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [folderSize, setFolderSize] = useState(0);

  useEffect(() => {
    if (!folder) {
      return;
    }

    readFiles(folder.path).then(result => {
      setFiles(result);
    });

    getFolderSize(folder?.path).then(size => {
      setFolderSize(size);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folder]);

  return (
    <ScreenWrapper>
      <AppBar
        title={folder?.name}
        hasBack
        rightIconName="ellipsis-vertical-outline"
        onRightIconPress={() => setShowActions(true)}
      />

      <ContentWrapper>
        <PasswordAlert navigate={navigation.navigate} />

        {!!folder && (
          <EncryptFile
            folder={folder}
            navigate={navigation.navigate}
            pickedFiles={params?.pickedFiles}
          />
        )}
      </ContentWrapper>

      <Actionsheet isOpen={showActions} onClose={() => setShowActions(false)}>
        <Actionsheet.Content>
          {defaultFolder === folder?.name ? (
            <Actionsheet.Item startIcon={<Icon name="star" color={colors.text} />}>
              This is the default folder
            </Actionsheet.Item>
          ) : (
            <Actionsheet.Item
              startIcon={<Icon name="star-outline" color={colors.text} />}
              onPress={() => {
                setShowActions(false);
                updateDefaultFolder(folder.name);
                showToast(`Default folder is now ${folder.name}`);
              }}
            >
              Set as default folder
            </Actionsheet.Item>
          )}
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

          <Text fontSize="xs" color="gray.400">
            {getSizeText(folderSize)}
          </Text>
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
          setFolders(folders.filter(f => f.path !== folder.path));
          setActiveFolder(null);
          navigation.goBack();
        }}
        isDanger
      />
    </ScreenWrapper>
  );
}

export default Folder;
