import { Button, Heading, HStack, Link, ScrollView, Text, VStack } from 'native-base';
import React, { useEffect, useState } from 'react';
import DeviceInfoModule from 'react-native-device-info';
import RNFS from 'react-native-fs';

import AppBar from '../components/AppBar';
import { bytesToMB, emptyFolder, getFolderSize } from '../lib/files';
import { routeNames } from '../router/Router';

function Settings({ currentRoute }) {
  const [cacheSize, setCacheSize] = useState(0);

  useEffect(() => {
    if (currentRoute === routeNames.settings) {
      getFolderSize(RNFS.CachesDirectoryPath).then(size => {
        setCacheSize(bytesToMB(size));
      });
    }
  }, [currentRoute]);

  async function handleClearCache() {
    await emptyFolder(RNFS.CachesDirectoryPath);
    const newSize = await getFolderSize(RNFS.CachesDirectoryPath);
    setCacheSize(bytesToMB(newSize));
  }

  return (
    <>
      <AppBar title="Settings" />
      <ScrollView px={4} py={4} keyboardShouldPersistTaps="handled">
        <VStack space="lg" alignItems="flex-start">
          <Heading>PreCloud: Encrypt before upload</Heading>

          <HStack alignItems="center" space="sm">
            <Text>Cache: {cacheSize}MB</Text>
            {cacheSize > 0 && <Button size="sm" onPress={handleClearCache}>Clear cache</Button>}
          </HStack>

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
