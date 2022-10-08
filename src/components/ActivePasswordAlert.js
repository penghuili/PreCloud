import { Box, Text } from 'native-base';
import React from 'react';

import { routeNames } from '../router/routes';
import { useStore } from '../store/store';

function ActivePasswordAlert({ navigate }) {
  const activePasswordLabel = useStore(state => state.activePasswordLabel);

  if (activePasswordLabel) {
    return (
      <Box w="full" borderBottomWidth={1} borderColor="gray.200" pb="2" mb="8">
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

  return null;
}

export default ActivePasswordAlert;
