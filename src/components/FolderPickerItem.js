import { Box, HStack, Text, VStack } from 'native-base';
import React, { useEffect, useState } from 'react';

import useColors from '../hooks/useColors';
import { readFiles } from '../lib/files';
import Icon from './Icon';

function FolderPickerItem({ folder, selectedPath, onPress }) {
  const colors = useColors();

  const [subfolders, setSubfolders] = useState([]);

  useEffect(() => {
    readFiles(folder.path).then(result => {
      setSubfolders(result.folders);
    });
  }, [folder]);

  return (
    <VStack>
      <HStack>
        <Text
          my="1"
          color={folder.path === selectedPath ? colors.primary : colors.text}
          onPress={() => onPress(folder)}
          flex="1"
          numberOfLines={1}
        >
          {folder.name}
        </Text>
        {subfolders.length > 0 && (
          <Icon name="chevron-down-outline" size={16} color={colors.text} />
        )}
      </HStack>
      {subfolders.length > 0 && (
        <Box pl="2" borderLeftWidth="1" borderColor="gray.300">
          {subfolders.map(sf => (
            <FolderPickerItem
              key={sf.path}
              folder={sf}
              selectedPath={selectedPath}
              onPress={onPress}
            />
          ))}
        </Box>
      )}
    </VStack>
  );
}

export default FolderPickerItem;
