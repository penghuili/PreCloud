import { Button, Divider, Heading, ScrollView, Text, useToast, VStack } from 'native-base';
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
  const [originalFile, setOriginalFile] = useState(null);
  const [encryptedFilePath, setEncryptedFilePath] = useState(null);
  const [encryptedFile, setEncryptedFile] = useState(null);
  const [decryptedFilePath, setDecryptedFilePath] = useState(null);

  useEffect(() => {
    nodejs.start('main.js');

    const listener = async msg => {
      if (msg.type === 'encrypted-file') {
        if (msg.payload.data) {
          const newPath = `${msg.payload.path}.preupload`;
          await RNFS.writeFile(newPath, msg.payload.data, 'base64');
          setEncryptedFilePath(newPath);
          toast.show({ title: 'File is encrypted, ready for download.' });
        } else {
          toast.show({ title: 'Encrypt file failed.' });
        }
      } else if (msg.type === 'decrypted-file') {
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

      const fileBase64 = await RNFS.readFile(file.path, 'base64');
      nodejs.channel.send({
        type: 'encrypt-file',
        data: { fileBase64, password, path: file.path },
      });
    } catch (e) {
      if (DocumentPicker.isCancel(e)) {
        console.warn('pick document cancelled');
        // User cancelled the picker, exit any dialogs or menus and move on
      } else if (isInProgress(e)) {
        console.warn('multiple pickers were opened, only the last will be considered');
      } else {
        console.log(e);
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

      const fileBase64 = await RNFS.readFile(file.path, 'base64');

      nodejs.channel.send({
        type: 'decrypt-file',
        data: { fileBase64, password, path: file.path },
      });
    } catch (e) {
      if (DocumentPicker.isCancel(e)) {
        console.warn('pick document cancelled');
        // User cancelled the picker, exit any dialogs or menus and move on
      } else if (isInProgress(e)) {
        console.warn('multiple pickers were opened, only the last will be considered');
      } else {
        console.log(e);
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
      console.log(error);
    }
  };
  function extractPath(path) {
    return path.includes('file://') ? path.slice(7) : path;
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
      <ScrollView>
        <VStack space="sm" alignItems="center" px={4} py={4}>
          <PasswordAlert navigate={jumpTo} />
          <Heading>Encryption</Heading>
          <Button isDisabled={!password} onPress={pickOrignalFile}>
            Pick a file to encrypt
          </Button>
          {renderEncryptFile()}

          <Divider my={8} />

          <Heading>Decryption</Heading>
          <Button isDisabled={!password} onPress={pickEncryptedFile}>
            Pick a file to decrypt
          </Button>
          {renderDecryptFile()}
        </VStack>
      </ScrollView>
    </>
  );
}

export default EncryptFile;
