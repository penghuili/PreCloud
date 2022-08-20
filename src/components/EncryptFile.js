import { Alert, Box, Button, Heading, Text, useToast, VStack } from 'native-base';
import React, { useEffect, useState } from 'react';
import DocumentPicker, { types } from 'react-native-document-picker';
import RNFS from 'react-native-fs';

import { platforms } from '../lib/constants';
import {
  shareFile,
  extractFileNameFromPath,
  extractFilePath,
  filePaths,
  makeEncryptedFolder,
} from '../lib/files';
import { routeNames } from '../router/Router';
import { useStore } from '../store/store';
import PlatformWrapper from './PlatformWrapper';

const nodejs = require('nodejs-mobile-react-native');

const MAX_FILE_SIZE_MEGA_BYTES = 20;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MEGA_BYTES * 1024 * 1024;

function EncryptFile({ currentRoute }) {
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
            const fileName = `${extractFileNameFromPath(msg.payload.path)}.preupload`;
            await makeEncryptedFolder();
            const newPath = `${filePaths.encrypted}/${fileName}`;
            await RNFS.writeFile(newPath, msg.payload.data, 'base64');
            setEncryptedFileName(fileName);
            setEncryptedFilePath(newPath);
          } else {
            toast.show({ title: 'Encrypt file failed.' });
          }
        } catch (e) {
          console.log('save encrypted file error', e);
        }
      }
    };
    nodejs.channel.addListener('message', listener);

    return () => {
      nodejs.channel.removeListener('message', listener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (currentRoute === routeNames.encryptFile) {
      setIsEncrypting(false);
      setOriginalFile(null);
      setEncryptedFileName(null);
      setEncryptedFilePath(null);
    }
  }, [currentRoute]);

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
        data: { fileBase64, password, path: file.path, mimeType: file.type || types.plainText },
      });
    } catch (e) {
      setIsEncrypting(false);
      console.log(e);
    }
  }

  const downloadEncryptedFile = async ({ path }) => {
    try {
      await shareFile(encryptedFileName, encryptedFilePath, types.plainText);

      await RNFS.unlink(path);
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
            <Button variant="outline" onPress={() => downloadEncryptedFile({ path })}>
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
      <PlatformWrapper for={platforms.ios}>
        <Alert w="100%" status="warning">
          <Text>
            And currently you can only pick files in the <Text highlight>Files</Text> app. You can
            firstly move file or image by sharing it -&gt; <Text bold>Save to Files</Text>
          </Text>
        </Alert>
      </PlatformWrapper>
      <Button isDisabled={!password} isLoading={isEncrypting} onPress={pickOrignalFile}>
        Pick a file to encrypt
      </Button>
      {renderFiles()}
    </VStack>
  );
}

export default EncryptFile;
