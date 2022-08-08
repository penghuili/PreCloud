import { Avatar, Link, ScrollView, Text, VStack } from 'native-base';
import React from 'react';
import DeviceInfoModule from 'react-native-device-info';

import logo from '../assets/logo.png';
import AppBar from '../components/AppBar';

function Settings() {
  return (
    <>
      <AppBar title="Settings" />
      <ScrollView px={4} py={4}>
        <VStack space="sm" alignItems="flex-start">
          <Avatar source={logo} size="xl" />
          <Link href="https://github.com/penghuili/PreCloud/blob/master/PRIVACYPOLICY.md#precloud---encrypt-before-upload">
            Privacy policy
          </Link>
          <Text>
            {DeviceInfoModule.getVersion()}({DeviceInfoModule.getBuildNumber()})
          </Text>
        </VStack>
      </ScrollView>
    </>
  );
}

export default Settings;
