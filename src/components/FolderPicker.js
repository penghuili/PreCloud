import { Button, Modal, Text, VStack } from 'native-base';
import React, { useMemo, useState } from 'react';

import useColors from '../hooks/useColors';
import { routeNames } from '../router/routes';
import { useStore } from '../store/store';

function FolderPicker({ isOpen, onClose, onSave, navigate, folder }) {
  const colors = useColors();
  const folders = useStore(state => state.folders);
  const innerFolders = useMemo(() => {
    return folders?.filter(f => f.name !== folder?.name);
  }, [folders, folder]);

  const [selectedFolder, setSelectedFolder] = useState(null);

  function handleClose() {
    onClose();
  }

  function renderFolders() {
    if (!innerFolders?.length) {
      return (
        <Text>
          You don&lsquo;t have other folder yet,{' '}
          <Text
            underline
            onPress={() => {
              handleClose();
              navigate(routeNames.folderForm, { folder: null });
            }}
          >
            Create one
          </Text>
        </Text>
      );
    }

    return (
      <VStack>
        {innerFolders.map(f => (
          <Text
            key={f.name}
            my="1"
            color={f.name === selectedFolder?.name ? colors.primary : colors.text}
            onPress={() => setSelectedFolder(f)}
          >
            {f.name}
          </Text>
        ))}
      </VStack>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <Modal.Content maxWidth="400px">
        <Modal.Header>Move to ...</Modal.Header>
        <Modal.Body>{renderFolders()}</Modal.Body>
        <Modal.Footer>
          <Button.Group space={2}>
            <Button variant="ghost" onPress={handleClose}>
              Cancel
            </Button>
            <Button
              isDisabled={!selectedFolder}
              onPress={() => {
                onSave(selectedFolder);
                handleClose();
              }}
            >
              Save
            </Button>
          </Button.Group>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
}

export default FolderPicker;
