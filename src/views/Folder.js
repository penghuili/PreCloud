import { useIsFocused } from '@react-navigation/native';
import { Actionsheet, Spinner, Text, VStack } from 'native-base';
import React, { useEffect, useMemo, useState } from 'react';

import AppBar from '../components/AppBar';
import Confirm from '../components/Confirm';
import ContentWrapper from '../components/ContentWrapper';
import FolderFiles from '../components/FolderFiles';
import FoldersList from '../components/FoldersList';
import FolderTopActions from '../components/FolderTopActions';
import Icon from '../components/Icon';
import PasswordAlert from '../components/PasswordAlert';
import ScreenWrapper from '../components/ScreenWrapper';
import useColors from '../hooks/useColors';
import {
  deleteFile,
  emptyFolder,
  getFolderSize,
  getSizeText,
  isRootFolder,
  readFiles,
  statFile,
} from '../lib/files';
import { showToast } from '../lib/toast';
import { routeNames } from '../router/routes';
import { useStore } from '../store/store';

let tempFiles = [];

function Folder({
  navigation,
  route: {
    params: { path, selectedFiles },
  },
}) {
  const colors = useColors();
  const isFocused = useIsFocused();
  const defaultFolder = useStore(state => state.defaultFolder);
  const rootFolders = useStore(state => state.rootFolders);
  const setRootFolders = useStore(state => state.setRootFolders);
  const updateDefaultFolder = useStore(state => state.updateDefaultFolder);
  const isRoot = useMemo(() => isRootFolder(path), [path]);

  const [folder, setFolder] = useState(null);
  const [innerFolders, setInnerFolders] = useState([]);
  const [innerFiles, setInnerFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEmptyConfirm, setShowEmptyConfirm] = useState(false);
  const [folderSize, setFolderSize] = useState(0);

  useEffect(() => {
    if (!path) {
      return;
    }

    if (isFocused) {
      fetchFiles(path);
    }
  }, [path, isFocused]);

  async function fetchFiles(path) {
    setIsLoading(true);

    const fd = await statFile(path);
    setFolder(fd);

    const content = await readFiles(path);
    setInnerFolders(content.folders);
    setInnerFiles(content.files);
    tempFiles = content.files;
    setIsLoading(false);

    const s = await getFolderSize(path);
    setFolderSize(s);
  }

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

        <VStack space="sm">
          {!!folder && (
            <FolderTopActions
              folder={folder}
              onAddFile={file => {
                tempFiles = [file, ...tempFiles];
                setInnerFiles(tempFiles);
              }}
              selectedFiles={selectedFiles}
            />
          )}

          {isLoading && <Spinner />}

          {!!folder && !isLoading && (
            <FoldersList folders={innerFolders} navigate={navigation.push} />
          )}

          {!!folder && !isLoading && (
            <FolderFiles
              folder={folder}
              files={innerFiles}
              navigate={navigation.navigate}
              onDelete={file => {
                setInnerFiles(innerFiles.filter(f => f.path !== file.path));
              }}
            />
          )}
        </VStack>
      </ContentWrapper>

      {!!folder && (
        <Actionsheet isOpen={showActions} onClose={() => setShowActions(false)}>
          <Actionsheet.Content>
            {isRoot &&
              (defaultFolder === folder?.name ? (
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
              ))}
            <Actionsheet.Item
              startIcon={<Icon name="folder-outline" color={colors.text} />}
              onPress={() => {
                setShowActions(false);
                navigation.navigate(routeNames.folderForm, {
                  folder: null,
                  parentPath: folder.path,
                });
              }}
            >
              Add sub folder
            </Actionsheet.Item>
            <Actionsheet.Item
              startIcon={<Icon name="folder-outline" color={colors.text} />}
              onPress={() => {
                setShowActions(false);
                navigation.replace(routeNames.folderForm, {
                  folder: { name: folder.name, path: folder.path },
                });
              }}
            >
              Rename
            </Actionsheet.Item>
            {innerFiles?.length > 0 && (
              <Actionsheet.Item
                startIcon={<Icon name="trash-outline" color={colors.text} />}
                onPress={() => {
                  setShowActions(false);
                  setShowEmptyConfirm(true);
                }}
              >
                Empty folder
              </Actionsheet.Item>
            )}
            {folder?.name !== defaultFolder && (
              <Actionsheet.Item
                startIcon={<Icon name="trash" color={colors.text} />}
                onPress={() => {
                  setShowDeleteConfirm(true);
                  setShowActions(false);
                }}
              >
                Delete
              </Actionsheet.Item>
            )}

            <Text fontSize="xs" color="gray.400">
              {getSizeText(folderSize)}
            </Text>
          </Actionsheet.Content>
        </Actionsheet>
      )}

      <Confirm
        isOpen={showEmptyConfirm}
        message="All files and folders in this folder will be deleted. Are you sure?"
        onClose={() => {
          setShowEmptyConfirm(false);
        }}
        onConfirm={async () => {
          setShowEmptyConfirm(false);
          await emptyFolder(folder.path);
          setInnerFiles([]);
          tempFiles = [];
          setInnerFolders([]);
          showToast('All files and folders in this folder are deleted.');
        }}
        isDanger
      />
      <Confirm
        isOpen={showDeleteConfirm}
        message="This folder and all files and folders within will be deleted. Are you sure?"
        onClose={() => {
          setShowDeleteConfirm(false);
        }}
        onConfirm={async () => {
          setShowDeleteConfirm(false);
          await deleteFile(folder.path);
          setRootFolders(rootFolders.filter(f => f.path !== folder.path));
          navigation.goBack();
          showToast('Deleted!');
        }}
        isDanger
      />
    </ScreenWrapper>
  );
}

export default Folder;
