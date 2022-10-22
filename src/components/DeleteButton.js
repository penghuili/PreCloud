import { IconButton } from 'native-base';
import React, { useState } from 'react';

import useColors from '../hooks/useColors';
import { deleteFile } from '../lib/files';
import { showToast } from '../lib/toast';
import { useStore } from '../store/store';
import Icon from './Icon';

function DeleteButton({ file, onDelete }) {
  const colors = useColors();
  const files = useStore(store => store.files);
  const setFiles = useStore(store => store.setFiles);

  const [isPending, setIsPending] = useState(false);

  async function handlePress() {
    setIsPending(true);

    try {
      await deleteFile(file.path);
      setFiles(files.filter(n => n.path !== file.path));
      showToast('Deleted!');

      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.log('Delete file failed:', error);
    }

    setIsPending(false);
  }

  return (
    <IconButton
      icon={<Icon name="trash-outline" size={20} color={colors.text} />}
      size="sm"
      variant="subtle"
      mr="2"
      isDisabled={isPending}
      onPress={handlePress}
    />
  );
}

export default DeleteButton;
