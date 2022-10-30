import {
  Button,
  HStack,
  IconButton,
  Image,
  Modal,
  Pressable,
  Spinner,
  Text,
  View,
  VStack,
} from 'native-base';
import React, { useEffect, useState } from 'react';

import useColors from '../hooks/useColors';
import { emptyCache } from '../lib/files/cache';
import {
  imageExtensions,
  largeFileExtension,
  precloudExtension,
  videoExtensions,
} from '../lib/files/constant';
import { viewFile } from '../lib/files/file';
import { extractFileNameAndExtension } from '../lib/files/helpers';
import { decryptFile } from '../lib/openpgp/decryptFile';
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
    if (!file.name.endsWith(precloudExtension) && !file.name.endsWith(largeFileExtension)) {
      showToast(
        `Only select files ending with .${precloudExtension} or .${largeFileExtension}`,
        'error'
      );
      return;
    }

    setIsDecrypting(true);

    const decrypted = await decryptFile(file, password);

    if (decrypted) {
      setDecryptedFile(decrypted);
    } else {
      showToast('Decrypt file failed.', 'error');
      handleClose();
    }

    setIsDecrypting(false);
  }

  function handleClose() {
    setIsDecrypting(false);
    setDecryptedFile(false);
    onClose();
    emptyCache();
  }

  function renderImage() {
    if (decryptedFile?.name) {
      const { extensionWithoutDot } = extractFileNameAndExtension(decryptedFile.name);
      if (
        imageExtensions.includes(extensionWithoutDot) ||
        videoExtensions.includes(extensionWithoutDot)
      ) {
        return (
          <Pressable
            onPress={() => {
              viewFile(decryptedFile.path);
            }}
            mb="4"
          >
            <Image
              source={{ uri: `file://${decryptedFile.path}` }}
              size="2xl"
              w="full"
              resizeMode="contain"
            />
          </Pressable>
        );
      }
    }

    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <Modal.Content>
        <Modal.Header>Decrypt file</Modal.Header>
        <Modal.Body px="0">
          {isDecrypting && <Spinner />}
          {!isDecrypting && !!decryptedFile && (
            <>
              <VStack>
                {renderImage()}
                <View px="4">
                  <Text>{decryptedFile.name}</Text>
                  <HStack mt="1">
                    <OpenFileButton file={decryptedFile} />
                    <ShareButton file={decryptedFile} />
                    <DownloadButton file={decryptedFile} />
                    <MoveToButton
                      file={file}
                      folder={folder}
                      onMove={() => {
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
                </View>
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
