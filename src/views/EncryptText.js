import Clipboard from '@react-native-clipboard/clipboard';
import {
  Button,
  Divider,
  Heading,
  HStack,
  IconButton,
  ScrollView,
  TextArea,
  useToast,
  VStack,
} from 'native-base';
import React, { useEffect, useState } from 'react';

import AppBar from '../components/AppBar';
import Icon from '../components/Icon';
import PasswordAlert from '../components/PasswordAlert';
import useColors from '../hooks/useColors';
import usePassword from '../hooks/usePassword';

const nodejs = require('nodejs-mobile-react-native');

function EncryptText({ jumpTo }) {
  const toast = useToast();
  const password = usePassword();
  const colors = useColors();
  const [text, setText] = useState('');
  const [encryptedText, setEncryptedText] = useState('');

  useEffect(() => {
    nodejs.start('main.js');

    const listner = async msg => {
      if (msg.type === 'encrypted-text') {
        setEncryptedText(msg.data.encrypted);
      } else if (msg.type === 'decrypted-text') {
        setText(msg.data.decrypted);
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

  return (
    <>
      <AppBar title="Encrypt & decrypt text" />
      <ScrollView px={4} py={4} keyboardShouldPersistTaps="handled">
        <VStack space="sm" alignItems="center">
          <PasswordAlert navigate={jumpTo} />
          <Heading>Encryption</Heading>
          <TextArea onChangeText={setText} value={text} />
          <HStack space="sm">
            <IconButton
              icon={<Icon name="clipboard-outline" size={24} color={colors.text} />}
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
              isDisabled={!text}
              onPress={() => {
                Clipboard.setString(text);
                toast.show({ title: 'Copied!', placement: 'bottom' });
              }}
            />
            <IconButton
              icon={<Icon name="close-outline" size={24} color={colors.text} />}
              isDisabled={!text}
              onPress={() => {
                setText('');
              }}
            />
            <Button isDisabled={!text || !password} onPress={() => encryptText(text)}>
              Encrypt
            </Button>
          </HStack>

          <Divider my="8" />

          <Heading>Decryption</Heading>
          <TextArea onChangeText={setEncryptedText} value={encryptedText} />
          <HStack space="sm">
            <IconButton
              icon={<Icon name="clipboard-outline" size={24} color={colors.text} />}
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
              isDisabled={!encryptedText}
              onPress={() => {
                Clipboard.setString(encryptedText);
                toast.show({ title: 'Copied!', placement: 'bottom' });
              }}
            />
            <IconButton
              icon={<Icon name="close-outline" size={24} color={colors.text} />}
              isDisabled={!encryptedText}
              onPress={() => {
                setEncryptedText('');
              }}
            />
            <Button
              isDisabled={!encryptedText || !password}
              onPress={() => decryptText(encryptedText)}
            >
              Decrypt
            </Button>
          </HStack>
        </VStack>
      </ScrollView>
    </>
  );
}

export default EncryptText;
