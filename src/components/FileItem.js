import { HStack, IconButton, Text, useToast, VStack } from 'native-base';
import React, { useMemo, useState } from 'react';
import FileViewer from 'react-native-file-viewer';
import RNFS from 'react-native-fs';

import useColors from '../hooks/useColors';
import { isAndroid } from '../lib/device';
import {
  androidDownloadFolder,
  encryptionStatus,
  extractFileExtensionFromPath,
  MAX_FILE_SIZE_MEGA_BYTES,
  shareFile,
  viewableFileTypes,
} from '../lib/files';
import Icon from './Icon';

function FileItem({ file, onDelete }) {
  const colors = useColors();
  const toast = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
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
    try {
      setIsDownloading(true);

      if (isAndroid()) {
        const downloadPath = `${androidDownloadFolder}/${file.fileName}`;
        const exists = await RNFS.exists(downloadPath);
        if (exists) {
          await RNFS.unlink(downloadPath);
        }
        await RNFS.copyFile(file.path, downloadPath);
        toast.show({ title: `File is downloaded to ${downloadPath}` });
      } else {
        await shareFile({
          fileName: file.fileName,
          filePath: file.path,
          saveToFiles: true,
        });
        toast.show({ title: `File is downloaded.` });
      }
    } catch (error) {
      console.log('Download file failed:', error);
      if (isAndroid()) {
        toast.show({ title: 'Download file failed.' });
      }
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
      toast.show({ title: 'Shared.' });
    } catch (error) {
      console.log('Share file failed:', error);
    }
  };

  const handleDeleteFile = async () => {
    try {
      await RNFS.unlink(file.path);
      toast.show({ title: 'Deleted from cache.' });
      if (onDelete) {
        onDelete(file);
      }
    } catch (error) {
      console.log('Delete file failed:', error);
    }
  };

  function renderActions() {
    if (file.status === encryptionStatus.tooLarge) {
      return <Text>File size can not be bigger than {MAX_FILE_SIZE_MEGA_BYTES}MB.</Text>;
    }

    if (file.status === encryptionStatus.error) {
      return <Text>Encryption of this file failed.</Text>;
    }

    return (
      <HStack alignItems="center">
        {canBeOpened && (
          <IconButton
            icon={<Icon name="book-outline" size={20} color={colors.text} />}
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
    </VStack>
  );
}

export default FileItem;
