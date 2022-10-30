import { Button, VStack } from 'native-base';
import React from 'react';

import useColors from '../hooks/useColors';
import { routeNames } from '../router/routes';
import { useStore } from '../store/store';
import FoldersEmptyState from './FoldersEmptyState';
import FoldersList from './FoldersList';
import Icon from './Icon';

function RootFolders({ navigation, rootFolders }) {
  const colors = useColors();
  const password = useStore(state => state.activePassword);

  function handleAddFolder() {
    navigation.navigate(routeNames.folderForm, { folder: null });
  }

  function renderFolders() {
    if (!rootFolders.length) {
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
        <FoldersList folders={rootFolders} navigate={navigation.push} />
      </VStack>
    );
  }

  return <VStack space="sm">{renderFolders()}</VStack>;
}

export default RootFolders;
