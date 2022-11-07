import { HStack } from 'native-base';
import React, { useState } from 'react';

import { useStore } from '../store/store';
import AddNoteButton from './AddNoteButton';
import PickNotesButton from './PickNotesButton';

function NotesTopActions({ folder, onPickNotes, navigate }) {
  const password = useStore(state => state.activePassword);

  const [isPickingNotes, setIsPickingNotes] = useState(false);

  return (
    <HStack flexWrap="wrap" w="full" pb="2">
      <AddNoteButton folder={folder} isDisabled={!password} navigate={navigate} />
      <PickNotesButton
        folder={folder}
        isLoading={isPickingNotes}
        isDisabled={!password}
        onStart={setIsPickingNotes}
        onSelected={async notes => {
          await onPickNotes(notes);
        }}
      />
    </HStack>
  );
}

export default NotesTopActions;
