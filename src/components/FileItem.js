import { Actionsheet, HStack, IconButton, Pressable, Text, VStack } from 'native-base';
import React, { useEffect, useState } from 'react';

import useColors from '../hooks/useColors';
import { deleteFile, downloadFile, moveFile, shareFile } from '../lib/files/actions';
import { getFolderSize, getSizeText, isLargeFile } from '../lib/files/helpers';
import { zipFolder } from '../lib/files/zip';
import { showToast } from '../lib/toast';
import { routeNames } from '../router/routes';
import FolderPicker from './FolderPicker';
import Icon from './Icon';

function FileItem({ file, folder, navigate, onDecrypt, onDelete }) {
  const colors = useColors();

  const [showActions, setShowActions] = useState(false);
  const [showFolderPicker, setShowFolderPicker] = useState(false);
  const [fileSize, setFileSize] = useState(0);

  useEffect(() => {
    if (!file) {
      return;
    }

    if (isLargeFile(file)) {
      getFolderSize(file.path).then(s => {
        setFileSize(s);
      });
    } else {
      setFileSize(file.size);
    }
  }, [file]);

  function handleDecrypt() {
    setShowActions(false);
    onDecrypt(file);
  }

  function handleRename() {
    setShowActions(false);
    navigate(routeNames.renameFileForm, {
      file: { name: file.name, path: file.path },
    });
  }

  async function handleShareFile() {
    try {
      setShowActions(false);

      let updated = file;
      if (file.isDirectory()) {
        updated = await zipFolder(file.name, file.path);
      }

      if (updated) {
        const success = await shareFile({
          name: updated.name,
          path: updated.path,
          saveToFiles: false,
        });

        if (success) {
          showToast('Shared!');
        }
      } else {
        showToast('Share file failed.', 'error');
      }
    } catch (error) {
      console.log('Share file failed:', error);
    }
  }

  async function handleDownloadFile() {
    setShowActions(false);

    let updated = file;
    if (file.isDirectory()) {
      updated = await zipFolder(file.name, file.path);
    }
    if (updated) {
      const message = await downloadFile({ path: updated.path, name: updated.name });
      if (message) {
        showToast(message);
      }
    } else {
      showToast('Download file failed', 'error');
    }
  }

  async function handleMove(newFolder) {
    await moveFile(file.path, `${newFolder.path}/${file.name}`);
    onDelete(file);
    setShowFolderPicker(false);
    showToast('Moved!');
  }

  async function handleDeleteFile() {
    try {
      await deleteFile(file.path);
      onDelete(file);
      setShowActions(false);
      showToast('Deleted!');
    } catch (error) {
      console.log('Delete file failed:', error);
    }
  }

  if (!file) {
    return null;
  }

  return (
    <>
      <VStack space="xs" alignItems="flex-start">
        <HStack justifyContent="flex-start">
          <Pressable flexDirection="row" flex="1" onPress={handleDecrypt}>
            <Text flex="1" flexWrap="wrap">
              {file.name}
            </Text>
          </Pressable>

          <IconButton
            icon={<Icon name="ellipsis-vertical-outline" size={16} color={colors.text} />}
            onPress={() => setShowActions(true)}
          />
        </HStack>
      </VStack>

      <FolderPicker
        isOpen={showFolderPicker}
        onClose={() => setShowFolderPicker(false)}
        onSave={handleMove}
        navigate={navigate}
        currentFolder={folder}
      />
      <Actionsheet isOpen={showActions} onClose={() => setShowActions(false)}>
        <Actionsheet.Content>
          <Actionsheet.Item
            startIcon={<Icon name="lock-open-outline" color={colors.text} />}
            onPress={handleDecrypt}
          >
            Decrypt
          </Actionsheet.Item>
          <Actionsheet.Item
            startIcon={<Icon name="create-outline" color={colors.text} />}
            onPress={handleRename}
          >
            Rename
          </Actionsheet.Item>
          <Actionsheet.Item
            startIcon={<Icon name="share-outline" color={colors.text} />}
            onPress={handleShareFile}
          >
            Share
          </Actionsheet.Item>
          <Actionsheet.Item
            startIcon={<Icon name="download-outline" color={colors.text} />}
            onPress={handleDownloadFile}
          >
            Download
          </Actionsheet.Item>
          <Actionsheet.Item
            startIcon={<Icon name="arrow-back-outline" color={colors.text} />}
            onPress={() => {
              setShowActions(false);
              setShowFolderPicker(true);
            }}
          >
            Move to ...
          </Actionsheet.Item>
          <Actionsheet.Item
            startIcon={<Icon name="trash-outline" color={colors.text} />}
            onPress={handleDeleteFile}
          >
            Delete
          </Actionsheet.Item>

          {!!fileSize && (
            <Text fontSize="xs" color="gray.400">
              {getSizeText(fileSize)}
            </Text>
          )}
        </Actionsheet.Content>
      </Actionsheet>
    </>
  );
}

export default FileItem;
