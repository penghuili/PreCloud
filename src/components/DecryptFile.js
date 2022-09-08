import { Alert, Box, Button, Heading, Text, useToast, VStack } from 'native-base';
import React, { useEffect, useState } from 'react';
import DocumentPicker, { types } from 'react-native-document-picker';
import RNFS from 'react-native-fs';

import {
  deleteFile,
  extractFileNameFromPath,
  extractFilePath,
  internalFilePaths,
  makeInternalFolders,
} from '../lib/files';
import { useStore } from '../store/store';
import FileItem from './FileItem';

const nodejs = require('nodejs-mobile-react-native');

let pickedFile = null;

async function resetPickedFile() {
  if (pickedFile) {
    await deleteFile(pickedFile.path);
    pickedFile = null;
  }
}

function DecryptFile() {
  const toast = useToast();
  const password = useStore(state => state.masterPassword);
  const decryptedFile = useStore(state => state.decryptedFile);
  const setDecryptedFile = useStore(state => state.setDecryptedFile);

  const [isDecrypting, setIsDecrypting] = useState(false);

  useEffect(() => {
    const listener = async msg => {
      if (msg.type === 'decrypted-file') {
        try {
          if (msg.payload.data) {
            await makeInternalFolders();

            const paths = msg.payload.path.split('.');
            paths.pop();
            const fileExtension = paths.pop();
            const tmpPath = `${paths.join('.')}.${fileExtension}`;
            const fileName = extractFileNameFromPath(tmpPath);
            const newPath = `${internalFilePaths.decrypted}/${fileName}`;
            await RNFS.writeFile(newPath, msg.payload.data, 'base64');

            setDecryptedFile({ fileName, path: newPath });
          } else {
            toast.show({ title: 'Decrypt file failed.' });
            console.log('Decrypt file failed.', msg.payload.error);
          }
        } catch (e) {
          console.log('save decrypted file error', e);
        }

        await resetPickedFile();
        setIsDecrypting(false);
      }
    };
    nodejs.channel.addListener('message', listener);

    return () => {
      nodejs.channel.removeListener('message', listener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function pickEncryptedFile() {
    try {
      pickedFile = null;
      setDecryptedFile(null);

      const result = await DocumentPicker.pick({
        allowMultiSelection: false,
        type: types.allFiles,
        presentationStyle: 'fullScreen',
        copyTo: 'cachesDirectory',
      });
      const file = { ...result[0], path: extractFilePath(result[0].fileCopyUri) };
      if (!file.name.endsWith('precloud') && !file.name.endsWith('preupload')) {
        toast.show({ title: 'Please only pick file ending with .precloud' });
        await RNFS.unlink(file.path);
        return;
      }

      pickedFile = file;

      setIsDecrypting(true);
      const fileBase64 = await RNFS.readFile(file.path, 'base64');

      nodejs.channel.send({
        type: 'decrypt-file',
        data: { fileBase64, password, path: file.path },
      });
    } catch (e) {
      await resetPickedFile();
      setIsDecrypting(false);
      console.log('Pick file failed', e);
    }
  }

  async function handleDeleteFile() {
    setDecryptedFile(null);
    await resetPickedFile();
  }

  return (
    <VStack space="sm" alignItems="center">
      <Heading>Decrypt file</Heading>
      <Alert w="100%" status="info">
        <Box
          _text={{
            textAlign: 'center',
          }}
        >
          Only pick file ending with .precloud
        </Box>
      </Alert>
      <Button isDisabled={!password} isLoading={isDecrypting} onPress={pickEncryptedFile}>
        Pick an encrypted file
      </Button>

      {!!decryptedFile && (
        <VStack space="sm" alignItems="center" px={4} py={4}>
          <Text bold>Decrypted file:</Text>
          <FileItem file={decryptedFile} forEncrypt={false} onDelete={handleDeleteFile} />
        </VStack>
      )}
    </VStack>
  );
}

export default DecryptFile;
