import { Button, Text, VStack } from 'native-base';
import React from 'react';

import { routeNames } from '../router/routes';
import { useStore } from '../store/store';

function FoldersEmptyState({ navigate }) {
  const password = useStore(state => state.activePassword);

  function handleAddFolder() {
    navigate(routeNames.folderForm, { folder: null, goBackAfterCreation: true });
  }

  return (
    <VStack space="sm" alignItems="center">
      <Text>Create your first folder, then you can encrypt and save files to it.</Text>
      <Button onPress={handleAddFolder} isDisabled={!password} size="sm">
        Create folder
      </Button>
    </VStack>
  );
}

export default FoldersEmptyState;
