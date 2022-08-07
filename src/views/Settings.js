import { ScrollView, Text, VStack } from 'native-base';
import React from 'react';
import DeviceInfoModule from 'react-native-device-info';

import AppBar from '../components/AppBar';

function Settings() {
  return (
    <>
      <AppBar title="Settings" />
      <ScrollView px={4} py={4}>
        <VStack space="sm" alignItems="center">
          <Text>{DeviceInfoModule.getVersion()}</Text>
        </VStack>
      </ScrollView>
    </>
  );
}

export default Settings;
