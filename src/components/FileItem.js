import { HStack, IconButton, Text, useToast, VStack } from 'native-base';
import React, { useMemo, useState } from 'react';
import { types } from 'react-native-document-picker';
import FileViewer from 'react-native-file-viewer';
import RNFS from 'react-native-fs';

import useColors from '../hooks/useColors';
import { isAndroid } from '../lib/device';
import {
  androidDownloadFolder,
  extractFileExtensionFromPath,
  shareFile,
  viewableFileTypes,
} from '../lib/files';
import { LocalStorage, mimeTypePrefix } from '../lib/localstorage';
import Icon from './Icon';

function FileItem({ file, forEncrypt, onDelete }) {
  const colors = useColors();
  const toast = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const canBeOpened = useMemo(() => {
    if (!file) {
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
          mimeType: file.mimeType || types.plainText,
          saveToFiles: true,
        });
        toast.show({ title: `File is downloaded.` });
      }
    } catch (error) {
      console.log('Download file failed:', error);
      toast.show({ title: 'Download file failed.' });
    }

    setIsDownloading(false);
  };

  const handleShareFile = async () => {
    try {
      await shareFile({
        fileName: file.fileName,
        filePath: file.path,
        mimeType: file.mimeType || types.plainText,
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
      if (!forEncrypt) {
        await LocalStorage.remove(`${mimeTypePrefix}${file.fileName}`);
      }
      toast.show({ title: 'Deleted from cache.' });
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.log('Delete file failed:', error);
    }
  };

  if (!file) {
    return null;
  }

  return (
    <VStack space="sm" alignItems="flex-start">
      <Text w="xs">{file.fileName}</Text>
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
    </VStack>
  );
}

export default FileItem;
