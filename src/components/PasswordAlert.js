import { Alert, Button, Text, VStack } from 'native-base';
import React from 'react';

import { routeNames } from '../router/Router';
import { useStore } from '../store/store';

function PasswordAlert({ navigate }) {
  const password = useStore(state => state.activePassword);
  const isLoadingPasswords = useStore(state => state.isLoadingPasswords);

  if (isLoadingPasswords) {
    return null;
  }

  if (!password) {
    return (
      <Alert w="100%" status="info" mb={8}>
        <VStack space={2} flexShrink={1} w="100%" alignItems="center">
          <Text fontSize="md" fontWeight="medium">
            Setup your password first
          </Text>
          <Button onPress={() => navigate(routeNames.passwords)}>Add now</Button>
        </VStack>
      </Alert>
    );
  }

  return null;
}

export default PasswordAlert;
