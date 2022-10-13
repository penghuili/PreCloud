import { HStack, IconButton, Pressable, Text } from 'native-base';
import React, { useState } from 'react';

import useColors from '../hooks/useColors';
import { useStore } from '../store/store';
import Icon from './Icon';
import NoteItemActions from './NoteItemActions';

function NoteItem({ note, onOpen, navigation, notebook }) {
  const colors = useColors();
  const password = useStore(state => state.activePassword);

  const [showActions, setShowActions] = useState(false);

  return (
    <>
      <Pressable
        key={note.path}
        onPress={() => {
          if (password) {
            onOpen(note);
          }
        }}
      >
        <HStack w="full" justifyContent="space-between" alignItems="center">
          <Text numberOfLines={1} flex={1}>
            {note.fileName}
          </Text>
          <IconButton
            icon={<Icon name="ellipsis-vertical-outline" size={16} color={colors.text} />}
            onPress={() => setShowActions(true)}
          />
        </HStack>
      </Pressable>
      <NoteItemActions
        note={note}
        isOpen={showActions}
        onClose={() => setShowActions(false)}
        isNoteDetails={false}
        navigation={navigation}
        notebook={notebook}
      />
    </>
  );
}

export default NoteItem;
