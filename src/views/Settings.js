import Clipboard from '@react-native-clipboard/clipboard';
import {
  Box,
  Button,
  Divider,
  Heading,
  HStack,
  Image,
  Link,
  Popover,
  Text,
  useToast,
  VStack,
} from 'native-base';
import React, { useEffect, useState } from 'react';
import { Linking } from 'react-native';
import DeviceInfoModule from 'react-native-device-info';
import RNFS from 'react-native-fs';

import paypal from '../assets/paypal.png';
import AppBar from '../components/AppBar';
import ContentWrapper from '../components/ContentWrapper';
import Icon from '../components/Icon';
import PlatformWrapper from '../components/PlatformWrapper';
import useColors from '../hooks/useColors';
import { appStoreLink, myEmail, platforms } from '../lib/constants';
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
      <ContentWrapper>
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

          <HStack space="1">
            <Text>Enjoying the app?</Text>
            <Link href={getStoreLink()}>Give it 5 stars!</Link>
          </HStack>

          <HStack space="1" alignItems="center">
            <Text>And recommend it to</Text>
            <Popover
              trigger={triggerProps => {
                return (
                  <Text underline {...triggerProps}>
                    friends
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

          <Link href="https://www.peng.kiwi/precloud">What is it?</Link>
          <Link href="https://github.com/penghuili/PreCloud">Source code</Link>
          <Link href="https://github.com/penghuili/PreCloud/blob/master/PRIVACYPOLICY.md#precloud---encrypt-before-upload">
            Privacy policy
          </Link>

          <Text>
            {DeviceInfoModule.getVersion()}({DeviceInfoModule.getBuildNumber()})
          </Text>

          <PlatformWrapper for={platforms.android}>
            <Divider />

            <VStack space="sm" mt="4">
              <Text>Support me</Text>
              <Link href="https://paypal.me/penghuili/">
                <Image source={paypal} alt="Support with Paypal" />
              </Link>
              <Box h="8" />
            </VStack>
          </PlatformWrapper>
        </VStack>
      </ContentWrapper>
    </>
  );
}

export default Settings;
