import { Button, Modal, Text, VStack } from 'native-base';
import React, { useEffect, useState } from 'react';

import useColors from '../hooks/useColors';
import { routeNames } from '../router/routes';
import { useStore } from '../store/store';

function NotebookPicker({ isOpen, onClose, onSave, navigate, notebook }) {
  const colors = useColors();
  const notebooks = useStore(state => state.notebooks);

  const [innerNotebooks, setInnerNotebooks] = useState([]);
  const [selectedNotebook, setSelectedNotebook] = useState(null);

  useEffect(() => {
    setInnerNotebooks(notebooks?.filter(n => n.name !== notebook?.name));
  }, [notebooks, notebook]);

  function handleClose() {
    onClose();
  }

  function renderNotebooks() {
    if (!innerNotebooks?.length) {
      return (
        <Text>
          You don&lsquo;t have notebook yet,{' '}
          <Text
            underline
            onPress={() => {
              handleClose();
              navigate(routeNames.notebookForm);
            }}
          >
            create one
          </Text>
        </Text>
      );
    }

    return (
      <VStack>
        {innerNotebooks.map(notebook => (
          <Text
            key={notebook.name}
            my="1"
            color={notebook.name === selectedNotebook?.name ? colors.primary : colors.text}
            onPress={() => setSelectedNotebook(notebook)}
          >
            {notebook.name}
          </Text>
        ))}
      </VStack>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <Modal.Content maxWidth="400px">
        <Modal.Header>Move to ...</Modal.Header>
        <Modal.Body>{renderNotebooks()}</Modal.Body>
        <Modal.Footer>
          <Button.Group space={2}>
            <Button variant="ghost" onPress={handleClose}>
              Cancel
            </Button>
            <Button
              isDisabled={!selectedNotebook}
              onPress={() => {
                onSave(selectedNotebook);
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

export default NotebookPicker;
