import { Alert, Button, Heading, Text, VStack } from 'native-base';
import React, { useEffect, useState } from 'react';
import DocumentPicker, { types } from 'react-native-document-picker';
import RNFS from 'react-native-fs';

import { asyncForEach } from '../lib/array';
import {
  decryptionStatus,
  deleteFile,
  extractFileNameFromPath,
  extractFilePath,
  internalFilePaths,
  makeInternalFolders,
} from '../lib/files';
import { useStore } from '../store/store';
import FileItem from './FileItem';

const nodejs = require('nodejs-mobile-react-native');

let pickedFiles = [];
let currentIndex = 0;
let processedFiles = [];

async function deleteFiles(paths) {
  await asyncForEach(paths, async path => {
    await deleteFile(path);
  });
}

async function resetPickedFiles() {
  if (pickedFiles?.length) {
    await deleteFiles(pickedFiles.map(f => f.path));
    pickedFiles = [];
  }
}

function DecryptFile() {
  const password = useStore(state => state.activePassword);
  const decryptedFiles = useStore(state => state.decryptedFiles);
  const setDecryptedFiles = useStore(state => state.setDecryptedFiles);

  const [isDecrypting, setIsDecrypting] = useState(false);

  async function triggerNext() {
    if (currentIndex + 1 < pickedFiles.length) {
      currentIndex = currentIndex + 1;
      const nextFile = pickedFiles[currentIndex];

      await handleTrigger({
        name: nextFile.name,
        path: nextFile.path,
      });
    } else {
      setIsDecrypting(false);
      await resetPickedFiles();
    }
  }

  async function handleTrigger({ name, path }) {
    if (!name.endsWith('precloud') || !name.endsWith('preupload')) {
      await deleteFile(path);
      processedFiles = [
        ...processedFiles,
        { fileName: name, path, status: decryptionStatus.wrongExtension },
      ];
      setDecryptedFiles(processedFiles);

      await triggerNext();
      return;
    }

    const fileBase64 = await RNFS.readFile(path, 'base64');
    nodejs.channel.send({
      type: 'decrypt-file',
      data: { fileBase64, password, name, path },
    });
  }

  async function handleDecrypted(payload) {
    await makeInternalFolders();

    let processedFile;
    try {
      if (payload.data) {
        const paths = payload.path.split('.');
        paths.pop();
        const fileExtension = paths.pop();
        const tmpPath = `${paths.join('.')}.${fileExtension}`;
        const fileName = extractFileNameFromPath(tmpPath);
        const newPath = `${internalFilePaths.decrypted}/${fileName}`;
        await RNFS.writeFile(newPath, payload.data, 'base64');

        processedFile = {
          fileName,
          path: newPath,
          originalPath: payload.path,
          status: decryptionStatus.decrypted,
        };
      } else {
        console.log('Decrypt file failed.', payload.error);
        processedFile = {
          fileName: payload.name,
          path: payload.path,
          status: decryptionStatus.error,
        };
      }
    } catch (e) {
      console.log('save decrypted file error', e);
      processedFile = {
        fileName: payload.name,
        path: payload.path,
        status: decryptionStatus.error,
      };
    }

    processedFiles = [...processedFiles, processedFile];
    setDecryptedFiles(processedFiles);
  }

  useEffect(() => {
    const listener = async msg => {
      if (msg.type === 'decrypted-file') {
        await handleDecrypted(msg.payload);
        await triggerNext();
      }
    };
    nodejs.channel.addListener('message', listener);

    return () => {
      nodejs.channel.removeListener('message', listener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function pickFiles() {
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
      const files = result.map(f => ({
        name: f.name,
        path: extractFilePath(f.fileCopyUri),
      }));

      if (!files?.length) {
        return;
      }
      pickedFiles = files;
      setIsDecrypting(true);
      const firstFile = files[0];
      await handleTrigger({
        name: firstFile.name,
        path: firstFile.path,
      });
    } catch (e) {
      await resetPickedFiles();
      setIsDecrypting(false);
      console.log('Pick files failed', e);
    }
  }

  return (
    <VStack space="sm" alignItems="center">
      <Heading>Decrypt file</Heading>
      <Alert w="100%" status="info">
        <Text>Pick one or multiple encrypted files that end with .precloud</Text>
      </Alert>
      <Button isDisabled={!password} isLoading={isDecrypting} onPress={pickFiles}>
        Pick encrypted files
      </Button>

      {!!decryptedFiles.length && (
        <VStack space="sm" alignItems="center" px={4} py={4}>
          <Text bold>Decrypted {decryptedFiles.length > 1 ? 'files' : 'file'}:</Text>
          {decryptedFiles.map(file => (
            <FileItem key={file.fileName} file={file} forEncrypt={false} />
          ))}
        </VStack>
      )}
    </VStack>
  );
}

export default DecryptFile;
