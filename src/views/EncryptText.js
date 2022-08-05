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
import Icon from 'react-native-vector-icons/Ionicons';

import AppBar from '../components/AppBar';

const nodejs = require('nodejs-mobile-react-native');

function EncryptText() {
  const toast = useToast();
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
        data: { text: message, password: '12345678' },
      });
    } catch (error) {
      console.log(error);
    }
  };

  const decryptText = async message => {
    try {
      nodejs.channel.send({
        type: 'decrypt-text',
        data: { encryptedText: message, password: '12345678' },
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <AppBar title="Encrypt & decrypt text" />
      <ScrollView>
        <VStack space="sm" alignItems="center" px={4} py={4}>
          <Heading>Encryption</Heading>
          <TextArea onChangeText={setText} value={text} numberOfLines={10} />
          <HStack space="sm">
            <IconButton
              icon={<Icon name="clipboard-outline" size={24} />}
              onPress={async () => {
                const copied = await Clipboard.getString();
                setText(copied);
                toast.show({ title: 'Pasted!', placement: 'bottom' });
              }}
            />
            <IconButton
              icon={<Icon name="copy-outline" size={24} />}
              isDisabled={!text}
              onPress={() => {
                Clipboard.setString(text);
                toast.show({ title: 'Copied!', placement: 'bottom' });
              }}
            />
            <IconButton
              icon={<Icon name="close-outline" size={24} />}
              onPress={() => {
                setText('');
              }}
            />
            <Button isDisabled={!text} onPress={() => encryptText(text)}>
              Encrypt
            </Button>
          </HStack>

          <Divider my="8" />

          <Heading>Decryption</Heading>
          <TextArea onChangeText={setEncryptedText} value={encryptedText} numberOfLines={10} />
          <HStack space="sm">
            <IconButton
              icon={<Icon name="clipboard-outline" size={24} />}
              onPress={async () => {
                const copied = await Clipboard.getString();
                setEncryptedText(copied);
                toast.show({ title: 'Pasted!', placement: 'bottom' });
              }}
            />
            <IconButton
              icon={<Icon name="copy-outline" size={24} />}
              isDisabled={!encryptedText}
              onPress={() => {
                Clipboard.setString(encryptedText);
                toast.show({ title: 'Copied!', placement: 'bottom' });
              }}
            />
            <IconButton
              icon={<Icon name="close-outline" size={24} />}
              onPress={() => {
                setEncryptedText('');
              }}
            />
            <Button isDisabled={!encryptedText} onPress={() => decryptText(encryptedText)}>Decrypt</Button>
          </HStack>
        </VStack>
      </ScrollView>
    </>
  );
}

export default EncryptText;
