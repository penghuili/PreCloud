import { Button, HStack, IconButton, Modal, Spinner, Text, VStack } from 'native-base';
import React, { useEffect, useState } from 'react';
import RNFS from 'react-native-fs';

import useColors from '../hooks/useColors';
import {
  deleteFile,
  extractFileNameFromPath,
  fileCachePaths,
  makeFileCacheFolders,
  writeFile,
} from '../lib/files';
import { showToast } from '../lib/toast';
import { useStore } from '../store/store';
import DownloadButton from './DownloadButton';
import Icon from './Icon';
import OpenFileButton from './OpenFileButton';
import ShareButton from './ShareButton';

const nodejs = require('nodejs-mobile-react-native');

function DecryptFileModal({ isOpen, file, onPrevious, onNext, hasPrevious, hasNext, onClose }) {
  const password = useStore(state => state.activePassword);
  const colors = useColors();

  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptedFile, setDecryptedFile] = useState(null);

  async function handleTrigger() {
    if (!file.name.endsWith('precloud')) {
      await deleteFile(file.path);
      showToast('Only select files ending with .precloud', 'error');
    }

    setIsDecrypting(true);
    const fileBase64 = await RNFS.readFile(file.path, 'base64');
    nodejs.channel.send({
      type: 'decrypt-file',
      data: { fileBase64, password, name: file.name, path: file.path },
    });
  }

  useEffect(() => {
    setDecryptedFile(null);
    if (file && password) {
      handleTrigger();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, password]);

  async function handleDecrypted(payload) {
    await makeFileCacheFolders();

    if (payload.data) {
      const name = extractFileNameFromPath(payload.path);
      const paths = name.split('.');
      paths.pop();
      const fileName = paths.join('.');
      const newPath = `${fileCachePaths.decrypted}/${fileName}`;
      await writeFile(newPath, payload.data);

      setDecryptedFile({ path: newPath, name: fileName });
    } else {
      console.log('Decrypt file failed.', payload.error);
      showToast('Decrypt file failed.', 'error');
      handleClose();
    }

    setIsDecrypting(false);
  }

  useEffect(() => {
    const listener = async msg => {
      if (msg.type === 'decrypted-file') {
        await handleDecrypted(msg.payload);
      }
    };
    nodejs.channel.addListener('message', listener);

    return () => {
      nodejs.channel.removeListener('message', listener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
                </HStack>
              </VStack>

              <HStack mt="1" justifyContent="space-between" alignItems="center">
                <IconButton
                  icon={<Icon name="chevron-back-outline" color={colors.text} />}
                  onPress={onPrevious}
                  isDisabled={!hasPrevious}
                />
                <IconButton
                  icon={<Icon name="chevron-forward-outline" color={colors.text} />}
                  onPress={onNext}
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
