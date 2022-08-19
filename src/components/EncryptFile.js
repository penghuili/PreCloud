import { Alert, Box, Button, Heading, Text, useToast, VStack } from 'native-base';
import React, { useEffect, useState } from 'react';
import DocumentPicker, { isInProgress, types } from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';

import { extractFileNameFromPath, extractFilePath } from '../lib/files';
import { useStore } from '../store/store';

const nodejs = require('nodejs-mobile-react-native');

const MAX_FILE_SIZE_MEGA_BYTES = 20;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MEGA_BYTES * 1024 * 1024;

function EncryptFile() {
  const toast = useToast();
  const password = useStore(state => state.masterPassword);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [originalFile, setOriginalFile] = useState(null);
  const [encryptedFileName, setEncryptedFileName] = useState(null);
  const [encryptedFilePath, setEncryptedFilePath] = useState(null);

  useEffect(() => {
    const listener = async msg => {
      if (msg.type === 'encrypted-file') {
        setIsEncrypting(false);
        try {
          if (msg.payload.data) {
            const newPath = `${msg.payload.path}.preupload`;
            await RNFS.writeFile(newPath, msg.payload.data, 'base64');
            setEncryptedFileName(extractFileNameFromPath(newPath));
            setEncryptedFilePath(newPath);
          } else {
            toast.show({ title: 'Encrypt file failed.' });
          }
        } catch (e) {
          console.log('error', e);
        }
      }
    };
    nodejs.channel.addListener('message', listener);

    return () => {
      nodejs.channel.removeListener('message', listener);
    };
  }, []);

  async function pickOrignalFile() {
    try {
      setOriginalFile(null);
      setEncryptedFilePath(null);

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

      setOriginalFile(file);

      setIsEncrypting(true);
      const fileBase64 = await RNFS.readFile(file.path, 'base64');
      nodejs.channel.send({
        type: 'encrypt-file',
        data: { fileBase64, password, path: file.path },
      });
    } catch (e) {
      setIsEncrypting(false);
      if (DocumentPicker.isCancel(e)) {
        console.warn('pick document cancelled');
        // User cancelled the picker, exit any dialogs or menus and move on
      } else if (isInProgress(e)) {
        console.warn('multiple pickers were opened, only the last will be considered');
      } else {
        toast.show({ title: 'Pick file failed, please try again.' });
      }
    }
  }

  const downloadEncryptedFile = async ({ path, name }) => {
    try {
      const filename = `${name}.preupload`;

      await Share.open({
        title: filename,
        filename,
        url: `file://${encryptedFilePath}`,
        type: types.plainText,
      });

      await RNFS.unlink(path);
      await RNFS.unlink(encryptedFilePath);
      setOriginalFile(null);
      setEncryptedFilePath(null);
      toast.show({ title: 'Downloaded.' });
    } catch (error) {
      console.log(error);
      toast.show({ title: 'Download file failed.' });
    }
  };

  function renderFiles() {
    if (!originalFile) {
      return null;
    }

    const { path, name } = originalFile;
    return (
      <VStack space="sm" alignItems="center" px={4} py={4}>
        <Text bold>Selected file:</Text>
        <Text>{name}</Text>

        {encryptedFilePath && (
          <>
            <Text bold>Encrypted file:</Text>
            <Text>{encryptedFileName}</Text>
            <Button variant="outline" onPress={() => downloadEncryptedFile({ path, name })}>
              Download
            </Button>
          </>
        )}
      </VStack>
    );
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
      <Button isDisabled={!password} isLoading={isEncrypting} onPress={pickOrignalFile}>
        Pick a file to encrypt
      </Button>
      {renderFiles()}
    </VStack>
  );
}

export default EncryptFile;
