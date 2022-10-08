import { HStack, IconButton, Menu, Text } from 'native-base';
import React, { useEffect, useState } from 'react';
import FS from 'react-native-fs';

import useColors from '../hooks/useColors';
import { deleteFile, downloadFile, getSizeText, shareFile } from '../lib/files';
import { showToast } from '../lib/toast';
import { routeNames } from '../router/routes';
import { useStore } from '../store/store';
import Icon from './Icon';
import NotebookPicker from './NotebookPicker';

const nodejs = require('nodejs-mobile-react-native');

function Note({ navigation, note, notebook, onMove }) {
  const colors = useColors();
  const password = useStore(state => state.activePassword);
  const notes = useStore(state => state.notes);
  const setNotes = useStore(state => state.setNotes);
  const setRichTextTitle = useStore(state => state.setRichTextTitle);
  const setRichTextContent = useStore(state => state.setRichTextContent);

  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    const listener = async msg => {
      if (msg.type === 'decrypted-rich-text') {
        if (!msg.payload.error) {
          setRichTextTitle(msg.payload.fileName);
          setRichTextContent(msg.payload.data || '');
          showToast('Note is decrypted.');
          navigation.navigate(routeNames.richTextEditor, { isNew: false, notebook });
        } else {
          showToast('Decrypt note failed.', 'error');
        }
      }
    };

    nodejs.channel.addListener('message', listener);

    return () => {
      nodejs.channel.removeListener('message', listener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notebook]);

  async function handleOpen() {
    const base64 = await FS.readFile(note.path, 'base64');

    nodejs.channel.send({
      type: 'decrypt-rich-text',
      data: { fileBase64: base64, fileName: note.fileName, password },
    });
  }

  async function handleDownload() {
    const message = await downloadFile({ path: note.path, fileName: note.name });
    if (message) {
      showToast(message);
    }
  }

  async function handleMove(notebook) {
    await FS.moveFile(note.path, `${notebook.path}/${note.name}`);
    setNotes(notes.filter(n => n.fileName !== note.fileName));
    setShowPicker(false);
    if (onMove) {
      onMove();
    }
    showToast('Moved!');
  }

  async function handleShare() {
    try {
      await shareFile({
        fileName: note.fileName,
        filePath: note.path,
        saveToFiles: false,
      });
      showToast('Shared!');
    } catch (error) {
      console.log('Share file failed:', error);
    }
  }

  async function handleDelete() {
    await deleteFile(note.path);
    setNotes(notes.filter(n => n.fileName !== note.fileName));
    showToast('Deleted!');
  }

  return (
    <>
      <HStack key={note.path} alignItems="center" justifyContent="space-between">
        <Text
          onPress={() => {
            if (password) {
              handleOpen();
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
                handleShare();
              }
            }}
          >
            Share
          </Menu.Item>
          <Menu.Item
            onPress={() => {
              if (password) {
                handleDownload();
              }
            }}
          >
            Download
          </Menu.Item>
          <Menu.Item
            onPress={() => {
              if (password) {
                setShowPicker(true);
              }
            }}
          >
            Move to ...
          </Menu.Item>
          <Menu.Item
            onPress={() => {
              if (password) {
                handleDelete();
              }
            }}
          >
            Delete
          </Menu.Item>
          <Menu.Item>
            <Text fontSize="xs" color="gray.400">
              {getSizeText(note.size)}
            </Text>
          </Menu.Item>
        </Menu>
      </HStack>

      <NotebookPicker
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        onSave={handleMove}
        navigate={navigation.navigate}
        notebook={notebook}
      />
    </>
  );
}

export default Note;
