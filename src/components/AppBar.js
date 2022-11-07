import { Avatar, HStack, IconButton, Text } from 'native-base';
import React from 'react';
import { useWindowDimensions } from 'react-native';

import logo from '../assets/logo.png';
import useColors from '../hooks/useColors';
import { navigationRef } from '../router/navigationRef';
import { routeNames } from '../router/routes';
import Icon from './Icon';

function AppBar({ title, hasBack, rightIconName, onRightIconPress }) {
  const colors = useColors();
  const { width } = useWindowDimensions();

  function handleGoBack() {
    if (navigationRef.canGoBack()) {
      navigationRef.goBack();
    } else {
      navigationRef.navigate('BottomTab', { screen: routeNames.folders });
    }
  }

  return (
    <HStack
      bg={colors.primary}
      px="2"
      justifyContent="space-between"
      alignItems="center"
      w="full"
      h="10"
    >
      <HStack alignItems="center">
        {hasBack ? (
          <IconButton
            size="10"
            icon={<Icon name="chevron-back-outline" size={24} color={colors.text} />}
            onPress={handleGoBack}
          />
        ) : (
          <Avatar source={logo} size="9" mr="2" />
        )}

        <Text
          color={colors.text}
          fontSize="md"
          fontWeight="bold"
          isTruncated
          width={width - 16 - 40 - 40}
        >
          {title}
        </Text>
      </HStack>
      {!!rightIconName && (
        <IconButton
          size="10"
          icon={<Icon name={rightIconName} size={24} color={colors.text} />}
          onPress={onRightIconPress}
        />
      )}
    </HStack>
  );
}

export default AppBar;
