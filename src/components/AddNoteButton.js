import { IconButton } from 'native-base';
import React from 'react';

import useColors from '../hooks/useColors';
import { routeNames } from '../router/routes';
import { useStore } from '../store/store';
import Icon from './Icon';

function AddNoteButton({ folder, isDisabled, navigate }) {
  const colors = useColors();
  const setNoteContent = useStore(state => state.setNoteContent);
  const setActiveNote = useStore(state => state.setActiveNote);

  async function handlePress() {
    setActiveNote(null);
    setNoteContent('');
    navigate(routeNames.noteDetails, { folder: { name: folder.name, path: folder.path } });
  }

  return (
    <IconButton
      icon={<Icon name="add-outline" size={32} color={colors.white} />}
      size="md"
      variant="solid"
      mr="2"
      isDisabled={isDisabled}
      onPress={handlePress}
    />
  );
}

export default AddNoteButton;
