import { Button, Heading, HStack, Pressable, Text, VStack } from 'native-base';
import React, { useEffect, useState } from 'react';

import useColors from '../hooks/useColors';
import { notesFolder, readNotebooks, readNotes } from '../lib/files';
import { routeNames } from '../router/routes';
import { useStore } from '../store/store';
import Icon from './Icon';
import Note from './Note';

function EncryptDecryptRichText({ navigation }) {
  const colors = useColors();
  const password = useStore(state => state.activePassword);
  const notebooks = useStore(state => state.notebooks);
  const setNotebooks = useStore(state => state.setNotebooks);

  const [notes, setNotes] = useState([]);

  useEffect(() => {
    readNotebooks().then(value => {
      setNotebooks(value);
    });
    readNotes(notesFolder).then(result => {
      setNotes(result);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleOpen(notebook) {
    navigation.navigate(routeNames.notebook, { notebook });
  }

  function handleAddNotebook() {
    navigation.navigate(routeNames.notebookForm);
  }

  function renderNotebooks() {
    if (!notebooks.length) {
      return (
        <VStack space="sm" alignItems="center">
          <Text>Create your first notebook.</Text>
          <Button onPress={handleAddNotebook} isDisabled={!password} size="sm">
            Add notebook
          </Button>
        </VStack>
      );
    }

    return (
      <VStack space="sm" alignItems="center">
        <Button
          onPress={handleAddNotebook}
          isDisabled={!password}
          startIcon={<Icon name="add-outline" color={colors.white} size={16} />}
          variant="solid"
          size="xs"
        >
          New notebook
        </Button>
        <HStack space="sm" flexWrap="wrap" w="full">
          {notebooks.map(notebook => (
            <Pressable
              key={notebook.path}
              borderWidth="1"
              borderColor="gray.200"
              borderBottomRightRadius="md"
              borderTopRightRadius="md"
              p="2"
              w="20"
              h="24"
              onPress={() => {
                if (password) {
                  handleOpen({ name: notebook.name, path: notebook.path });
                }
              }}
            >
              <Text numberOfLines={3}>{notebook.name}</Text>
            </Pressable>
          ))}
        </HStack>
      </VStack>
    );
  }

  function renderLegacyNotes() {
    if (!notes.length) {
      return null;
    }

    return (
      <>
        <Heading size="sm" mt="6">
          You can move these notes to notebooks:
        </Heading>
        {notes.map(note => (
          <Note
            key={note.path}
            navigation={navigation}
            note={note}
            notebook={null}
            onMove={() => {
              readNotes(notesFolder).then(result => {
                setNotes(result);
              });
            }}
          />
        ))}
      </>
    );
  }

  return (
    <VStack px={2} space="sm">
      {renderNotebooks()}
      {renderLegacyNotes()}
    </VStack>
  );
}

export default EncryptDecryptRichText;
