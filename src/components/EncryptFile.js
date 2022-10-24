import { Button, HStack, Text, VStack } from 'native-base';
import React, { useEffect, useState } from 'react';
import DocumentPicker, { types } from 'react-native-document-picker';
import { launchImageLibrary } from 'react-native-image-picker';

import useColors from '../hooks/useColors';
import { asyncForEach } from '../lib/array';
import { platforms } from '../lib/constants';
import { deleteFile, extractFilePath, MAX_FILE_SIZE_MEGA_BYTES, takePhoto } from '../lib/files';
import { encryptFiles } from '../lib/openpgp/encryptFiles';
import { showToast } from '../lib/toast';
import { useStore } from '../store/store';
import DecryptFileModal from './DecryptFileModal';
import FileItem from './FileItem';
import Icon from './Icon';
import PlatformToggle from './PlatformToggle';

async function deleteFiles(pickedFiles) {
  await asyncForEach(
    pickedFiles.map(f => f.path),
    async path => {
      await deleteFile(path);
    }
  );
}

function EncryptFile({ folder, files, folders, navigate, selectedFiles }) {
  const password = useStore(state => state.activePassword);
  const colors = useColors();
  const addFile = useStore(state => state.addFile);

  const [isEncryptingFiles, setIsEncryptingFiles] = useState(false);
  const [isEncryptingImages, setIsEncryptingImages] = useState(false);
  const [isEncryptingNewImage, setIsEncryptingNewImage] = useState(false);
  const [showDecryptModal, setShowDecryptModal] = useState(false);
  const [activeFile, setActiveFile] = useState(null);
  const [activeFileIndex, setActiveFileIndex] = useState(null);

  useEffect(() => {
    if (selectedFiles?.length) {
      handleEncrypt(selectedFiles, setIsEncryptingNewImage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFiles]);

  async function handleEncrypt(pickedFiles, setIsEncrypting) {
    setIsEncrypting(true);

    await encryptFiles(pickedFiles, { folder, onEncrypted: addFile, password });

    setIsEncrypting(false);
    showToast('Your files are encrypted and saved on your phone!');
    await deleteFiles(pickedFiles);
  }

  async function handlePickImages() {
    try {
      const result = await launchImageLibrary({
        mediaType: 'mixed',
        selectionLimit: 0,
      });
      const images = result?.assets?.map(f => ({
        name: f.fileName,
        size: f.fileSize,
        path: extractFilePath(f.uri),
      }));

      await handleEncrypt(images, setIsEncryptingImages);
    } catch (e) {
      console.log('Pick images failed', e);
    }
  }

  async function handleTakePhoto() {
    try {
      const photo = await takePhoto();
      if (photo) {
        const photos = [photo];

        await handleEncrypt(photos, setIsEncryptingNewImage);
      }
    } catch (e) {
      console.log('Take photo failed', e);
    }
  }

  async function handlePickFiles() {
    try {
      const result = await DocumentPicker.pick({
        allowMultiSelection: true,
        type: types.allFiles,
        presentationStyle: 'fullScreen',
        copyTo: 'cachesDirectory',
      });
      const pickedFiles = result.map(f => ({
        name: f.name,
        size: f.size,
        path: extractFilePath(f.fileCopyUri),
      }));

      await handleEncrypt(pickedFiles, setIsEncryptingFiles);
    } catch (e) {
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
        folder={folder}
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
        navigate={navigate}
      />
    </VStack>
  );
}

export default EncryptFile;
