import Clipboard from '@react-native-clipboard/clipboard';
import { Button, IconButton, Modal, Spinner, Text } from 'native-base';
import React, { useState } from 'react';

import useColors from '../hooks/useColors';
import { downloadRemoteFile } from '../lib/files/actions';
import { showToast } from '../lib/toast';
import Icon from './Icon';

function DownloadRemoteFileButton({ isDisabled, isLoading, onStart, onDownloaded }) {
  const colors = useColors();

  const [showModal, setShowModal] = useState(false);
  const [url, setUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  async function handlePress() {
    setIsDownloading(true);
    const file = await downloadRemoteFile(url);

    console.log(file);
    if (file) {
      handleClose();
      showToast('Downloaded! Encrypting ...');
      setIsDownloading(false);
      onStart(true);
      await onDownloaded(file);
      onStart(false);
    } else {
      showToast('Download file failed', 'error');
      setIsDownloading(false);
    }
  }

  function handleClose() {
    setShowModal(false);
    setUrl('');
    setIsDownloading(false);
  }

  return (
    <>
      <IconButton
        icon={
          isLoading ? (
            <Spinner size={32} />
          ) : (
            <Icon name="cloud-download-outline" size={32} color={colors.white} />
          )
        }
        size="md"
        variant="solid"
        mr="2"
        isLoading={isLoading}
        isDisabled={isDisabled || isLoading}
        onPress={() => setShowModal(true)}
      />

      <Modal isOpen={showModal} onClose={handleClose}>
        <Modal.Content maxWidth="400px">
          <Modal.Header>Download and encrypt file from web</Modal.Header>
          <Modal.Body>
            <Button
              onPress={async () => {
                const copied = await Clipboard.getString();
                if (copied) {
                  setUrl(copied);
                }
              }}
            >
              Paste file url
            </Button>
            {!!url && <Text>{url}</Text>}
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button variant="ghost" onPress={handleClose}>
                Cancel
              </Button>
              <Button
                isDisabled={!url || isDownloading}
                isLoading={isDownloading}
                onPress={handlePress}
              >
                Download and encrypt
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </>
  );
}

export default DownloadRemoteFileButton;
