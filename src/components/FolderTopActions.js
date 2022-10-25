import { HStack } from 'native-base';
import React, { useEffect, useState } from 'react';

import { asyncForEach } from '../lib/array';
import { platforms } from '../lib/constants';
import { deleteFile } from '../lib/files';
import { encryptFiles } from '../lib/openpgp/encryptFiles';
import { showToast } from '../lib/toast';
import { useStore } from '../store/store';
import PickFilesButton from './PickFilesButton';
import PickImagesButton from './PickImagesButton';
import PlatformToggle from './PlatformToggle';
import TakePhotoButton from './TakePhotoButton';

async function deleteFiles(pickedFiles) {
  await asyncForEach(
    pickedFiles.map(f => f.path),
    async path => {
      await deleteFile(path);
    }
  );
}

function FolderTopActions({ folder, onAddFile, selectedFiles }) {
  const password = useStore(state => state.activePassword);

  const [isEncryptingFiles, setIsEncryptingFiles] = useState(false);
  const [isEncryptingImages, setIsEncryptingImages] = useState(false);
  const [isEncryptingNewImage, setIsEncryptingNewImage] = useState(false);

  useEffect(() => {
    if (selectedFiles?.length) {
      handleEncrypt(selectedFiles, setIsEncryptingNewImage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFiles]);

  async function handleEncrypt(pickedFiles, setIsEncrypting) {
    setIsEncrypting(true);

    await encryptFiles(pickedFiles, { folder, onEncrypted: onAddFile, password });

    setIsEncrypting(false);
    showToast('Your files are encrypted and saved on your phone!');
    await deleteFiles(pickedFiles);
  }

  const isLoading = isEncryptingFiles || isEncryptingImages || isEncryptingNewImage;
  return (
    <HStack flexWrap="wrap" w="full">
      <TakePhotoButton
        isDisabled={!password || isLoading}
        isLoading={isEncryptingNewImage}
        onSelected={async photo => {
          await handleEncrypt([photo], setIsEncryptingNewImage);
        }}
      />
      <PlatformToggle for={platforms.ios}>
        <PickImagesButton
          isLoading={isEncryptingImages}
          isDisabled={!password || isLoading}
          onSelected={async images => {
            await handleEncrypt(images, setIsEncryptingImages);
          }}
        />
      </PlatformToggle>
      <PickFilesButton
        isLoading={isEncryptingFiles}
        isDisabled={!password || isLoading}
        onSelected={async files => {
          await handleEncrypt(files, setIsEncryptingFiles);
        }}
      />
    </HStack>
  );
}

export default FolderTopActions;
