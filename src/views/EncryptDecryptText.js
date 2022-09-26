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
  useToast,
  VStack,
} from 'native-base';
import React, { useEffect, useRef, useState } from 'react';

import ActivePasswordAlert from '../components/ActivePasswordAlert';
import AppBar from '../components/AppBar';
import ContentWrapper from '../components/ContentWrapper';
import Editor from '../components/Editor';
import Icon from '../components/Icon';
import PasswordAlert from '../components/PasswordAlert';
import useColors from '../hooks/useColors';
import { useStore } from '../store/store';

const nodejs = require('nodejs-mobile-react-native');

function EncryptDecryptText({ jumpTo }) {
  const editorRef = useRef();
  const toast = useToast();
  const password = useStore(state => state.activePassword);
  const colors = useColors();
  const [text, setText] = useState('');
  const [encryptedText, setEncryptedText] = useState('');

  useEffect(() => {
    const listner = async msg => {
      if (msg.type === 'replaced-image-with-hash') {
        await encryptText(msg.payload.data);
      } else if (msg.type === 'encrypted-text') {
        if (msg.payload.data) {
          setEncryptedText(msg.payload.data);
          editorRef.current.blurContentEditor();
          toast.show({ title: 'Encrypted.', placement: 'top' });
        } else {
          toast.show({ title: 'Encrypt text failed.', placement: 'top' });
        }
      } else if (msg.type === 'decrypted-text') {
        if (msg.payload.data) {
          setText(msg.payload.data);
          editorRef.current.setContentHTML(msg.payload.data);
          toast.show({ title: 'Decrypted.', placement: 'top' });
        } else {
          toast.show({
            title: 'Decrypt text failed. Please only decrypt texts that are encrypted by this app.',
            placement: 'top',
          });
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

  function rendrEncryption() {
    return (
      <>
        <HStack px={4} alignItems="center" justifyContent="center">
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

        <Editor ref={editorRef} disabled={!password} onChange={setText} />
        <HStack justifyContent="flex-start" w="full" px={4}>
          <Button
            isDisabled={!password || !text}
            endIcon={<Icon name="chevron-down-outline" color={colors.white} />}
            onPress={() => {
              nodejs.channel.send({
                type: 'replace-image-with-hash',
                data: { text },
              });
            }}
          >
            Encrypt
          </Button>
        </HStack>
      </>
    );
  }

  function renderDecryption() {
    return (
      <>
        <HStack alignItems="center" px={4} justifyContent="center">
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

        <HStack justifyContent="space-between" px={4}>
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
                  toast.show({ title: 'Pasted!', placement: 'top' });
                } else {
                  toast.show({ title: 'Nothing in clipboard.', placement: 'top' });
                }
              }}
            />
            <IconButton
              icon={<Icon name="copy-outline" color={colors.text} />}
              isDisabled={!password || !encryptedText}
              onPress={() => {
                Clipboard.setString(encryptedText);
                toast.show({ title: 'Copied!', placement: 'top' });
              }}
            />
          </HStack>
        </HStack>
        <Box px={4}>
          <Box width="full" p="2" rounded borderWidth={1} borderColor="gray.200" borderRadius={'sm'}>
            {!!encryptedText && <Text>{encryptedText}</Text>}
            {!encryptedText && (
              <Text color="gray.500">
                Ecnrypted text will be shown here. Or you can paste encrypted text with the paste
                icon to decrypt.
              </Text>
            )}
          </Box>
        </Box>
      </>
    );
  }

  return (
    <>
      <AppBar title="Encrypt & decrypt text" />
      <ContentWrapper hasPX={false}>
        <VStack space="sm" pb="15">
          <Box px={4} w="full">
            <PasswordAlert navigate={jumpTo} />
            <ActivePasswordAlert navigate={jumpTo} />
          </Box>

          {rendrEncryption()}

          <Box px={4}>
            <Divider my="8" />
          </Box>

          {renderDecryption()}
        </VStack>
      </ContentWrapper>
    </>
  );
}

export default EncryptDecryptText;
