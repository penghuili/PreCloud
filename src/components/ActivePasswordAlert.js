import { Alert, Button, Text, VStack } from 'native-base';
import React from 'react';

import { routeNames } from '../router/Router';
import { useStore } from '../store/store';

function ActivePasswordAlert({ navigate }) {
  const activePasswordLabel = useStore(state => state.activePasswordLabel);

  if (activePasswordLabel) {
    return (
      <Alert w="100%" status="info" mb={8}>
        <VStack space={2} flexShrink={1} w="100%" alignItems="center">
          <Text>
            You are using the <Text highlight>{activePasswordLabel}</Text> password to encrypt and decrypt.
          </Text>
          <Button size="sm" onPress={() => navigate(routeNames.passwords)}>Change</Button>
        </VStack>
      </Alert>
    );
  }

  return null;
}

export default ActivePasswordAlert;
