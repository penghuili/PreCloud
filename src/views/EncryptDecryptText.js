import Clipboard from '@react-native-clipboard/clipboard';
import {
  Box,
  Button,
  Heading,
  HStack,
  IconButton,
  Popover,
  TextArea,
  useToast,
  VStack,
} from 'native-base';
import React, { useEffect, useState } from 'react';

import AppBar from '../components/AppBar';
import ContentWrapper from '../components/ContentWrapper';
import Icon from '../components/Icon';
import PasswordAlert from '../components/PasswordAlert';
import useColors from '../hooks/useColors';
import { useStore } from '../store/store';

const nodejs = require('nodejs-mobile-react-native');

function EncryptDecryptText({ jumpTo }) {
  const toast = useToast();
  const password = useStore(state => state.masterPassword);
  const colors = useColors();
  const [text, setText] = useState('');
  const [encryptedText, setEncryptedText] = useState('');

  useEffect(() => {
    const listner = async msg => {
      if (msg.type === 'encrypted-text') {
        if (msg.payload.data) {
          setEncryptedText(msg.payload.data);
          toast.show({ title: 'Encrypted.' });
        } else {
          toast.show({ title: 'Encrypt text failed.' });
        }
      } else if (msg.type === 'decrypted-text') {
        if (msg.payload.data) {
          setText(msg.payload.data);
          toast.show({ title: 'Decrypted.' });
        } else {
          toast.show({
            title: 'Decrypt text failed. Please only decrypt texts that are encrypted by this app.',
          });
        }
      }
    };
    nodejs.channel.addListener('message', listner);

    return () => {
      nodejs.channel.removeListener('message', listner);
    };
  }, []);

  const encryptText = async message => {
    try {
      nodejs.channel.send({
        type: 'encrypt-text',
        data: { text: message, password },
      });
    } catch (error) {
      console.log(error);
    }
  };

  const decryptText = async message => {
    try {
      nodejs.channel.send({
        type: 'decrypt-text',
        data: { encryptedText: message, password },
      });
    } catch (error) {
      console.log(error);
    }
  };

  function rendrEncryption() {
    return (
      <>
        <HStack alignItems="center">
          <Heading>Encrypt text</Heading>

          <Popover
            trigger={triggerProps => {
              return (
                <IconButton
                  {...triggerProps}
                  icon={<Icon name="information-circle-outline" size={24} color={colors.text} />}
                />
              );
            }}
          >
            <Popover.Content accessibilityLabel="Delete Customerd" w="56">
              <Popover.Body>
                Type or paste some text to encrypt. The encrypted text will be shown below.
              </Popover.Body>
            </Popover.Content>
          </Popover>
        </HStack>

        <HStack space="sm">
          <IconButton
            icon={<Icon name="clipboard-outline" size={24} color={colors.text} />}
            isDisabled={!password}
            onPress={async () => {
              const copied = await Clipboard.getString();
              if (copied) {
                setText(copied);
                toast.show({ title: 'Pasted!', placement: 'bottom' });
              } else {
                toast.show({ title: 'Nothing in clipboard.', placement: 'bottom' });
              }
            }}
          />
          <IconButton
            icon={<Icon name="copy-outline" size={24} color={colors.text} />}
            isDisabled={!password || !text}
            onPress={() => {
              Clipboard.setString(text);
              toast.show({ title: 'Copied!', placement: 'bottom' });
            }}
          />
          <IconButton
            icon={<Icon name="close-outline" size={24} color={colors.text} />}
            isDisabled={!password || !text}
            onPress={() => {
              setText('');
            }}
          />
          <Button
            isDisabled={!password || !text}
            endIcon={<Icon name="chevron-down-sharp" size={24} color={colors.white} />}
            onPress={() => encryptText(text)}
          >
            Encrypt
          </Button>
        </HStack>
        <TextArea isDisabled={!password} onChangeText={setText} value={text} h={40} />
      </>
    );
  }

  function renderDecryption() {
    return (
      <>
        <HStack alignItems="center">
          <Heading>Decrypt text</Heading>

          <Popover
            trigger={triggerProps => {
              return (
                <IconButton
                  {...triggerProps}
                  icon={<Icon name="information-circle-outline" size={24} color={colors.text} />}
                />
              );
            }}
          >
            <Popover.Content accessibilityLabel="Delete Customerd" w="56">
              <Popover.Body>
                Paste encrypted text to decrypt. The decrypted text will be shown above.
              </Popover.Body>
            </Popover.Content>
          </Popover>
        </HStack>

        <HStack space="sm">
          <IconButton
            icon={<Icon name="clipboard-outline" size={24} color={colors.text} />}
            isDisabled={!password}
            onPress={async () => {
              const copied = await Clipboard.getString();
              if (copied) {
                setEncryptedText(copied);
                toast.show({ title: 'Pasted!', placement: 'bottom' });
              } else {
                toast.show({ title: 'Nothing in clipboard.', placement: 'bottom' });
              }
            }}
          />
          <IconButton
            icon={<Icon name="copy-outline" size={24} color={colors.text} />}
            isDisabled={!password || !encryptedText}
            onPress={() => {
              Clipboard.setString(encryptedText);
              toast.show({ title: 'Copied!', placement: 'bottom' });
            }}
          />
          <IconButton
            icon={<Icon name="close-outline" size={24} color={colors.text} />}
            isDisabled={!password || !encryptedText}
            onPress={() => {
              setEncryptedText('');
            }}
          />
          <Button
            isDisabled={!password || !encryptedText}
            endIcon={<Icon name="chevron-up-sharp" size={24} color={colors.white} />}
            onPress={() => decryptText(encryptedText)}
          >
            Decrypt
          </Button>
        </HStack>
        <TextArea isDisabled value={encryptedText} h={40} />
      </>
    );
  }

  return (
    <>
      <AppBar title="Encrypt & decrypt text" />
      <ContentWrapper>
        <VStack space="sm" alignItems="center" pb="15">
          <PasswordAlert navigate={jumpTo} />

          {rendrEncryption()}

          <Box h="15" />

          {renderDecryption()}
        </VStack>
      </ContentWrapper>
    </>
  );
}

export default EncryptDecryptText;