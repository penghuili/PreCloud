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
import React, { useState } from 'react';
import { Keyboard } from 'react-native';

import AppBar from '../components/AppBar';
import ContentWrapper from '../components/ContentWrapper';
import Icon from '../components/Icon';
import PasswordAlert from '../components/PasswordAlert';
import ScreenWrapper from '../components/ScreenWrapper';
import useColors from '../hooks/useColors';
import { decryptText, encryptText } from '../lib/openpgp/helpers';
import { showToast } from '../lib/toast';
import { useStore } from '../store/store';

function PlainText({ navigation }) {
  const password = useStore(state => state.activePassword);
  const colors = useColors();
  const [text, setText] = useState('');
  const [encryptedText, setEncryptedText] = useState('');

  async function handleEncryptText(message) {
    const encrypted = await encryptText(message, password);
    if (encrypted) {
      setEncryptedText(encrypted);
      Keyboard.dismiss();
      showToast('Encrypted.');
    } else {
      showToast('Encrypt text failed.', 'error');
    }
  }

  async function handleDecryptText(message) {
    const decrypted = await decryptText(message, password);
    if (decrypted) {
      setText(decrypted);
      showToast('Decrypted.');
    } else {
      showToast(
        'Decrypt text failed. Please only decrypt texts that are encrypted by this app.',
        'error'
      );
    }
  }

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
            onPress={() => handleEncryptText(text)}
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
            onPress={() => handleDecryptText(encryptedText)}
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
        <PasswordAlert navigate={navigation.navigate} />

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
