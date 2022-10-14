import { Alert, Box, Button, Text, VStack } from 'native-base';
import React from 'react';

import { routeNames } from '../router/routes';
import { useStore } from '../store/store';

function PasswordAlert({ navigate }) {
  const isLoadingPasswords = useStore(state => state.isLoadingPasswords);
  const activePasswordLabel = useStore(state => state.activePasswordLabel);

  if (isLoadingPasswords) {
    return null;
  }

  if (!activePasswordLabel) {
    return (
      <Alert w="100%" status="info" mb="4">
        <VStack space={2} flexShrink={1} w="100%" alignItems="center">
          <Text fontSize="md" fontWeight="medium">
            Setup your password first
          </Text>
          <Button onPress={() => navigate(routeNames.passwords)}>Add now</Button>
        </VStack>
      </Alert>
    );
  }

  return (
    <Box w="full" borderBottomWidth={1} borderColor="gray.200" pb="2" mb="4">
      <Text>
        Active password: <Text highlight> {activePasswordLabel} </Text>{' '}
        <Text
          underline
          onPress={() => {
            navigate(routeNames.passwords);
          }}
        >
          Change
        </Text>
      </Text>
    </Box>
  );
}

export default PasswordAlert;
