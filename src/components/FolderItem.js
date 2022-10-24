import { Pressable, Text } from 'native-base';
import React from 'react';

import useColors from '../hooks/useColors';
import { routeNames } from '../router/routes';
import { useStore } from '../store/store';

function FolderItem({ folder, navigate }) {
  const colors = useColors();
  const password = useStore(state => state.activePassword);
  const defaultFolder = useStore(state => state.defaultFolder);

  async function handleOpenFolder() {
    navigate(routeNames.folder, { path: folder.path });
  }

  return (
    <Pressable
      borderWidth={folder.name === defaultFolder ? '3' : '2'}
      borderColor={folder.name === defaultFolder ? colors.orange : 'blue.400'}
      borderTopRightRadius="xl"
      p="2"
      w="20"
      h="24"
      mb="2"
      onPress={() => {
        if (password) {
          handleOpenFolder();
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
  );
}

export default FolderItem;
