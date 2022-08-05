import { HStack, Text } from 'native-base';
import React from 'react';

import useColors from '../hooks/useColors';

function AppBar({ title }) {
  const colors = useColors();

  return (
    <HStack
      bg={colors.primary}
      px="1"
      py="3"
      justifyContent="space-between"
      alignItems="center"
      w="100%"
      h="16"
    >
      <HStack alignItems="center" px="3">
        <Text color={colors.text} fontSize="20" fontWeight="bold">
          {title}
        </Text>
      </HStack>
    </HStack>
  );
}

export default AppBar;
