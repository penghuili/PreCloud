import {
  Alert,
  Box,
  Button,
  Divider,
  Heading,
  ScrollView,
  Text,
  useToast,
  VStack,
} from 'native-base';
import React, { useEffect, useState } from 'react';
import DocumentPicker, { isInProgress, types } from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';

import AppBar from '../components/AppBar';
import PasswordAlert from '../components/PasswordAlert';
import { useStore } from '../store/store';

const nodejs = require('nodejs-mobile-react-native');

const MAX_FILE_SIZE_MEGA_BYTES = 20;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MEGA_BYTES * 1024 * 1024;

function EncryptFile({ jumpTo }) {
  const toast = useToast();
  const password = useStore(state => state.masterPassword);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [originalFile, setOriginalFile] = useState(null);
  const [encryptedFilePath, setEncryptedFilePath] = useState(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [encryptedFile, setEncryptedFile] = useState(null);
  const [decryptedFilePath, setDecryptedFilePath] = useState(null);

  useEffect(() => {
    const listener = async msg => {
      if (msg.type === 'encrypted-file') {
        setIsEncrypting(false);
        if (msg.payload.data) {
          const newPath = `${msg.payload.path}.preupload`;
          await RNFS.writeFile(newPath, msg.payload.data, 'base64');
          setEncryptedFilePath(newPath);
          toast.show({ title: 'File is encrypted, ready for download.' });
        } else {
          toast.show({ title: 'Encrypt file failed.' });
        }
      } else if (msg.type === 'decrypted-file') {
        setIsDecrypting(false);
        if (msg.payload.data) {
          const paths = msg.payload.path.split('.');
          paths.pop();
          const fileExtension = paths.pop();
          const newPath = `${paths.join('.')}.${fileExtension}`;
          await RNFS.writeFile(newPath, msg.payload.data, 'base64');
          setDecryptedFilePath(newPath);
          toast.show({ title: 'File is decrypted, ready for download.' });
        } else {
          toast.show({ title: 'Decrypt file failed.' });
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
      const file = { ...result[0], path: extractPath(result[0].fileCopyUri) };
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
      const file = { ...result[0], path: extractPath(result[0].fileCopyUri) };
      setEncryptedFile(file);

      setIsDecrypting(true);
      const fileBase64 = await RNFS.readFile(file.path, 'base64');

      nodejs.channel.send({
        type: 'decrypt-file',
        data: { fileBase64, password, path: file.path },
      });
    } catch (e) {
      setIsDecrypting(false);
      if (DocumentPicker.isCancel(e)) {
        console.log('pick document cancelled');
        // User cancelled the picker, exit any dialogs or menus and move on
      } else if (isInProgress(e)) {
        console.log('multiple pickers were opened, only the last will be considered');
      } else {
        toast.show({ title: 'Pick file failed, please only pick file ending with .precloud' });
      }
    }
  }

  const downloadDecryptedFile = async ({ path, name }) => {
    try {
      const filename = `${name}.preupload`;
      await Share.open({
        title: filename,
        filename,
        url: `file://${decryptedFilePath}`,
        type: types.plainText,
      });

      await RNFS.unlink(path);
      await RNFS.unlink(decryptedFilePath);
      setEncryptedFile(null);
      setDecryptedFilePath(null);
      toast.show({ title: 'Downloaded.' });
    } catch (error) {
      toast.show({ title: 'Download file failed.' });
    }
  };
  function extractPath(path) {
    if (path.startsWith('file:///')) {
      return path.slice(7);
    } else if (path.startsWith('file://')) {
      return path.slice(6);
    } else if (path.startsWith('file:/')) {
      return path.slice(5);
    }
    return path;
  }

  function renderEncryptFile() {
    if (!originalFile) {
      return null;
    }

    const { path, name } = originalFile;
    return (
      <VStack space="sm" alignItems="center" px={4} py={4}>
        <Text>{name}</Text>
        {encryptedFilePath && (
          <Button onPress={() => downloadEncryptedFile({ path, name })}>Download</Button>
        )}
      </VStack>
    );
  }

  function renderDecryptFile() {
    if (!encryptedFile) {
      return null;
    }

    const { path, name } = encryptedFile;
    return (
      <VStack space="sm" alignItems="center" px={4} py={4}>
        <Text>{name}</Text>
        {decryptedFilePath && (
          <Button onPress={() => downloadDecryptedFile({ path, name })}>Download</Button>
        )}
      </VStack>
    );
  }

  return (
    <>
      <AppBar title="Encrypt & decrypt file" />
      <ScrollView px={4} py={4} keyboardShouldPersistTaps="handled">
        <VStack space="sm" alignItems="center">
          <PasswordAlert navigate={jumpTo} />
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
          {renderEncryptFile()}

          <Divider my={8} />

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
          {renderDecryptFile()}
        </VStack>
      </ScrollView>
    </>
  );
}

export default EncryptFile;
