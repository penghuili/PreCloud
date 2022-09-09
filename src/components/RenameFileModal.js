import { Button, FormControl, Input, Modal, Text } from 'native-base';
import React, { useState } from 'react';

function RenameFileModal({ fileName, extension, isOpen, onClose, onSave }) {
  const [innerFileName, setInnerFileName] = useState('');

  function handleClose() {
    onClose();
    setInnerFileName('');
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <Modal.Content maxWidth="400px">
        <Modal.CloseButton />
        <Modal.Header>Change file name</Modal.Header>
        <Modal.Body>
          <FormControl>
            <FormControl.Label>Current name:</FormControl.Label>
            <FormControl.Label>{fileName}</FormControl.Label>
            <Input value={innerFileName} onChangeText={setInnerFileName} InputRightElement={<Text color="muted.400">{extension}</Text>} />
          </FormControl>
        </Modal.Body>
        <Modal.Footer>
          <Button.Group space={2}>
            <Button variant="ghost" onPress={handleClose}>
              Cancel
            </Button>
            <Button
              onPress={() => {
                onSave(innerFileName);
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

export default RenameFileModal;
