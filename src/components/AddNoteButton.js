import { Actionsheet } from 'native-base';
import React from 'react';

import useColors from '../hooks/useColors';
import { routeNames } from '../router/routes';
import { useStore } from '../store/store';
import Icon from './Icon';

function AddNoteButton({ folder, isDisabled, onClose, navigate }) {
  const colors = useColors();
  const setNoteContent = useStore(state => state.setNoteContent);
  const setActiveNote = useStore(state => state.setActiveNote);

  async function handlePress() {
    setActiveNote(null);
    setNoteContent('');
    onClose();
    navigate(routeNames.noteDetails, { folder: { name: folder.name, path: folder.path } });
  }

  return (
    <Actionsheet.Item
      isDisabled={isDisabled}
      startIcon={<Icon name="add-outline" color={colors.text} />}
      onPress={handlePress}
    >
      Add note
    </Actionsheet.Item>
  );
}

export default AddNoteButton;
