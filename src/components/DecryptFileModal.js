import { Button, HStack, IconButton, Modal, Spinner, Text, VStack } from 'native-base';
import React, { useEffect, useState } from 'react';

import useColors from '../hooks/useColors';
import {
  deleteFile,
  extractFileNameFromPath,
  fileCachePaths,
  makeFileCacheFolders,
} from '../lib/files';
import { decryptFile } from '../lib/openpgp/helpers';
import { showToast } from '../lib/toast';
import { useStore } from '../store/store';
import DeleteButton from './DeleteButton';
import DownloadButton from './DownloadButton';
import Icon from './Icon';
import MoveToButton from './MoveToButton';
import OpenFileButton from './OpenFileButton';
import ShareButton from './ShareButton';

function DecryptFileModal({
  isOpen,
  file,
  folder,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  onClose,
  onDelete,
  navigate,
}) {
  const password = useStore(state => state.activePassword);
  const colors = useColors();

  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptedFile, setDecryptedFile] = useState(null);

  useEffect(() => {
    setDecryptedFile(null);
    if (file && password) {
      triggerDecrypt();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, password]);

  async function triggerDecrypt() {
    if (!file.name.endsWith('precloud')) {
      await deleteFile(file.path);
      showToast('Only select files ending with .precloud', 'error');
    }

    setIsDecrypting(true);

    await makeFileCacheFolders();
    const name = extractFileNameFromPath(file.path);
    const paths = name.split('.');
    paths.pop();
    const fileName = paths.join('.');
    const newPath = `${fileCachePaths.decrypted}/${fileName}`;
    const success = await decryptFile(file.path, newPath, password);

    if (success) {
      setDecryptedFile({ path: newPath, name: fileName });
    } else {
      showToast('Decrypt file failed.', 'error');
      handleClose();
    }

    setIsDecrypting(false);
  }

  function handleClose() {
    setIsDecrypting(false);
    setDecryptedFile(false);
    deleteFile(fileCachePaths.decrypted);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <Modal.Content maxWidth="400px">
        <Modal.Header>Decrypt file</Modal.Header>
        <Modal.Body>
          {isDecrypting && <Spinner />}
          {!isDecrypting && !!decryptedFile && (
            <>
              <VStack>
                <Text>{decryptedFile.name}</Text>
                <HStack mt="1">
                  <OpenFileButton file={decryptedFile} />
                  <ShareButton file={decryptedFile} />
                  <DownloadButton file={decryptedFile} />
                  <MoveToButton
                    file={file}
                    folder={folder}
                    onMove={file => {
                      handleClose();
                      onDelete(file);
                    }}
                    navigate={navigate}
                  />
                  <DeleteButton
                    file={file}
                    onDelete={() => {
                      handleClose();
                      onDelete(file);
                    }}
                  />
                </HStack>
              </VStack>

              <HStack mt="1" justifyContent="space-between" alignItems="center">
                <IconButton
                  icon={<Icon name="chevron-back-outline" color={colors.text} />}
                  onPress={() => {
                    if (hasPrevious) {
                      onPrevious();
                    }
                  }}
                  isDisabled={!hasPrevious}
                />
                <IconButton
                  icon={<Icon name="chevron-forward-outline" color={colors.text} />}
                  onPress={() => {
                    if (hasNext) {
                      onNext();
                    }
                  }}
                  isDisabled={!hasNext}
                />
              </HStack>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button onPress={handleClose}>Ok</Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
}

export default DecryptFileModal;
