import { Avatar, Box, HStack, Text } from 'native-base';
import React from 'react';

import useColors from '../hooks/useColors';
import logo from '../assets/logo.png';
import { useWindowDimensions } from 'react-native';

function AppBar({ title }) {
  const colors = useColors();
  const { width } = useWindowDimensions();

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
        <Avatar source={logo} size="md" />
        <Box>
          <Text color={colors.text} fontSize="20" fontWeight="bold" isTruncated width={width - 72}>
            {title}
          </Text>
        </Box>
      </HStack>
    </HStack>
  );
}

export default AppBar;
