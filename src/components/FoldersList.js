import { HStack } from 'native-base';
import React from 'react';

import FolderItem from './FolderItem';

function FoldersList({ folders, navigate }) {
  if (!folders?.length) {
    return null;
  }

  return (
    <>
      <HStack space="2" flexWrap="wrap" w="full">
        {folders.map(folder => (
          <FolderItem key={folder.path} folder={folder} navigate={navigate} />
        ))}
      </HStack>
    </>
  );
}

export default FoldersList;
