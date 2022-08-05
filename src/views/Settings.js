import { Heading, ScrollView, VStack } from 'native-base';
import React from 'react';

import AppBar from '../components/AppBar';

function Settings() {
  return (
    <>
      <AppBar title="Settings" />
      <ScrollView>
        <VStack space="sm" alignItems="center" px={4} py={4}>
          <Heading>Settings</Heading>
        </VStack>
      </ScrollView>
    </>
  );
}

export default Settings;
