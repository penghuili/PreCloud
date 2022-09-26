import Clipboard from '@react-native-clipboard/clipboard';
import {
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
import React, { useState } from 'react';
import { Linking } from 'react-native';
import DeviceInfoModule from 'react-native-device-info';

import paypal from '../assets/paypal.png';
import xiangcai from '../assets/xiangcai.jpeg';
import AppBar from '../components/AppBar';
import Caches from '../components/Caches';
import ContentWrapper from '../components/ContentWrapper';
import Icon from '../components/Icon';
import PasswordGeneratorModal from '../components/PasswordGeneratorModal';
import useColors from '../hooks/useColors';
import { appStoreLink, myEmail } from '../lib/constants';
import { getStoreLink, isAndroid } from '../lib/device';

const { buildDate } = require('../lib/app-settings.json');
const recommendText = `PreCloud: Encrypt before upload\n\niOS: ${appStoreLink.ios}\n\nAndroid: ${appStoreLink.android}`;

function Settings({ currentRoute }) {
  const colors = useColors();
  const toast = useToast();

  const [showPasswordGenerator, setShowPasswordGenerator] = useState(false);

  function renderSupport() {
    const support = (
      <>
        <Divider />
        <VStack space="sm">
          <Text>Buy me a beer, especially Hefeweizen beer 🍺❤️</Text>
          <Link href="https://paypal.me/penghuili/">
            <Image source={paypal} alt="Support with Paypal" />
          </Link>
        </VStack>
      </>
    );

    if (isAndroid()) {
      return support;
    }

    // eslint-disable-next-line no-undef
    if (Date.now() > buildDate + 3 * 24 * 60 * 60 * 1000 || __DEV__) {
      return support;
    }

    return null;
  }

  return (
    <>
      <AppBar title="Settings" />
      <ContentWrapper>
        <VStack space="lg" alignItems="flex-start">
          <Heading>PreCloud: Encrypt before upload</Heading>
          <Heading size="sm" color="primary.400">
            Open source, no tracking, no server and free forever.
          </Heading>

          {renderSupport()}

          <Divider />

          <Caches currentRoute={currentRoute} />

          <Divider />

          <Link onPress={() => setShowPasswordGenerator(true)}>Generate password</Link>

          <Divider />

          <HStack space="1">
            <Text>Enjoying the app?</Text>
            <Link href={getStoreLink()}>Give it 5 🌟</Link>
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
                      toast.show({ title: 'Copied!', placement: 'top' });
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

          <Link href="https://www.getrevue.co/profile/precloud">What&lsquo;s new?</Link>

          <Link href="https://twitter.com/penghuili22">My Twitter</Link>

          <Divider />

          <Link href="https://www.peng.kiwi/precloud">What is PreCloud?</Link>
          <Link href="https://dev.to/penghuili/how-much-does-it-cost-to-build-an-app-2e6">
            How much does it cost to build this free app? 🤑
          </Link>

          <Divider />

          <VStack space={1}>
            <Text>This is my cat, Xiangcai</Text>

            <Image source={xiangcai} alt="My cat" size="xl" />
          </VStack>

          <Divider />

          <Link href="https://github.com/penghuili/PreCloud">Source code</Link>
          <Link href="https://github.com/penghuili/PreCloud/blob/master/PRIVACYPOLICY.md#precloud---encrypt-before-upload">
            Privacy policy
          </Link>

          <Divider />

          <Text>
            v{DeviceInfoModule.getVersion()}({DeviceInfoModule.getBuildNumber()})
          </Text>

          <PasswordGeneratorModal
            isOpen={showPasswordGenerator}
            onClose={() => setShowPasswordGenerator(false)}
          />
        </VStack>
      </ContentWrapper>
    </>
  );
}

export default Settings;
