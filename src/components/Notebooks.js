import { Button, Heading, HStack, Pressable, Text, VStack } from 'native-base';
import React, { useEffect } from 'react';

import useColors from '../hooks/useColors';
import { notesFolder, readNotebooks, readNotes } from '../lib/files';
import { routeNames } from '../router/routes';
import { useStore } from '../store/store';
import Icon from './Icon';
import NoteItem from './NoteItem';

function EncryptDecryptRichText({ navigation }) {
  const colors = useColors();
  const password = useStore(state => state.activePassword);
  const notebooks = useStore(state => state.notebooks);
  const setNotebooks = useStore(state => state.setNotebooks);
  const setActiveNotebook = useStore(state => state.setActiveNotebook);
  const legacyNotes = useStore(state => state.legacyNotes);
  const setLegacyNotes = useStore(state => state.setLegacyNotes);

  useEffect(() => {
    readNotebooks().then(value => {
      setNotebooks(value);
    });
    readNotes(notesFolder).then(result => {
      setLegacyNotes(result);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleOpen(notebook) {
    setActiveNotebook(notebook);
    navigation.navigate(routeNames.notebook);
  }

  function handleAddNotebook() {
    navigation.navigate(routeNames.notebookForm, { notebook: null });
  }

  function renderNotebooks() {
    if (!notebooks.length) {
      return (
        <VStack space="sm" alignItems="center">
          <Text>Create your first notebook.</Text>
          <Button onPress={handleAddNotebook} isDisabled={!password} size="sm">
            Create notebook
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
          Add new notebook
        </Button>
        <HStack space="sm" flexWrap="wrap" w="full">
          {notebooks.map(notebook => (
            <Pressable
              key={notebook.path}
              borderWidth="1"
              borderColor="yellow.400"
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
    if (!legacyNotes.length) {
      return null;
    }

    return (
      <>
        <Heading size="sm" mt="10">
          You can move these notes to notebooks:
        </Heading>
        {legacyNotes.map(note => (
          <NoteItem key={note.path} navigation={navigation} note={note} notebook={null} />
        ))}
      </>
    );
  }

  return (
    <VStack space="sm">
      {renderNotebooks()}
      {renderLegacyNotes()}
    </VStack>
  );
}

export default EncryptDecryptRichText;
