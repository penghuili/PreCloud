import { Avatar, HStack, IconButton, Text } from 'native-base';
import React from 'react';
import { useWindowDimensions } from 'react-native';

import logo from '../assets/logo.png';
import useColors from '../hooks/useColors';
import { navigationRef } from '../router/navigationRef';
import Icon from './Icon';

function AppBar({ title, hasBack, rightIconName, onRightIconPress }) {
  const colors = useColors();
  const { width } = useWindowDimensions();

  return (
    <HStack
      bg={colors.primary}
      px="2"
      py="3"
      justifyContent="space-between"
      alignItems="center"
      w="full"
      h="16"
    >
      <HStack alignItems="center">
        {hasBack ? (
          <IconButton
            icon={<Icon name="chevron-back-outline" size={20} color={colors.text} />}
            onPress={navigationRef.goBack}
          />
        ) : (
          <Avatar source={logo} size="10" mr="2" />
        )}

        <Text color={colors.text} fontSize="20" fontWeight="bold" isTruncated width={width - 96}>
          {title}
        </Text>
      </HStack>
      {!!rightIconName && (
        <IconButton
          icon={<Icon name={rightIconName} size={20} color={colors.text} />}
          onPress={onRightIconPress}
        />
      )}
    </HStack>
  );
}

export default AppBar;
