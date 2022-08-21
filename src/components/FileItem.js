import { Button, HStack, Text, useToast, VStack } from 'native-base';
import React from 'react';
import { types } from 'react-native-document-picker';
import RNFS from 'react-native-fs';

import { platforms } from '../lib/constants';
import { androidDownloadFilePaths, shareFile } from '../lib/files';
import { LocalStorage, mimeTypePrefix } from '../lib/localstorage';
import Icon from './Icon';
import PlatformToggle from './PlatformToggle';

function FileItem({ file, forEncrypt, onDelete }) {
  const toast = useToast();

  const handleDownloadFileForAndroid = async () => {
    try {
      await RNFS.copyFile(
        file.path,
        `${forEncrypt ? androidDownloadFilePaths.encrypted : androidDownloadFilePaths.decrypted}/${
          file.fileName
        }`
      );
      toast.show({ title: 'Downloaded.' });
    } catch (error) {
      console.log('Download file failed:', error);
      toast.show({ title: 'Download file failed.' });
    }
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
    <VStack space="sm">
      <Text w="xs">{file.fileName}</Text>
      <HStack>
        <PlatformToggle for={platforms.android}>
          <Button
            startIcon={<Icon name="download-outline" size={20} />}
            variant="subtle"
            size="sm"
            mr="2"
            onPress={() => handleDownloadFileForAndroid()}
          >
            Download
          </Button>
        </PlatformToggle>
        <Button
          startIcon={<Icon name="share-outline" size={20} />}
          variant="subtle"
          size="sm"
          mr="2"
          onPress={() => handleShareFile()}
        >
          Share
        </Button>
        <Button
          startIcon={<Icon name="trash-outline" size={20} />}
          variant="subtle"
          size="sm"
          onPress={() => handleDeleteFile()}
        >
          Delete
        </Button>
      </HStack>
    </VStack>
  );
}

export default FileItem;
