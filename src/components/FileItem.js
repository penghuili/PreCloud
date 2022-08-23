import { HStack, IconButton, Text, useToast, VStack } from 'native-base';
import React, { useMemo, useState } from 'react';
import { types } from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';

import useColors from '../hooks/useColors';
import { platforms } from '../lib/constants';
import {
  androidDownloadFilePaths,
  extractFileExtensionFromPath,
  makeAndroidDownloadFolders,
  shareFile,
  viewableFileTypes,
} from '../lib/files';
import { LocalStorage, mimeTypePrefix } from '../lib/localstorage';
import Icon from './Icon';
import PlatformToggle from './PlatformToggle';

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

  const handleDownloadFileForAndroid = async () => {
    try {
      setIsDownloading(true);

      await makeAndroidDownloadFolders();
      await RNFS.copyFile(
        file.path,
        `${forEncrypt ? androidDownloadFilePaths.encrypted : androidDownloadFilePaths.decrypted}/${
          file.fileName
        }`
      );
      toast.show({ title: 'File is downloaded to the "Download" folder.' });
    } catch (error) {
      console.log('Download file failed:', error);
      toast.show({ title: 'Download file failed.' });
    }

    setIsDownloading(false);
  };

  const handleShareFile = async () => {
    try {
      await shareFile(file.fileName, file.path, file.mimeType || types.plainText);
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

        <PlatformToggle for={platforms.android}>
          <IconButton
            icon={<Icon name="download-outline" size={20} color={colors.text} />}
            size="sm"
            variant="subtle"
            mr="2"
            isDisabled={isDownloading}
            onPress={() => handleDownloadFileForAndroid()}
          />
        </PlatformToggle>
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
