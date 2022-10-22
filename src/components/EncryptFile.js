import { Button, HStack, Text, VStack } from 'native-base';
import React, { useEffect, useState } from 'react';
import DocumentPicker, { types } from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import { launchImageLibrary } from 'react-native-image-picker';

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
  takePhoto,
} from '../lib/files';
import { encryptFile } from '../lib/openpgp';
import { showToast } from '../lib/toast';
import { useStore } from '../store/store';
import DecryptFileModal from './DecryptFileModal';
import FileItem from './FileItem';
import Icon from './Icon';
import PlatformToggle from './PlatformToggle';

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

function EncryptFile({ folder, navigate, selectedFiles }) {
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

  useEffect(() => {
    if (selectedFiles?.length) {
      handleAfterPick(selectedFiles, setIsEncryptingNewImage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFiles]);

  function resetLoading() {
    setIsEncryptingFiles(false);
    setIsEncryptingImages(false);
    setIsEncryptingNewImage(false);
  }

  async function triggerEncrypt({ name, size, path }) {
    if (name.endsWith('.precloud')) {
      const newPath = `${folder.path}/${name}`;
      await moveFile(path, newPath);
      addFile({ name, path: newPath, size });
      await triggerNext();
      return;
    }

    if (size > MAX_FILE_SIZE_BYTES) {
      await deleteFile(path);
      addFile({ name, path, size, status: encryptionStatus.tooLarge });
      await triggerNext();
      return;
    }

    const fileName = `${name}.precloud`;
    const outputPath = `${folder.path}/${fileName}`;
    const success = await encryptFile(path, outputPath, password);

    let processedFile;
    if (success) {
      const { size: newSize } = await RNFS.stat(outputPath);
      processedFile = {
        name: fileName,
        path: outputPath,
        size: newSize,
        status: encryptionStatus.encrypted,
      };
    } else {
      processedFile = {
        name,
        path,
        status: encryptionStatus.error,
      };
    }
    addFile(processedFile);

    await triggerNext();
  }

  async function triggerNext() {
    if (currentIndex + 1 < pickedFiles.length) {
      currentIndex = currentIndex + 1;
      const nextFile = pickedFiles[currentIndex];

      await triggerEncrypt({
        name: nextFile.name,
        size: nextFile.size,
        path: nextFile.path,
      });
    } else {
      resetLoading();
      await resetPickedFile();
      showToast('Your files are encrypted and saved on your phone!');
    }
  }

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
    await triggerEncrypt({
      name: firstFile.name,
      size: firstFile.size,
      path: firstFile.path,
    });
  }

  async function handlePickImages() {
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

  async function handleTakePhoto() {
    try {
      handleBeforePick();

      const photo = await takePhoto();
      if (photo) {
        const files = [photo];

        await handleAfterPick(files, setIsEncryptingNewImage);
      }
    } catch (e) {
      await resetPickedFile();
      setIsEncryptingNewImage(false);
      console.log('Take photo failed', e);
    }
  }

  async function handlePickFiles() {
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
            onPress={handlePickImages}
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
          onPress={handlePickFiles}
          startIcon={<Icon name="documents-outline" size={16} color={colors.white} />}
          size="xs"
          mr="2"
        >
          Pick files
        </Button>
        <Button
          isDisabled={!password || isLoading}
          isLoading={isEncryptingNewImage}
          onPress={handleTakePhoto}
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
