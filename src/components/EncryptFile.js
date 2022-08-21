import { Alert, Box, Button, Heading, Text, useToast, VStack } from 'native-base';
import React, { useEffect, useState } from 'react';
import DocumentPicker, { types } from 'react-native-document-picker';
import RNFS from 'react-native-fs';

import { platforms } from '../lib/constants';
import {
  deleteFile,
  extractFileNameFromPath,
  extractFilePath,
  internalFilePaths,
  makeInternalFolders,
} from '../lib/files';
import { useStore } from '../store/store';
import FileItem from './FileItem';
import PlatformToggle from './PlatformToggle';

const nodejs = require('nodejs-mobile-react-native');

const MAX_FILE_SIZE_MEGA_BYTES = 20;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MEGA_BYTES * 1024 * 1024;
let pickedFile = null;

async function resetPickedFile() {
  if (pickedFile) {
    await deleteFile(pickedFile.path);
    pickedFile = null;
  }
}

function EncryptFile() {
  const toast = useToast();
  const password = useStore(state => state.masterPassword);
  const encryptedFile = useStore(state => state.encryptedFile);
  const setEncryptedFile = useStore(state => state.setEncryptedFile);

  const [isEncrypting, setIsEncrypting] = useState(false);

  useEffect(() => {
    const listener = async msg => {
      if (msg.type === 'encrypted-file') {
        try {
          if (msg.payload.data) {
            await makeInternalFolders();

            const fileName = `${extractFileNameFromPath(msg.payload.path)}.preupload`;
            const newPath = `${internalFilePaths.encrypted}/${fileName}`;
            await RNFS.writeFile(newPath, msg.payload.data, 'base64');

            setEncryptedFile({ fileName, path: newPath });
          } else {
            toast.show({ title: 'Encrypt file failed.' });
            console.log('Encrypt file failed.', msg.payload.error);
          }
        } catch (e) {
          console.log('save encrypted file error', e);
        }

        await resetPickedFile();
        setIsEncrypting(false);
      }
    };

    nodejs.channel.addListener('message', listener);

    return () => {
      nodejs.channel.removeListener('message', listener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function pickOrignalFile() {
    try {
      pickedFile = null;
      setEncryptedFile(null);

      const result = await DocumentPicker.pick({
        allowMultiSelection: false,
        type: types.allFiles,
        presentationStyle: 'fullScreen',
        copyTo: 'cachesDirectory',
      });
      const file = { ...result[0], path: extractFilePath(result[0].fileCopyUri) };
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast.show({ title: `File size can't be bigger than ${MAX_FILE_SIZE_MEGA_BYTES}MB.` });
        await RNFS.unlink(file.path);
        return;
      }

      pickedFile = file;

      setIsEncrypting(true);
      const fileBase64 = await RNFS.readFile(file.path, 'base64');
      nodejs.channel.send({
        type: 'encrypt-file',
        data: { fileBase64, password, path: file.path, mimeType: file.type || types.plainText },
      });
    } catch (e) {
      await resetPickedFile();
      setIsEncrypting(false);
      console.log('Pick file failed', e);
    }
  }

  async function handleDeleteFile() {
    setEncryptedFile(null);
    await resetPickedFile();
  }

  return (
    <VStack space="sm" alignItems="center">
      <Heading>Encrypt file</Heading>
      <Alert w="100%" status="info">
        <Box
          _text={{
            textAlign: 'center',
          }}
        >
          {`Pick any file to encrypt. Currently file size can't be bigger than ${MAX_FILE_SIZE_MEGA_BYTES}MB.`}
        </Box>
      </Alert>
      <PlatformToggle for={platforms.ios}>
        <Alert w="100%" status="warning">
          <Text>
            And currently you can only pick files in the <Text highlight>Files</Text> app. You can
            move a file or an image by <Text bold>Sharing it</Text> -&gt;{' '}
            <Text bold>Save to Files</Text>.
          </Text>
        </Alert>
      </PlatformToggle>
      <Button isDisabled={!password} isLoading={isEncrypting} onPress={pickOrignalFile}>
        Pick a file to encrypt
      </Button>

      {!!encryptedFile && (
        <VStack space="sm" alignItems="center" px={4} py={4}>
          <Text bold>Encrypted file:</Text>
          <FileItem file={encryptedFile} forEncrypt onDelete={handleDeleteFile} />
        </VStack>
      )}
    </VStack>
  );
}

export default EncryptFile;
