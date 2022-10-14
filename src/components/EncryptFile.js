import { Button, HStack, Text, VStack } from 'native-base';
import React, { useEffect, useState } from 'react';
import DocumentPicker, { types } from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

import useColors from '../hooks/useColors';
import { asyncForEach } from '../lib/array';
import { platforms } from '../lib/constants';
import {
  deleteFile,
  encryptionStatus,
  extractFilePath,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MEGA_BYTES,
  moveFile,
  writeFile,
} from '../lib/files';
import { showToast } from '../lib/toast';
import { useStore } from '../store/store';
import DecryptFileModal from './DecryptFileModal';
import FileItem from './FileItem';
import Icon from './Icon';
import PlatformToggle from './PlatformToggle';

const nodejs = require('nodejs-mobile-react-native');

let pickedFiles = [];
let currentIndex = 0;

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

function EncryptFile({ folder, navigate }) {
  const password = useStore(state => state.activePassword);
  const colors = useColors();
  const files = useStore(state => state.files);
  const addFile = useStore(state => state.addFile);

  const [isEncryptingFiles, setIsEncryptingFiles] = useState(false);
  const [isEncryptingImages, setIsEncryptingImages] = useState(false);
  const [isEncryptingNewImage, setIsEncryptingNewImage] = useState(false);
  const [showDecryptModal, setShowDecryptModal] = useState(false);
  const [activeFile, setActiveFile] = useState(null);
  const [activeFileIndex, setActiveFileIndex] = useState(null);

  function resetLoading() {
    setIsEncryptingFiles(false);
    setIsEncryptingImages(false);
    setIsEncryptingNewImage(false);
  }

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
      resetLoading();
      await resetPickedFile();
      showToast('Encrypted all files!');
    }
  }

  async function handleTrigger({ name, size, path }) {
    if (name.endsWith('.precloud')) {
      await moveFile(path, `${folder.path}/${name}`);
      addFile({ name, path, size });
      await triggerNext();
      return;
    }

    if (size > MAX_FILE_SIZE_BYTES) {
      await deleteFile(path);
      addFile({ name, path, size, status: encryptionStatus.tooLarge });
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
    let processedFile;
    try {
      if (payload.data) {
        const fileName = `${payload.name}.precloud`;
        const newPath = `${folder.path}/${fileName}`;
        await writeFile(newPath, payload.data);
        const { size } = await RNFS.stat(newPath);

        processedFile = {
          name: fileName,
          path: newPath,
          size,
          originalPath: payload.path,
          status: encryptionStatus.encrypted,
        };
      } else {
        console.log(`Encrypt file failed for ${payload.name}`, payload.error);
        processedFile = {
          name: payload.name,
          path: payload.path,
          status: encryptionStatus.error,
        };
      }
    } catch (e) {
      console.log(`Save encrypted file failed for ${payload.name}`, e);
      processedFile = {
        name: payload.name,
        path: payload.path,
        status: encryptionStatus.error,
      };
    }

    addFile(processedFile);
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
    currentIndex = 0;
  }

  async function handleAfterPick(files, setIsEncrypting) {
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

      await handleAfterPick(files, setIsEncryptingImages);
    } catch (e) {
      await resetPickedFile();
      setIsEncryptingImages(false);
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

      await handleAfterPick(files, setIsEncryptingNewImage);
    } catch (e) {
      await resetPickedFile();
      setIsEncryptingNewImage(false);
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

      await handleAfterPick(files, setIsEncryptingFiles);
    } catch (e) {
      await resetPickedFile();
      setIsEncryptingFiles(false);
      console.log('Pick files failed', e);
    }
  }

  const isLoading = isEncryptingFiles || isEncryptingImages || isEncryptingNewImage;
  return (
    <VStack space="sm">
      <HStack flexWrap="wrap" w="full">
        <PlatformToggle for={platforms.ios}>
          <Button
            isDisabled={!password || isLoading}
            isLoading={isEncryptingImages}
            onPress={pickImages}
            startIcon={<Icon name="image-outline" size={16} color={colors.white} />}
            size="xs"
            mr="2"
          >
            Pick images
          </Button>
        </PlatformToggle>

        <Button
          isDisabled={!password || isLoading}
          isLoading={isEncryptingFiles}
          onPress={pickFiles}
          startIcon={<Icon name="documents-outline" size={16} color={colors.white} />}
          size="xs"
          mr="2"
        >
          Pick files
        </Button>
        <Button
          isDisabled={!password || isLoading}
          isLoading={isEncryptingNewImage}
          onPress={takePhoto}
          startIcon={<Icon name="camera-outline" size={16} color={colors.white} />}
          size="xs"
        >
          Take photo
        </Button>
      </HStack>

      {!files.length && (
        <Text>
          Pick one or multiple files to encrypt. Currently each file size can&lsquo;t be bigger than{' '}
          {MAX_FILE_SIZE_MEGA_BYTES}MB.
        </Text>
      )}

      {!!files.length && (
        <VStack space="sm" alignItems="center" py={4}>
          {files.map((file, index) => (
            <FileItem
              key={file.name}
              file={file}
              folder={folder}
              navigate={navigate}
              onDecrypt={() => {
                setShowDecryptModal(true);
                setActiveFile(file);
                setActiveFileIndex(index);
              }}
            />
          ))}
        </VStack>
      )}

      <DecryptFileModal
        isOpen={showDecryptModal}
        file={activeFile}
        hasPrevious={activeFileIndex > 0}
        onPrevious={() => {
          const newIndex = activeFileIndex - 1;
          setActiveFile(files[newIndex]);
          setActiveFileIndex(newIndex);
        }}
        hasNext={activeFileIndex < files.length - 1}
        onNext={() => {
          const newIndex = activeFileIndex + 1;
          setActiveFile(files[newIndex]);
          setActiveFileIndex(newIndex);
        }}
        onClose={() => {
          setShowDecryptModal(false);
          setActiveFile(null);
        }}
      />
    </VStack>
  );
}

export default EncryptFile;
