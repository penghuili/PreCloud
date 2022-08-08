import { Heading, HStack, Link, ScrollView, Text, VStack } from 'native-base';
import React from 'react';
import DeviceInfoModule from 'react-native-device-info';

import AppBar from '../components/AppBar';

function Settings() {
  return (
    <>
      <AppBar title="Settings" />
      <ScrollView px={4} py={4}>
        <VStack space="lg" alignItems="flex-start">
          <Heading>PreCloud: Encrypt before upload</Heading>
          <Link href="https://github.com/penghuili/PreCloud#precloud---encrypt-before-upload">
            Home
          </Link>
          <Link href="https://github.com/penghuili/PreCloud">Source code</Link>
          <Link href="https://github.com/penghuili/PreCloud/blob/master/PRIVACYPOLICY.md#precloud---encrypt-before-upload">
            Privacy policy
          </Link>
          <HStack>
            <Text>Contact: </Text>
            <Text selectable>peng@duck.com</Text>
          </HStack>
          <Text>
            {DeviceInfoModule.getVersion()}({DeviceInfoModule.getBuildNumber()})
          </Text>
        </VStack>
      </ScrollView>
    </>
  );
}

export default Settings;
