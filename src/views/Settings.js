import Clipboard from '@react-native-clipboard/clipboard';
import {
  Button,
  Divider,
  Heading,
  HStack,
  Link,
  Popover,
  ScrollView,
  Text,
  useToast,
  VStack,
} from 'native-base';
import React, { useEffect, useState } from 'react';
import { Linking } from 'react-native';
import DeviceInfoModule from 'react-native-device-info';
import RNFS from 'react-native-fs';

import AppBar from '../components/AppBar';
import Icon from '../components/Icon';
import useColors from '../hooks/useColors';
import { appStoreLink, myEmail } from '../lib/constants';
import { getStoreLink } from '../lib/device';
import { bytesToMB, emptyFolder, getFolderSize } from '../lib/files';
import { routeNames } from '../router/Router';

const recommendText = `PreCloud: Encrypt before upload\n\niOS: ${appStoreLink.ios}\n\nAndroid: ${appStoreLink.android}`;

function Settings({ currentRoute }) {
  const colors = useColors();
  const toast = useToast();
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

          <HStack space="xs">
            <Text>Enjoying the app?</Text>
            <Link href={getStoreLink()}>Give it 5 stars!</Link>
          </HStack>

          <HStack space="xs" alignItems="center">
            <Popover
              trigger={triggerProps => {
                return (
                  <Text underline {...triggerProps}>
                    And recommend it to friends
                  </Text>
                );
              }}
            >
              <Popover.Content accessibilityLabel="Delete Customerd" w="56">
                <Popover.Body>{recommendText}</Popover.Body>
                <Popover.Footer justifyContent="flex-end">
                  <Button
                    icon={<Icon name="copy-outline" size={24} />}
                    onPress={() => {
                      Clipboard.setString(recommendText);
                      toast.show({ title: 'Copied!' });
                    }}
                  >
                    Copy
                  </Button>
                </Popover.Footer>
              </Popover.Content>
            </Popover>
          </HStack>

          <VStack>
            <Text>Or write to me, I reply to all emails</Text>
            <Link
              onPress={() => {
                Linking.openURL(`mailto:${myEmail}`);
              }}
            >
              {myEmail}
            </Link>
          </VStack>

          <Divider />

          <Link href="https://www.peng.kiwi/precloud">Website</Link>
          <Link href="https://github.com/penghuili/PreCloud">Source code</Link>
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
