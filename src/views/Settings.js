import Clipboard from '@react-native-clipboard/clipboard';
import { format } from 'date-fns';
import { Button, Divider, Heading, HStack, Image, Link, Popover, Text, VStack } from 'native-base';
import React from 'react';
import { Linking } from 'react-native';
import DeviceInfoModule from 'react-native-device-info';

import xiangcai from '../assets/xiangcai.jpeg';
import AppBar from '../components/AppBar';
import Caches from '../components/Caches';
import ContentWrapper from '../components/ContentWrapper';
import DonateMessage from '../components/DonateMessage';
import Icon from '../components/Icon';
import ScreenWrapper from '../components/ScreenWrapper';
import useColors from '../hooks/useColors';
import { appStoreLink, myEmail } from '../lib/constants';
import { getStoreLink } from '../lib/device';
import { showDonate } from '../lib/money';
import { showToast } from '../lib/toast';
import { routeNames } from '../router/routes';

const { buildDate } = require('../lib/app-settings.json');
const recommendText = `PreCloud: Encrypt before upload\n\niOS: ${appStoreLink.ios}\n\nAndroid: ${appStoreLink.android}`;

function Settings({ navigation, route: { name: routeName } }) {
  const colors = useColors();

  function renderSupport() {
    if (showDonate()) {
      return (
        <>
          <Divider />
          <VStack space="sm">
            <DonateMessage color={colors.text} />
          </VStack>
        </>
      );
    }

    return null;
  }

  return (
    <ScreenWrapper>
      <AppBar title="Settings" />
      <ContentWrapper>
        <VStack space="lg" alignItems="flex-start">
          <Heading>PreCloud: Encrypt before upload</Heading>
          <Heading size="sm" color="primary.400">
            Open source, no tracking, no server and free forever.
          </Heading>

          {renderSupport()}

          <Divider />

          <Link onPress={() => navigation.navigate(routeNames.plainText)}>Encrypt plain text</Link>

          <Link onPress={() => navigation.navigate(routeNames.passwordGenerator)}>
            Generate password
          </Link>

          <Caches route={routeName} />

          <Divider />

          <Link href="https://www.getrevue.co/profile/precloud">What&lsquo;s new?</Link>

          <Divider />

          <HStack space="1">
            <Text>Enjoying the app?</Text>
            <Link href={getStoreLink()}>Give it 5 🌟</Link>
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

          <Link href="https://twitter.com/penghuili22">My twitter</Link>

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
                      showToast('Copied!');
                    }}
                  >
                    Copy
                  </Button>
                </Popover.Footer>
              </Popover.Content>
            </Popover>
          </HStack>

          <Divider />

          <Link href="https://www.peng.kiwi/precloud">What is PreCloud?</Link>
          <Link
            onPress={() => {
              Linking.openURL(`mailto:${myEmail}`);
            }}
          >
            How are you using PreCloud?
          </Link>
          <Link href="https://dev.to/penghuili/how-much-does-it-cost-to-build-an-app-2e6">
            How much does it cost to build this free app? 🤑
          </Link>

          <Divider />

          <VStack space={1}>
            <Text>This is my cat, Xiangcai</Text>

            <Image source={xiangcai} alt="My cat" size="2xl" resizeMode="cover" />

            <Text fontSize="xs" mt="1" color="gray.500">
              Want to show your pets?{' '}
            </Text>
            <Link
              onPress={() => {
                Linking.openURL(`mailto:${myEmail}`);
              }}
              _text={{ fontSize: 'xs', color: 'gray.500' }}
            >
              Send it to me!
            </Link>
          </VStack>

          <Divider />

          <Link href="https://github.com/penghuili/PreCloud">Source code</Link>
          <Link href="https://github.com/penghuili/PreCloud/blob/master/PRIVACYPOLICY.md#precloud---encrypt-before-upload">
            Privacy policy
          </Link>

          <Divider />

          <VStack>
            <Text>
              v{DeviceInfoModule.getVersion()}({DeviceInfoModule.getBuildNumber()})
            </Text>
            <Text fontSize="xs" color="gray.400">
              Released at {format(new Date(buildDate), 'PPpp')}
            </Text>
          </VStack>
        </VStack>
      </ContentWrapper>
    </ScreenWrapper>
  );
}

export default Settings;
