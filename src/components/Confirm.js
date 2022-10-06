import { AlertDialog, Button } from 'native-base';
import React from 'react';

function Confirm({ isOpen, title, message, onClose, onConfirm, isDanger }) {
  return (
    <AlertDialog isOpen={isOpen}>
      <AlertDialog.Content>
        {!!title && <AlertDialog.Header>Delete password</AlertDialog.Header>}

        <AlertDialog.Body>{message}</AlertDialog.Body>
        <AlertDialog.Footer>
          <Button.Group space={2}>
            <Button variant="ghost" onPress={onClose}>
              Cancel
            </Button>
            <Button colorScheme={isDanger ? 'danger' : 'primary'} onPress={onConfirm}>
              Ok
            </Button>
          </Button.Group>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog>
  );
}

export default Confirm;
