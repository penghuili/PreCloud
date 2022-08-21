import { HStack, IconButton, Text, useToast, VStack } from 'native-base';
import React, { useState } from 'react';
import { types } from 'react-native-document-picker';
import RNFS from 'react-native-fs';

import { platforms } from '../lib/constants';
import { androidDownloadFilePaths, makeAndroidDownloadFolders, shareFile } from '../lib/files';
import { LocalStorage, mimeTypePrefix } from '../lib/localstorage';
import Icon from './Icon';
import PlatformToggle from './PlatformToggle';

function FileItem({ file, forEncrypt, onDelete }) {
  const toast = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadFileForAndroid = async () => {
    try {
      setIsDownloading(true);

      await makeAndroidDownloadFolders();
      console.log(
        file,
        `${forEncrypt ? androidDownloadFilePaths.encrypted : androidDownloadFilePaths.decrypted}/${
          file.fileName
        }`
      );
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
      toast.show({ title: 'Deleted.' });
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
    <VStack space="sm" alignItems="center">
      <Text w="xs">{file.fileName}</Text>
      <HStack alignItems="center">
        <PlatformToggle for={platforms.android}>
          <IconButton
            icon={<Icon name="download-outline" size={20} />}
            size="sm"
            variant="subtle"
            mr="2"
            isDisabled={isDownloading}
            onPress={() => handleDownloadFileForAndroid()}
          />
        </PlatformToggle>
        <IconButton
          icon={<Icon name="share-outline" size={20} />}
          size="sm"
          variant="subtle"
          mr="2"
          onPress={() => handleShareFile()}
        />
        <IconButton
          icon={<Icon name="trash-outline" size={20} />}
          size="sm"
          variant="subtle"
          onPress={() => handleDeleteFile()}
        />
      </HStack>
    </VStack>
  );
}

export default FileItem;
