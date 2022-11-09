import { Actionsheet } from 'native-base';
import React, { useEffect, useState } from 'react';

import { asyncForEach } from '../lib/array';
import { platforms } from '../lib/constants';
import { deleteFile } from '../lib/files/actions';
import { encryptFiles } from '../lib/openpgp/encryptFiles';
import { showToast } from '../lib/toast';
import { useStore } from '../store/store';
import AddNoteButton from './AddNoteButton';
import DownloadRemoteFileButton from './DownloadRemoteFileButton';
import PickFilesButton from './PickFilesButton';
import PickImagesButton from './PickImagesButton';
import PickNotesButton from './PickNotesButton';
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

function FolderActions({ folder, isOpen, onClose, onAddFile, onPickNotes, selectedFiles, navigate }) {
  const password = useStore(state => state.activePassword);

  const [isEncryptingFiles, setIsEncryptingFiles] = useState(false);
  const [isEncryptingImages, setIsEncryptingImages] = useState(false);
  const [isEncryptingNewImage, setIsEncryptingNewImage] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPickingNotes, setIsPickingNotes] = useState(false);

  useEffect(() => {
    if (selectedFiles?.length) {
      handleEncrypt(selectedFiles, setIsEncryptingNewImage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFiles]);

  async function handleEncrypt(pickedFiles, setIsEncrypting) {
    setIsEncrypting(true);

    const encryptedFiles = await encryptFiles(pickedFiles, {
      folder,
      onEncrypted: onAddFile,
      password,
    });
    if (encryptedFiles.length) {
      showToast('Your files are encrypted and saved on your phone!');
    }

    setIsEncrypting(false);
    await deleteFiles(pickedFiles);
  }

  const isLoading =
    isEncryptingFiles || isEncryptingImages || isEncryptingNewImage || isDownloading;
  return (
    <Actionsheet isOpen={isOpen} onClose={onClose}>
      <Actionsheet.Content>
        <TakePhotoButton
          isDisabled={!password || isLoading}
          isLoading={isEncryptingNewImage}
          onClose={onClose}
          onSelected={async photo => {
            await handleEncrypt([photo], setIsEncryptingNewImage);
          }}
        />
        <PlatformToggle for={platforms.ios}>
          <PickImagesButton
            isLoading={isEncryptingImages}
            isDisabled={!password || isLoading}
            onClose={onClose}
            onStart={setIsEncryptingImages}
            onSelected={async images => {
              await handleEncrypt(images, setIsEncryptingImages);
            }}
          />
        </PlatformToggle>
        <PickFilesButton
          isLoading={isEncryptingFiles}
          isDisabled={!password || isLoading}
          onClose={onClose}
          onStart={setIsEncryptingFiles}
          onSelected={async files => {
            await handleEncrypt(files, setIsEncryptingFiles);
          }}
        />
        <DownloadRemoteFileButton
          isLoading={isDownloading}
          isDisabled={!password || isLoading}
          onClose={onClose}
          onStart={setIsDownloading}
          onDownloaded={async file => {
            await handleEncrypt([file], setIsEncryptingFiles);
          }}
        />
        <AddNoteButton
          folder={folder}
          isDisabled={!password}
          onClose={onClose}
          navigate={navigate}
        />
        <PickNotesButton
          folder={folder}
          isLoading={isPickingNotes}
          isDisabled={!password}
          onClose={onClose}
          onStart={setIsPickingNotes}
          onSelected={async notes => {
            await onPickNotes(notes);
          }}
        />
      </Actionsheet.Content>
    </Actionsheet>
  );
}

export default FolderActions;
