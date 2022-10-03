import { HStack, IconButton, Text, useToast, VStack } from 'native-base';
import React, { useMemo, useState } from 'react';
import FileViewer from 'react-native-file-viewer';
import RNFS from 'react-native-fs';

import useColors from '../hooks/useColors';
import {
  copyFile,
  decryptionStatus,
  deleteFile,
  downloadFile,
  encryptionStatus,
  extractFileExtensionFromPath,
  extractFileNameAndExtension,
  MAX_FILE_SIZE_MEGA_BYTES,
  shareFile,
  viewableFileTypes,
} from '../lib/files';
import { useStore } from '../store/store';
import Icon from './Icon';
import RenameFileModal from './RenameFileModal';

function FileItem({ file, forEncrypt, canRename = true, onDelete }) {
  const colors = useColors();
  const toast = useToast();
  const renameEncryptedFile = useStore(state => state.renameEncryptedFile);
  const deleteEncryptedFile = useStore(state => state.deleteEncryptedFile);
  const renameDecryptedFile = useStore(state => state.renameDecryptedFile);
  const deleteDecryptedFile = useStore(state => state.deleteDecryptedFile);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const { extension } = extractFileNameAndExtension(file?.fileName || '');

  const canBeOpened = useMemo(() => {
    if (!file?.fileName) {
      return false;
    }

    const extension = extractFileExtensionFromPath(file.fileName);
    return viewableFileTypes.includes(extension);
  }, [file]);

  async function handleOpenFile() {
    try {
      await FileViewer.open(file.path);
    } catch (e) {
      console.log('open file failed', e);
    }
  }

  const handleDownloadFile = async () => {
    setIsDownloading(true);

    const message = await downloadFile({ path: file.path, fileName: file.fileName });
    if (message) {
      toast.show({ title: message, placement: 'top' });
    }

    setIsDownloading(false);
  };

  const handleShareFile = async () => {
    try {
      await shareFile({
        fileName: file.fileName,
        filePath: file.path,
        saveToFiles: false,
      });
      toast.show({ title: 'Shared.', placement: 'top' });
    } catch (error) {
      console.log('Share file failed:', error);
    }
  };

  const handleDeleteFile = async () => {
    try {
      await RNFS.unlink(file.path);
      toast.show({ title: 'Deleted from cache.', placement: 'top' });
      if (forEncrypt) {
        deleteEncryptedFile(file);
      } else {
        deleteDecryptedFile(file);
      }

      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.log('Delete file failed:', error);
    }
  };

  function renderActions() {
    if (file.status === encryptionStatus.tooLarge) {
      return <Text highlight>File size can not be bigger than {MAX_FILE_SIZE_MEGA_BYTES}MB.</Text>;
    }

    if (file.status === encryptionStatus.error) {
      return <Text highlight>Encryption of this file failed.</Text>;
    }

    if (file.status === decryptionStatus.wrongExtension) {
      return <Text highlight>Please only pick file ending with .precloud</Text>;
    }

    if (file.status === decryptionStatus.error) {
      return <Text highlight>Decryption of this file failed.</Text>;
    }

    return (
      <HStack alignItems="center">
        {canRename && (
          <IconButton
            icon={<Icon name="create-outline" size={20} color={colors.text} />}
            size="sm"
            variant="subtle"
            mr="2"
            isDisabled={isDownloading}
            onPress={() => setShowRenameModal(true)}
          />
        )}

        {canBeOpened && (
          <IconButton
            icon={<Icon name="eye-outline" size={20} color={colors.text} />}
            size="sm"
            variant="subtle"
            mr="2"
            onPress={() => handleOpenFile()}
          />
        )}

        <IconButton
          icon={<Icon name="download-outline" size={20} color={colors.text} />}
          size="sm"
          variant="subtle"
          mr="2"
          isDisabled={isDownloading}
          onPress={() => handleDownloadFile()}
        />
        <IconButton
          icon={<Icon name="share-outline" size={20} color={colors.text} />}
          size="sm"
          variant="subtle"
          mr="2"
          onPress={() => handleShareFile()}
        />
        <IconButton
          icon={<Icon name="trash-outline" size={20} color={colors.text} />}
          size="sm"
          variant="subtle"
          onPress={() => handleDeleteFile()}
        />
      </HStack>
    );
  }

  if (!file) {
    return null;
  }

  return (
    <VStack space="sm" alignItems="flex-start">
      <Text w="xs">{file.fileName}</Text>

      {renderActions()}

      <RenameFileModal
        fileName={file.fileName}
        extension={extension}
        isOpen={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        onSave={async newName => {
          const newFullName = `${newName}${extension}`;
          const parts = file.path.split('/');
          parts.pop();
          const newPath = `${parts.join('/')}/${newFullName}`;
          await copyFile(file.path, newPath);
          await deleteFile(file.path);

          const newFile = {
            fileName: newFullName,
            path: newPath,
            size: file.size,
          };
          if (forEncrypt) {
            renameEncryptedFile(file.fileName, newFile);
          } else {
            renameDecryptedFile(file.fileName, newFile);
          }
        }}
      />
    </VStack>
  );
}

export default FileItem;
