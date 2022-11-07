import { HStack, IconButton, Pressable, Text } from 'native-base';
import React, { useMemo, useState } from 'react';

import useColors from '../hooks/useColors';
import { getNoteTitle } from '../lib/files/note';
import { useStore } from '../store/store';
import Icon from './Icon';
import NoteItemActions from './NoteItemActions';

function NoteItem({ folder, note, onOpen, onMoved, navigation }) {
  const colors = useColors();
  const password = useStore(state => state.activePassword);
  const fileName = useMemo(() => getNoteTitle(note), [note]);

  const [showActions, setShowActions] = useState(false);

  function handleOpen() {
    if (password) {
      onOpen(note);
      setShowActions(false);
    }
  }

  return (
    <>
      <Pressable key={note.path} onPress={handleOpen}>
        <HStack w="full" justifyContent="space-between" alignItems="center">
          <Text numberOfLines={1} flex={1}>
            {fileName}
          </Text>
          <IconButton
            icon={<Icon name="ellipsis-vertical-outline" size={16} color={colors.text} />}
            onPress={() => setShowActions(true)}
          />
        </HStack>
      </Pressable>
      <NoteItemActions
        folder={folder}
        note={note}
        isOpen={showActions}
        onClose={() => setShowActions(false)}
        isNoteDetails={false}
        onView={handleOpen}
        navigation={navigation}
        onMoved={onMoved}
      />
    </>
  );
}

export default NoteItem;
