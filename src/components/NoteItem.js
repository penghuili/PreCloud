import { Pressable, Text } from 'native-base';
import React, { useEffect } from 'react';
import FS from 'react-native-fs';

import { showToast } from '../lib/toast';
import { routeNames } from '../router/routes';
import { useStore } from '../store/store';

const nodejs = require('nodejs-mobile-react-native');

function NoteItem({ navigation, note, notebook }) {
  const password = useStore(state => state.activePassword);
  const setNoteTitle = useStore(state => state.setNoteTitle);
  const setNoteContent = useStore(state => state.setNoteContent);

  useEffect(() => {
    const listener = async msg => {
      if (msg.type === 'decrypted-rich-text') {
        if (!msg.payload.error) {
          setNoteTitle(msg.payload.fileName);
          setNoteContent(msg.payload.data || '');
          showToast('Note is decrypted.');
          navigation.navigate(routeNames.noteDetails, {
            isNew: false,
            notebook,
            note: { fileName: note.fileName, size: note.size, path: note.path },
          });
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
      data: { fileBase64: base64, fileName: note.fileName, size: note.size, password },
    });
  }

  return (
    <Pressable
      key={note.path}
      onPress={() => {
        if (password) {
          handleOpen();
        }
      }}
      my="1"
    >
      <Text numberOfLines={1}>{note.fileName}</Text>
    </Pressable>
  );
}

export default NoteItem;
