import { Actionsheet, Box, HStack, IconButton, Text, VStack } from 'native-base';
import React, { useState } from 'react';

import useColors from '../hooks/useColors';
import {
  downloadFile,
  encryptionStatus,
  getSizeText,
  MAX_FILE_SIZE_MEGA_BYTES,
  moveFile,
  shareFile,
} from '../lib/files';
import { showToast } from '../lib/toast';
import { useStore } from '../store/store';
import FolderPicker from './FolderPicker';
import Icon from './Icon';

function FileItem({ file, folder, navigate, onDecrypt, onDelete }) {
  const colors = useColors();
  const files = useStore(store => store.files);
  const setFiles = useStore(store => store.setFiles);
  const deleteFile = useStore(store => store.deleteFile);

  const [showActions, setShowActions] = useState(false);
  const [showFolderPicker, setShowFolderPicker] = useState(false);

  function handleDecrypt() {
    setShowActions(false);
    onDecrypt();
  }

  const handleShareFile = async () => {
    try {
      setShowActions(false);
      await shareFile({
        fileName: file.name,
        filePath: file.path,
        saveToFiles: false,
      });
      showToast('Shared!');
    } catch (error) {
      console.log('Share file failed:', error);
    }
  };

  const handleDownloadFile = async () => {
    setShowActions(false);
    const message = await downloadFile({ path: file.path, fileName: file.name });
    if (message) {
      showToast(message);
    }
  };

  async function handleMove(newFolder) {
    await moveFile(file.path, `${newFolder.path}/${file.name}`);
    setFiles(files.filter(n => n.path !== file.path));
    setShowFolderPicker(false);
    showToast('Moved!');
  }

  const handleDeleteFile = async () => {
    try {
      setShowActions(false);
      await deleteFile(file);
      showToast('Deleted!');

      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.log('Delete file failed:', error);
    }
  };

  function renderErrorMessage() {
    if (file.status === encryptionStatus.tooLarge) {
      return <Text highlight>File size can not be bigger than {MAX_FILE_SIZE_MEGA_BYTES}MB.</Text>;
    }

    if (file.status === encryptionStatus.error) {
      return <Text highlight>Encryption of this file failed.</Text>;
    }

    return null;
  }

  if (!file) {
    return null;
  }

  return (
    <>
      <VStack space="xs" alignItems="flex-start">
        <HStack justifyContent="flex-start">
          <Box flexDirection="row" flex="1">
            <Text flex="1" flexWrap="wrap">
              {file.name}
            </Text>
          </Box>

          <IconButton
            icon={<Icon name="ellipsis-vertical-outline" size={16} color={colors.text} />}
            onPress={() => setShowActions(true)}
          />
        </HStack>

        {renderErrorMessage()}
      </VStack>

      <FolderPicker
        isOpen={showFolderPicker}
        onClose={() => setShowFolderPicker(false)}
        onSave={handleMove}
        navigate={navigate}
        folder={folder}
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
              setShowActions(false)
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

          {!!file.size && (
            <Text fontSize="xs" color="gray.400">
              {getSizeText(file.size)}
            </Text>
          )}
        </Actionsheet.Content>
      </Actionsheet>
    </>
  );
}

export default FileItem;
