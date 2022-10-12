import { Pressable, Text } from 'native-base';
import React from 'react';

import { useStore } from '../store/store';

function NoteItem({ note, onOpen }) {
  const password = useStore(state => state.activePassword);

  return (
    <Pressable
      key={note.path}
      onPress={() => {
        if (password) {
          onOpen(note);
        }
      }}
      my="1"
    >
      <Text numberOfLines={1}>{note.fileName}</Text>
    </Pressable>
  );
}

export default NoteItem;
