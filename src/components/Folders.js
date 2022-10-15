import { Button, HStack, Pressable, Text, VStack } from 'native-base';
import React, { useEffect } from 'react';

import useColors from '../hooks/useColors';
import { readFilesFolders } from '../lib/files';
import { routeNames } from '../router/routes';
import { useStore } from '../store/store';
import Icon from './Icon';

function Folders({ navigation }) {
  const colors = useColors();
  const password = useStore(state => state.activePassword);
  const folders = useStore(state => state.folders);
  const setFolders = useStore(state => state.setFolders);
  const setActiveFolder = useStore(state => state.setActiveFolder);
  const setFiles = useStore(state => state.setFiles);

  useEffect(() => {
    readFilesFolders().then(value => {
      setFolders(value);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleOpenFolder(folder) {
    setActiveFolder(folder);
    setFiles([]);
    navigation.navigate(routeNames.folder);
  }

  function handleAddFolder() {
    navigation.navigate(routeNames.folderForm, { folder: null });
  }

  function renderFolders() {
    if (!folders.length) {
      return (
        <VStack space="sm" alignItems="center">
          <Text>Create your first folder, then you can encrypt and save files to it.</Text>
          <Button onPress={handleAddFolder} isDisabled={!password} size="sm">
            Create folder
          </Button>
        </VStack>
      );
    }

    return (
      <VStack space="sm" alignItems="flex-start">
        <Button
          onPress={handleAddFolder}
          isDisabled={!password}
          startIcon={<Icon name="add-outline" color={colors.white} size={16} />}
          variant="solid"
          size="xs"
        >
          Create new folder
        </Button>
        <HStack space="2" flexWrap="wrap" w="full">
          {folders.map(folder => (
            <Pressable
              key={folder.path}
              borderWidth="2"
              borderColor="blue.400"
              borderTopRightRadius="md"
              p="2"
              w="20"
              h="20"
              mb="2"
              onPress={() => {
                if (password) {
                  handleOpenFolder(folder);
                }
              }}
            >
              <Text numberOfLines={3}>{folder.name}</Text>
            </Pressable>
          ))}
        </HStack>
      </VStack>
    );
  }

  return (
    <VStack space="sm">
      {renderFolders()}
    </VStack>
  );
}

export default Folders;
