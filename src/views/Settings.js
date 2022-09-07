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
import React from 'react';
import { Linking } from 'react-native';
import DeviceInfoModule from 'react-native-device-info';

import paypal from '../assets/paypal.png';
import AppBar from '../components/AppBar';
import Caches from '../components/Caches';
import ContentWrapper from '../components/ContentWrapper';
import Icon from '../components/Icon';
import PlatformToggle from '../components/PlatformToggle';
import useColors from '../hooks/useColors';
import { appStoreLink, myEmail, platforms } from '../lib/constants';
import { getStoreLink } from '../lib/device';

const recommendText = `PreCloud: Encrypt before upload\n\niOS: ${appStoreLink.ios}\n\nAndroid: ${appStoreLink.android}`;

function Settings({ currentRoute }) {
  const colors = useColors();
  const toast = useToast();

  return (
    <>
      <AppBar title="Settings" />
      <ContentWrapper>
        <VStack space="lg" alignItems="flex-start">
          <Heading>PreCloud: Encrypt before upload</Heading>
          <Heading size="sm" color="primary.400">
            Open source, no tracking and free forever.
          </Heading>

          <Divider />

          <Caches currentRoute={currentRoute} />

          <Divider />

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
                    icon={<Icon name="copy-outline" color={colors.text} />}
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

          <HStack space="1">
            <Text>Or join the</Text>
            <Link href="https://www.getrevue.co/profile/precloud">newsletter</Link>
          </HStack>

          <HStack space="1">
            <Text>Or join the</Text>
            <Link href="https://t.me/precloudapp">Telegram channel</Link>
          </HStack>

          <Divider />

          <Link href="https://www.peng.kiwi/precloud">What is it?</Link>
          <Link href="https://github.com/penghuili/PreCloud">Source code</Link>
          <Link href="https://github.com/penghuili/PreCloud/blob/master/PRIVACYPOLICY.md#precloud---encrypt-before-upload">
            Privacy policy
          </Link>

          <Text>
            {DeviceInfoModule.getVersion()}({DeviceInfoModule.getBuildNumber()})
          </Text>

          <PlatformToggle for={platforms.android}>
            <Divider />

            <VStack space="sm" mt="4">
              <Text>Support me</Text>
              <Link href="https://paypal.me/penghuili/">
                <Image source={paypal} alt="Support with Paypal" />
              </Link>
              <Box h="8" />
            </VStack>
          </PlatformToggle>
        </VStack>
      </ContentWrapper>
    </>
  );
}

export default Settings;
