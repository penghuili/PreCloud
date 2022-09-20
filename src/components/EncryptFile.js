import { Alert, Button, Heading, HStack, Text, VStack } from 'native-base';
import React, { useEffect, useState } from 'react';
import DocumentPicker, { types } from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

import { asyncForEach } from '../lib/array';
import { platforms } from '../lib/constants';
import {
  deleteFile,
  encryptionStatus,
  extractFilePath,
  internalFilePaths,
  makeInternalFolders,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MEGA_BYTES,
} from '../lib/files';
import { useStore } from '../store/store';
import FileItem from './FileItem';
import PlatformToggle from './PlatformToggle';

const nodejs = require('nodejs-mobile-react-native');

let pickedFiles = [];
let currentIndex = 0;
let processedFiles = [];

async function deleteFiles(paths) {
  await asyncForEach(paths, async path => {
    await deleteFile(path);
  });
}

async function resetPickedFile() {
  if (pickedFiles?.length) {
    await deleteFiles(pickedFiles.map(f => f.path));
    pickedFiles = [];
  }
}

function EncryptFile() {
  const password = useStore(state => state.activePassword);
  const encryptedFiles = useStore(state => state.encryptedFiles);
  const setEncryptedFiles = useStore(state => state.setEncryptedFiles);

  const [isEncrypting, setIsEncrypting] = useState(false);

  async function triggerNext() {
    if (currentIndex + 1 < pickedFiles.length) {
      currentIndex = currentIndex + 1;
      const nextFile = pickedFiles[currentIndex];

      await handleTrigger({
        name: nextFile.name,
        size: nextFile.size,
        path: nextFile.path,
      });
    } else {
      setIsEncrypting(false);
      await resetPickedFile();
    }
  }

  async function handleTrigger({ name, size, path }) {
    if (size > MAX_FILE_SIZE_BYTES) {
      await deleteFile(path);
      processedFiles = [
        ...processedFiles,
        { fileName: name, path, status: encryptionStatus.tooLarge },
      ];
      setEncryptedFiles(processedFiles);

      await triggerNext();
      return;
    }

    const fileBase64 = await RNFS.readFile(path, 'base64');
    nodejs.channel.send({
      type: 'encrypt-file',
      data: { fileBase64, name, path, password },
    });
  }

  async function handleEncrypted(payload) {
    await makeInternalFolders();

    let processedFile;
    try {
      if (payload.data) {
        const fileName = `${payload.name}.precloud`;
        const newPath = `${internalFilePaths.encrypted}/${fileName}`;
        await RNFS.writeFile(newPath, payload.data, 'base64');

        processedFile = {
          fileName,
          path: newPath,
          originalPath: payload.path,
          status: encryptionStatus.encrypted,
        };
      } else {
        console.log(`Encrypt file failed for ${payload.name}`, payload.error);
        processedFile = {
          fileName: payload.name,
          path: payload.path,
          status: encryptionStatus.error,
        };
      }
    } catch (e) {
      console.log(`Save encrypted file failed for ${payload.name}`, e);
      processedFile = {
        fileName: payload.name,
        path: payload.path,
        status: encryptionStatus.error,
      };
    }

    processedFiles = [...processedFiles, processedFile];
    setEncryptedFiles(processedFiles);
  }

  useEffect(() => {
    const listener = async msg => {
      if (msg.type === 'encrypted-file') {
        await handleEncrypted(msg.payload);
        await triggerNext();
      }
    };

    nodejs.channel.addListener('message', listener);

    return () => {
      nodejs.channel.removeListener('message', listener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleBeforePick() {
    pickedFiles = [];
    processedFiles = [];
    currentIndex = 0;
  }

  async function handleAfterPick(files) {
    if (!files?.length) {
      return;
    }
    pickedFiles = files;

    setIsEncrypting(true);
    const firstFile = files[0];
    await handleTrigger({
      name: firstFile.name,
      size: firstFile.size,
      path: firstFile.path,
    });
  }

  async function pickImages() {
    try {
      handleBeforePick();

      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 0,
      });
      const files = result?.assets?.map(f => ({
        name: f.fileName,
        size: f.fileSize,
        path: extractFilePath(f.uri),
      }));

      await handleAfterPick(files);
    } catch (e) {
      await resetPickedFile();
      setIsEncrypting(false);
      console.log('Pick images failed', e);
    }
  }

  async function takePhoto() {
    try {
      handleBeforePick();

      const result = await launchCamera({
        mediaType: 'photo',
        selectionLimit: 0,
      });
      const files = result?.assets?.map(f => ({
        name: f.fileName,
        size: f.fileSize,
        path: extractFilePath(f.uri),
      }));

      await handleAfterPick(files);
    } catch (e) {
      await resetPickedFile();
      setIsEncrypting(false);
      console.log('Take photo failed', e);
    }
  }

  async function pickFiles() {
    try {
      handleBeforePick();

      const result = await DocumentPicker.pick({
        allowMultiSelection: true,
        type: types.allFiles,
        presentationStyle: 'fullScreen',
        copyTo: 'cachesDirectory',
      });
      const files = result.map(f => ({
        name: f.name,
        size: f.size,
        path: extractFilePath(f.fileCopyUri),
      }));

      await handleAfterPick(files);
    } catch (e) {
      await resetPickedFile();
      setIsEncrypting(false);
      console.log('Pick files failed', e);
    }
  }

  return (
    <VStack space="sm" alignItems="center">
      <Heading>Encrypt files</Heading>
      <Alert w="100%" status="info">
        <Text>
          Pick one or multiple files to encrypt. Currently each file size can&lsquo;t be bigger than{' '}
          {MAX_FILE_SIZE_MEGA_BYTES}MB.
        </Text>
      </Alert>
      <HStack space="2">
        <PlatformToggle for={platforms.ios}>
          <Button isDisabled={!password} isLoading={isEncrypting} onPress={pickImages}>
            Pick images
          </Button>
        </PlatformToggle>

        <Button isDisabled={!password} isLoading={isEncrypting} onPress={pickFiles}>
          Pick files
        </Button>
      </HStack>

      <Button isDisabled={!password} isLoading={isEncrypting} onPress={takePhoto}>
        Take photo and encrypt
      </Button>

      {!!encryptedFiles.length && (
        <VStack space="sm" alignItems="center" px={4} py={4}>
          <Text bold>Encrypted {encryptedFiles.length > 1 ? 'files' : 'file'}:</Text>
          {encryptedFiles.map(file => (
            <FileItem key={file.fileName} file={file} forEncrypt />
          ))}
        </VStack>
      )}
    </VStack>
  );
}

export default EncryptFile;
