import { Button, HStack, Pressable, Text, VStack } from 'native-base';
import React, { useEffect } from 'react';

import useColors from '../hooks/useColors';
import { readNotebooks } from '../lib/files/note';
import { routeNames } from '../router/routes';
import { useStore } from '../store/store';
import Icon from './Icon';

function Notebooks({ navigation }) {
  const colors = useColors();
  const password = useStore(state => state.activePassword);
  const notebooks = useStore(state => state.notebooks);
  const setNotebooks = useStore(state => state.setNotebooks);
  const setActiveNotebook = useStore(state => state.setActiveNotebook);
  const setNotes = useStore(state => state.setNotes);

  useEffect(() => {
    readNotebooks().then(value => {
      setNotebooks(value);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleOpenNotebook(notebook) {
    setActiveNotebook(notebook);
    setNotes([]);
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
      <VStack space="sm" alignItems="flex-start">
        <Button
          onPress={handleAddNotebook}
          isDisabled={!password}
          startIcon={<Icon name="add-outline" color={colors.white} size={16} />}
          variant="solid"
          size="xs"
        >
          Create new notebook
        </Button>
        <HStack space="2" flexWrap="wrap" w="full">
          {notebooks.map(notebook => (
            <Pressable
              key={notebook.path}
              borderWidth="2"
              borderColor="yellow.400"
              borderBottomRightRadius="md"
              borderTopRightRadius="md"
              p="2"
              w="20"
              h="24"
              mb="2"
              onPress={() => {
                if (password) {
                  handleOpenNotebook(notebook);
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

  return (
    <VStack space="sm">
      {renderNotebooks()}
    </VStack>
  );
}

export default Notebooks;
