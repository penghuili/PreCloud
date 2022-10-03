import { Avatar, HStack, IconButton, Text } from 'native-base';
import React from 'react';
import { useWindowDimensions } from 'react-native';

import logo from '../assets/logo.png';
import useColors from '../hooks/useColors';
import { navigationRef } from '../router/navigationRef';
import Icon from './Icon';

function AppBar({ title, hasBack }) {
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
        {hasBack ? (
          <IconButton
            icon={<Icon name="chevron-back-outline" size={16} color={colors.text} />}
            onPress={navigationRef.goBack}
          />
        ) : (
          <Avatar source={logo} size="md" />
        )}

        <Text color={colors.text} fontSize="20" fontWeight="bold" isTruncated width={width - 72}>
          {title}
        </Text>
      </HStack>
    </HStack>
  );
}

export default AppBar;
