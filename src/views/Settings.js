import { Button, Heading, HStack, Link, ScrollView, Text, VStack } from 'native-base';
import React, { useEffect, useState } from 'react';
import DeviceInfoModule from 'react-native-device-info';
import RNFS from 'react-native-fs';
import { Linking } from 'react-native';

import AppBar from '../components/AppBar';
import { bytesToMB, emptyFolder, getFolderSize } from '../lib/files';
import { routeNames } from '../router/Router';
import { myEmail } from '../lib/constants';
import { getStoreLink } from '../lib/device';

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
          <Heading size="sm" color="primary.400">
            Open source, no tracking and free forever.
          </Heading>

          <HStack alignItems="center" space="sm">
            <Text>Cache: {cacheSize}MB</Text>
            {cacheSize > 0 && (
              <Button size="sm" onPress={handleClearCache}>
                Clear cache
              </Button>
            )}
          </HStack>

          <Link href="https://github.com/penghuili/PreCloud#precloud---encrypt-before-upload">
            Home
          </Link>
          <Link href="https://github.com/penghuili/PreCloud">Source code</Link>
          <Link href="https://github.com/penghuili/PreCloud/blob/master/PRIVACYPOLICY.md#precloud---encrypt-before-upload">
            Privacy policy
          </Link>
          <VStack>
            <Text>Write to me, I reply to all emails</Text>
            <Link
              onPress={() => {
                Linking.openURL(`mailto:${myEmail}`);
              }}
            >
              {myEmail}
            </Link>
          </VStack>

          <Text>
            Enjoying the app? <Link href={getStoreLink()}>Give it 5 star!</Link>
          </Text>

          <Text>
            {DeviceInfoModule.getVersion()}({DeviceInfoModule.getBuildNumber()})
          </Text>
        </VStack>
      </ScrollView>
    </>
  );
}

export default Settings;
