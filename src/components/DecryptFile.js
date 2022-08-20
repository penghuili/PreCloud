import { Alert, Box, Button, Heading, Text, useToast, VStack } from 'native-base';
import React, { useEffect, useState } from 'react';
import DocumentPicker, { types } from 'react-native-document-picker';
import RNFS from 'react-native-fs';

import {
  extractFileNameFromPath,
  extractFilePath,
  filePaths,
  makeDecryptedFolder,
  shareFile,
} from '../lib/files';
import { LocalStorage, mimeTypePrefix } from '../lib/localstorage';
import { routeNames } from '../router/Router';
import { useStore } from '../store/store';

const nodejs = require('nodejs-mobile-react-native');

function DecryptFile({ currentRoute }) {
  const toast = useToast();
  const password = useStore(state => state.masterPassword);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [encryptedFile, setEncryptedFile] = useState(null);
  const [decryptedFileName, setDecryptedFileName] = useState(null);
  const [decryptedFileMimeType, setDecryptedFileMimeType] = useState(null);
  const [decryptedFilePath, setDecryptedFilePath] = useState(null);

  useEffect(() => {
    const listener = async msg => {
      if (msg.type === 'decrypted-file') {
        setIsDecrypting(false);
        if (msg.payload.data) {
          const paths = msg.payload.path.split('.');
          paths.pop();
          const fileExtension = paths.pop();
          const tmpPath = `${paths.join('.')}.${fileExtension}`;
          const fileName = extractFileNameFromPath(tmpPath);
          const newPath = `${filePaths.decrypted}/${fileName}`;
          await makeDecryptedFolder();
          await RNFS.writeFile(newPath, msg.payload.data, 'base64');
          setDecryptedFileName(fileName);
          setDecryptedFileMimeType(msg.payload.mimeType);
          setDecryptedFilePath(newPath);

          await LocalStorage.set(`${mimeTypePrefix}${fileName}`, msg.payload.mimeType);
        } else {
          console.log(msg.payload.error, 'Decrypt file failed.');
          toast.show({ title: 'Decrypt file failed.' });
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
      setIsDecrypting(false);
      setEncryptedFile(null);
      setDecryptedFileName(null);
      setDecryptedFileMimeType(null);
      setDecryptedFilePath(null);
    }
  }, [currentRoute]);

  async function pickEncryptedFile() {
    try {
      setEncryptedFile(null);
      setDecryptedFilePath(null);

      const result = await DocumentPicker.pick({
        allowMultiSelection: false,
        type: types.allFiles,
        presentationStyle: 'fullScreen',
        copyTo: 'cachesDirectory',
      });
      const file = { ...result[0], path: extractFilePath(result[0].fileCopyUri) };
      setEncryptedFile(file);

      setIsDecrypting(true);
      const fileBase64 = await RNFS.readFile(file.path, 'base64');

      nodejs.channel.send({
        type: 'decrypt-file',
        data: { fileBase64, password, path: file.path },
      });
    } catch (e) {
      setIsDecrypting(false);
      console.log(e, 'pick encrypted');
    }
  }

  const downloadDecryptedFile = async ({ path }) => {
    try {
      await shareFile(
        decryptedFileName,
        decryptedFilePath,
        decryptedFileMimeType || types.plainText
      );

      await RNFS.unlink(path);
      setEncryptedFile(null);
      setDecryptedFilePath(null);
      toast.show({ title: 'Downloaded.' });
    } catch (error) {
      console.log(error);
      toast.show({ title: 'Download file failed.' });
    }
  };

  function renderFiles() {
    if (!encryptedFile) {
      return null;
    }

    const { path, name } = encryptedFile;
    return (
      <VStack space="sm" alignItems="center" px={4} py={4}>
        <Text bold>Selected file:</Text>
        <Text>{name}</Text>
        {decryptedFilePath && (
          <>
            <Text bold>Decrypted file:</Text>
            <Text>{decryptedFileName}</Text>
            <Button variant="outline" onPress={() => downloadDecryptedFile({ path })}>
              Download
            </Button>
          </>
        )}
      </VStack>
    );
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
        Pick a file to decrypt
      </Button>
      {renderFiles()}
    </VStack>
  );
}

export default DecryptFile;
