import { Button, HStack, Pressable, Text, VStack } from 'native-base';
import React, { useEffect } from 'react';

import useColors from '../hooks/useColors';
import { routeNames } from '../router/routes';
import { useStore } from '../store/store';
import FoldersEmptyState from './FoldersEmptyState';
import Icon from './Icon';

function Folders({ navigation }) {
  const colors = useColors();
  const password = useStore(state => state.activePassword);
  const folders = useStore(state => state.folders);
  const defaultFolder = useStore(state => state.defaultFolder);
  const getFolders = useStore(state => state.getFolders);
  const setActiveFolder = useStore(state => state.setActiveFolder);
  const setFiles = useStore(state => state.setFiles);

  useEffect(() => {
    getFolders();
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
      return <FoldersEmptyState navigate={navigation.navigate} />;
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
              borderWidth={folder.name === defaultFolder ? '3' : '2'}
              borderColor={folder.name === defaultFolder ? colors.orange : 'blue.400'}
              borderTopRightRadius="xl"
              p="2"
              w="20"
              h="24"
              mb="2"
              onPress={() => {
                if (password) {
                  handleOpenFolder(folder);
                }
              }}
            >
              <Text numberOfLines={3} flex="1">
                {folder.name}
              </Text>
              {folder.name === defaultFolder && (
                <Text fontSize="8" color="gray.400">
                  Default
                </Text>
              )}
            </Pressable>
          ))}
        </HStack>
      </VStack>
    );
  }

  return <VStack space="sm">{renderFolders()}</VStack>;
}

export default Folders;
