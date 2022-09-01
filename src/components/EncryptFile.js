import { Alert, Box, Button, Heading, Text, VStack } from 'native-base';
import React, { useEffect, useState } from 'react';
import DocumentPicker, { types } from 'react-native-document-picker';
import RNFS from 'react-native-fs';

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
  const password = useStore(state => state.masterPassword);

  const encryptedFiles = useStore(state => state.encryptedFiles);
  const setEncryptedFiles = useStore(state => state.setEncryptedFiles);

  const [isEncrypting, setIsEncrypting] = useState(false);

  async function handleTrigger({ name, size, path, mimeType }) {
    if (size > MAX_FILE_SIZE_BYTES) {
      await deleteFile(path);
      processedFiles = [
        ...processedFiles,
        { fileName: name, path, mimeType, status: encryptionStatus.tooLarge },
      ];
      setEncryptedFiles(processedFiles);
    }

    const fileBase64 = await RNFS.readFile(path, 'base64');
    nodejs.channel.send({
      type: 'encrypt-file',
      data: { fileBase64, name, path, mimeType: mimeType || types.plainText, password },
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
          mimeType: payload.mimeType,
          originalPath: payload.path,
          status: encryptionStatus.encrypted,
        };
      } else {
        console.log(`Encrypt file failed for ${payload.name}`, payload.error);
        processedFile = {
          fileName: payload.name,
          path: payload.path,
          mimeType: payload.mimeType,
          status: encryptionStatus.error,
        };
      }
    } catch (e) {
      console.log(`Save encrypted file failed for ${payload.name}`, e);
      processedFile = {
        fileName: payload.name,
        path: payload.path,
        mimeType: payload.mimeType,
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

        if (currentIndex + 1 < pickedFiles.length) {
          currentIndex = currentIndex + 1;
          const nextFile = pickedFiles[currentIndex];

          await handleTrigger({
            name: nextFile.name,
            size: nextFile.size,
            path: nextFile.path,
            mimeType: nextFile.type,
          });
        } else {
          setIsEncrypting(false);
          await resetPickedFile();
        }
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
      pickedFiles = [];
      processedFiles = [];
      currentIndex = 0;

      const result = await DocumentPicker.pick({
        allowMultiSelection: true,
        type: types.allFiles,
        presentationStyle: 'fullScreen',
        copyTo: 'cachesDirectory',
      });
      const files = result.map(f => ({ ...f, path: extractFilePath(f.fileCopyUri) }));

      if (!files.length) {
        return;
      }
      pickedFiles = files;

      setIsEncrypting(true);
      const firstFile = files[0];
      await handleTrigger({
        name: firstFile.name,
        size: firstFile.size,
        path: firstFile.path,
        mimeType: firstFile.type,
      });
    } catch (e) {
      await resetPickedFile();
      setIsEncrypting(false);
      console.log('Pick file failed', e);
    }
  }

  async function handleDeleteFile(file) {
    setEncryptedFiles(encryptedFiles.filter(f => f.fileName !== file.fileName));
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
          {`Pick one or multiple files to encrypt. Currently file size can't be bigger than ${MAX_FILE_SIZE_MEGA_BYTES}MB.`}
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

      {!!encryptedFiles.length && (
        <VStack space="sm" alignItems="center" px={4} py={4}>
          <Text bold>Encrypted {encryptedFiles.length > 1 ? 'files' : 'file'}:</Text>
          {encryptedFiles.map(file => (
            <FileItem key={file.fileName} file={file} forEncrypt onDelete={handleDeleteFile} />
          ))}
        </VStack>
      )}
    </VStack>
  );
}

export default EncryptFile;
