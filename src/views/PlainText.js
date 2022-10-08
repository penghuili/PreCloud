import Clipboard from '@react-native-clipboard/clipboard';
import {
  Box,
  Button,
  Divider,
  Heading,
  HStack,
  IconButton,
  Popover,
  Text,
  TextArea,
  VStack,
} from 'native-base';
import React, { useEffect, useState } from 'react';
import { Keyboard } from 'react-native';

import AppBar from '../components/AppBar';
import ContentWrapper from '../components/ContentWrapper';
import Icon from '../components/Icon';
import ScreenWrapper from '../components/ScreenWrapper';
import useColors from '../hooks/useColors';
import { showToast } from '../lib/toast';
import { useStore } from '../store/store';

const nodejs = require('nodejs-mobile-react-native');

function PlainText() {
  const password = useStore(state => state.activePassword);
  const colors = useColors();
  const [text, setText] = useState('');
  const [encryptedText, setEncryptedText] = useState('');

  useEffect(() => {
    const listner = async msg => {
      if (msg.type === 'encrypted-text') {
        if (msg.payload.data) {
          setEncryptedText(msg.payload.data);
          Keyboard.dismiss();
          showToast('Encrypted.');
        } else {
          showToast('Encrypt text failed.', 'error');
        }
      } else if (msg.type === 'decrypted-text') {
        if (msg.payload.data) {
          setText(msg.payload.data);
          showToast('Decrypted.');
        } else {
          showToast(
            'Decrypt text failed. Please only decrypt texts that are encrypted by this app.',
            'error'
          );
        }
      }
    };
    nodejs.channel.addListener('message', listner);

    return () => {
      nodejs.channel.removeListener('message', listner);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  function renderEncryption() {
    return (
      <>
        <HStack alignItems="center" justifyContent="center">
          <Heading>Encrypt text</Heading>

          <Popover
            trigger={triggerProps => {
              return (
                <IconButton
                  {...triggerProps}
                  icon={<Icon name="information-circle-outline" color={colors.text} />}
                />
              );
            }}
          >
            <Popover.Content accessibilityLabel="Delete Customerd" w="56">
              <Popover.Body>
                Type some texts to encrypt. The encrypted text will be shown below.
              </Popover.Body>
            </Popover.Content>
          </Popover>
        </HStack>

        <TextArea isDisabled={!password} onChangeText={setText} value={text} h={40} />
        <HStack justifyContent="space-between" w="full">
          <Button
            isDisabled={!password || !text}
            endIcon={<Icon name="chevron-down-outline" color={colors.white} />}
            onPress={() => encryptText(text)}
          >
            Encrypt
          </Button>

          <HStack alignItems="center">
            <IconButton
              icon={<Icon name="clipboard-outline" color={colors.text} />}
              isDisabled={!password}
              onPress={async () => {
                const copied = await Clipboard.getString();
                if (copied) {
                  setText(copied);
                  showToast('Pasted!');
                } else {
                  showToast('Nothing in clipboard.', 'info');
                }
              }}
            />
            <IconButton
              icon={<Icon name="copy-outline" color={colors.text} />}
              isDisabled={!password || !text}
              onPress={() => {
                Clipboard.setString(text);
                showToast('Copied!');
              }}
            />
            <IconButton
              icon={<Icon name="close-outline" color={colors.text} />}
              isDisabled={!password || !text}
              onPress={() => {
                setText('');
              }}
            />
          </HStack>
        </HStack>
      </>
    );
  }

  function renderDecryption() {
    return (
      <>
        <HStack alignItems="center" justifyContent="center">
          <Heading>Decrypt text</Heading>

          <Popover
            trigger={triggerProps => {
              return (
                <IconButton
                  {...triggerProps}
                  icon={<Icon name="information-circle-outline" color={colors.text} />}
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

        <HStack justifyContent="space-between">
          <Button
            isDisabled={!password || !encryptedText}
            endIcon={<Icon name="chevron-up-outline" color={colors.white} />}
            onPress={() => decryptText(encryptedText)}
          >
            Decrypt
          </Button>
          <HStack alignItems="center">
            <IconButton
              icon={<Icon name="clipboard-outline" color={colors.text} />}
              isDisabled={!password}
              onPress={async () => {
                const copied = await Clipboard.getString();
                if (copied) {
                  setEncryptedText(copied);
                  showToast('Pasted!');
                } else {
                  showToast('Nothing in clipboard.', 'info');
                }
              }}
            />
            <IconButton
              icon={<Icon name="copy-outline" color={colors.text} />}
              isDisabled={!password || !encryptedText}
              onPress={() => {
                Clipboard.setString(encryptedText);
                showToast('Copied!');
              }}
            />
            <IconButton
              icon={<Icon name="close-outline" color={colors.text} />}
              isDisabled={!password || !encryptedText}
              onPress={() => {
                setEncryptedText('');
              }}
            />
          </HStack>
        </HStack>
        <Box width="full" p="2" rounded borderWidth="1" borderColor="gray.200" borderRadius="sm">
          {!!encryptedText && <Text>{encryptedText}</Text>}
          {!encryptedText && (
            <Text color="gray.500">
              Ecnrypted text will be shown here. Or you can paste encrypted text with the paste icon
              to decrypt.
            </Text>
          )}
        </Box>
      </>
    );
  }

  return (
    <ScreenWrapper>
      <AppBar title="Encrypt plain text" hasBack />
      <ContentWrapper>
        <VStack space="sm">
          {renderEncryption()}

          <Divider my="8" />

          {renderDecryption()}
        </VStack>
      </ContentWrapper>
    </ScreenWrapper>
  );
}

export default PlainText;
