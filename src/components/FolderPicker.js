import { Button, Modal, Text, VStack } from 'native-base';
import React, { useState } from 'react';

import { routeNames } from '../router/routes';
import { useStore } from '../store/store';
import FolderPickerItem from './FolderPickerItem';

function FolderPicker({ isOpen, onClose, onSave, navigate, currentFolder }) {
  const rootFolders = useStore(state => state.rootFolders);

  const [selectedFolder, setSelectedFolder] = useState(null);

  function handleClose() {
    onClose();
  }

  function renderFolders() {
    if (!rootFolders?.length) {
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
        {rootFolders.map(f => (
          <FolderPickerItem
            key={f.path}
            folder={f}
            selectedPath={selectedFolder?.path}
            currentFolder={currentFolder}
            onPress={selected => setSelectedFolder(selected)}
          />
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
                if (selectedFolder?.path !== currentFolder?.path) {
                  onSave(selectedFolder);
                }
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
