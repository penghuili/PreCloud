import { Button, HStack, IconButton, Menu, Text, VStack } from 'native-base';
import React, { useEffect } from 'react';
import FS from 'react-native-fs';

import useColors from '../hooks/useColors';
import { deleteFile, downloadFile, readNotes, shareFile } from '../lib/files';
import { showToast } from '../lib/toast';
import { routeNames } from '../router/routes';
import { useStore } from '../store/store';
import Icon from './Icon';

const nodejs = require('nodejs-mobile-react-native');

function EncryptDecryptRichText({ navigation }) {
  const colors = useColors();
  const password = useStore(state => state.activePassword);
  const richTexts = useStore(state => state.richTexts);
  const setRichTexts = useStore(state => state.setRichTexts);
  const setRichTextTitle = useStore(state => state.setRichTextTitle);
  const setRichTextContent = useStore(state => state.setRichTextContent);

  useEffect(() => {
    readNotes().then(result => {
      setRichTexts(result);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const listener = async msg => {
      if (msg.type === 'decrypted-rich-text') {
        if (!msg.payload.error) {
          setRichTextTitle(msg.payload.fileName);
          setRichTextContent(msg.payload.data || '');
          navigation.navigate(routeNames.richTextEditor, { isNew: false });
        } else {
          showToast('Decrypt note failed.', 'error')
        }
      }
    };

    nodejs.channel.addListener('message', listener);

    return () => {
      nodejs.channel.removeListener('message', listener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleOpen(note) {
    const base64 = await FS.readFile(note.path, 'base64');

    nodejs.channel.send({
      type: 'decrypt-rich-text',
      data: { fileBase64: base64, fileName: note.fileName, password },
    });
  }

  async function handleDownload(note) {
    const message = await downloadFile({ path: note.path, fileName: note.name });
    if (message) {
      showToast(message)
    }
  }

  async function handleShare(note) {
    try {
      await shareFile({
        fileName: note.fileName,
        filePath: note.path,
        saveToFiles: false,
      });
      showToast('Shared!')
    } catch (error) {
      console.log('Share file failed:', error);
    }
  }

  async function handleDelete(note) {
    await deleteFile(note.path);
    setRichTexts(richTexts.filter(n => n.fileName !== note.fileName));
  }

  function handleAddNew() {
    setRichTextTitle('');
    setRichTextContent('');
    navigation.navigate(routeNames.richTextEditor, { isNew: true });
  }

  function renderNotes() {
    if (!richTexts.length) {
      return (
        <VStack space="sm" alignItems="center">
          <Text>Create your first rich text note.</Text>
          <Button onPress={handleAddNew} isDisabled={!password}>
            Add note
          </Button>
        </VStack>
      );
    }

    return (
      <>
        <HStack>
          <Button onPress={handleAddNew} variant="outline">Add new note</Button>
        </HStack>
        {richTexts.map(note => (
          <HStack key={note.path} alignItems="center" justifyContent="space-between">
            <Text
              onPress={() => {
                if (password) {
                  handleOpen(note);
                }
              }}
            >
              {note.fileName}
            </Text>
            <Menu
              trigger={triggerProps => {
                return (
                  <IconButton
                    {...triggerProps}
                    icon={<Icon name="ellipsis-vertical-outline" size={20} color={colors.text} />}
                    size="sm"
                  />
                );
              }}
            >
              <Menu.Item
                onPress={() => {
                  if (password) {
                    handleShare(note);
                  }
                }}
              >
                Share
              </Menu.Item>
              <Menu.Item
                onPress={() => {
                  if (password) {
                    handleDownload(note);
                  }
                }}
              >
                Download
              </Menu.Item>
              <Menu.Item
                onPress={() => {
                  if (password) {
                    handleDelete(note);
                  }
                }}
              >
                Delete
              </Menu.Item>
            </Menu>
          </HStack>
        ))}
      </>
    );
  }

  return (
    <VStack px={4} space="sm" pb="15">
      {renderNotes()}
    </VStack>
  );
}

export default EncryptDecryptRichText;
