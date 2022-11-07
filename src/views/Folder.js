import { useIsFocused } from '@react-navigation/native';
import { Actionsheet, Spinner, Text, VStack } from 'native-base';
import React, { useEffect, useMemo, useState } from 'react';

import AppBar from '../components/AppBar';
import Confirm from '../components/Confirm';
import ContentWrapper from '../components/ContentWrapper';
import FolderFiles from '../components/FolderFiles';
import FolderNotes from '../components/FolderNotes';
import FolderPicker from '../components/FolderPicker';
import FoldersList from '../components/FoldersList';
import Icon from '../components/Icon';
import PasswordAlert from '../components/PasswordAlert';
import ScreenWrapper from '../components/ScreenWrapper';
import useColors from '../hooks/useColors';
import { deleteFile, moveFile } from '../lib/files/actions';
import { readFiles } from '../lib/files/file';
import {
  emptyFolder,
  getFolderSize,
  getSizeText,
  isRootFolder,
  statFile,
} from '../lib/files/helpers';
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
  const loadRootFolders = useStore(state => state.loadRootFolders);
  const updateDefaultFolder = useStore(state => state.updateDefaultFolder);
  const isRoot = useMemo(() => isRootFolder(path), [path]);

  const [folder, setFolder] = useState(null);
  const [innerFolders, setInnerFolders] = useState([]);
  const [innerFiles, setInnerFiles] = useState([]);
  const [innerNotes, setInnerNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEmptyConfirm, setShowEmptyConfirm] = useState(false);
  const [folderSize, setFolderSize] = useState(0);
  const [showFolderPicker, setShowFolderPicker] = useState(false);

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
    setInnerNotes(content.notes);
    tempFiles = content.files;
    setIsLoading(false);

    const s = await getFolderSize(path);
    setFolderSize(s);
  }

  async function handleMove(newFolder) {
    const success = await moveFile(folder.path, `${newFolder.path}/${folder.name}`);
    if (success) {
      setShowFolderPicker(false);
      showToast('Moved!');
      if (isRoot) {
        await loadRootFolders();
      }
      navigation.goBack();
    } else {
      showToast('Move folder failed.', 'error');
    }
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

        <VStack>
          {isLoading && <Spinner />}

          {!!folder && !isLoading && (
            <FoldersList folders={innerFolders} navigate={navigation.push} />
          )}

          {!!folder && !isLoading && (
            <FolderNotes
              folder={folder}
              notes={innerNotes}
              onMoved={note => setInnerNotes(innerNotes.filter(n => n.path !== note.path))}
              onPickNotes={notes => {
                setInnerNotes([...notes, ...innerNotes]);
              }}
              navigation={navigation}
            />
          )}
          {!!folder && !isLoading && (
            <FolderFiles
              folder={folder}
              files={innerFiles}
              selectedFiles={selectedFiles}
              navigate={navigation.navigate}
              onAddFile={file => {
                tempFiles = [file, ...tempFiles];
                setInnerFiles(tempFiles);
              }}
              onDelete={file => {
                const newFiles = innerFiles.filter(f => f.path !== file.path);
                setInnerFiles(newFiles);
                tempFiles = newFiles;
              }}
            />
          )}
        </VStack>
      </ContentWrapper>

      {!!folder && (
        <>
          <FolderPicker
            isOpen={showFolderPicker}
            onClose={() => setShowFolderPicker(false)}
            onSave={handleMove}
            navigate={navigation.navigate}
            currentFolder={folder}
          />
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
              {folder?.name !== defaultFolder && (
                <Actionsheet.Item
                  startIcon={<Icon name="arrow-back-outline" color={colors.text} />}
                  onPress={() => {
                    setShowActions(false);
                    setShowFolderPicker(true);
                  }}
                >
                  Move to ...
                </Actionsheet.Item>
              )}
              {(innerFiles?.length > 0 || innerFolders?.length > 0) && (
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
        </>
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
