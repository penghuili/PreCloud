import Clipboard from '@react-native-clipboard/clipboard';
import { Actionsheet, Button, Modal, Text } from 'native-base';
import React, { useState } from 'react';

import useColors from '../hooks/useColors';
import { downloadRemoteFile } from '../lib/files/actions';
import { showToast } from '../lib/toast';
import Icon from './Icon';

function DownloadRemoteFileButton({ isDisabled, isLoading, onClose, onStart, onDownloaded }) {
  const colors = useColors();

  const [showModal, setShowModal] = useState(false);
  const [url, setUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  async function handlePress() {
    setIsDownloading(true);
    const file = await downloadRemoteFile(url);

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
      <Actionsheet.Item
        isLoading={isLoading}
        isDisabled={isDisabled || isLoading}
        startIcon={<Icon name="cloud-download-outline" color={colors.text} />}
        onPress={() => {
          setShowModal(true);
          onClose();
        }}
      >
        Download remote files
      </Actionsheet.Item>

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
