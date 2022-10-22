import { IconButton } from 'native-base';
import React, { useState } from 'react';

import useColors from '../hooks/useColors';
import { moveFile } from '../lib/files';
import { showToast } from '../lib/toast';
import { useStore } from '../store/store';
import FolderPicker from './FolderPicker';
import Icon from './Icon';

function MoveToButton({ file, folder, onMove, navigate }) {
  const colors = useColors();
  const files = useStore(store => store.files);
  const setFiles = useStore(store => store.setFiles);

  const [isPending, setIsPending] = useState(false);
  const [showFolderPicker, setShowFolderPicker] = useState(false);

  async function handlePress(newFolder) {
    setIsPending(true);
    await moveFile(file.path, `${newFolder.path}/${file.name}`);
    setFiles(files.filter(n => n.path !== file.path));
    setShowFolderPicker(false);
    showToast('Moved!');

    if (onMove) {
      onMove();
    }

    setIsPending(false);
  }

  return (
    <>
      <FolderPicker
        isOpen={showFolderPicker}
        onClose={() => setShowFolderPicker(false)}
        onSave={handlePress}
        navigate={navigate}
        folder={folder}
      />
      <IconButton
        icon={<Icon name="arrow-back-outline" size={20} color={colors.text} />}
        size="sm"
        variant="subtle"
        mr="2"
        isDisabled={isPending}
        onPress={() => {
          setShowFolderPicker(true);
        }}
      />
    </>
  );
}

export default MoveToButton;
