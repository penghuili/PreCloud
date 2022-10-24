import { IconButton } from 'native-base';
import React, { useState } from 'react';

import useColors from '../hooks/useColors';
import { moveFile } from '../lib/files';
import { showToast } from '../lib/toast';
import FolderPicker from './FolderPicker';
import Icon from './Icon';

function MoveToButton({ file, folder, onMove, navigate }) {
  const colors = useColors();

  const [isPending, setIsPending] = useState(false);
  const [showFolderPicker, setShowFolderPicker] = useState(false);

  async function handlePress(newFolder) {
    setIsPending(true);
    await moveFile(file.path, `${newFolder.path}/${file.name}`);
    setShowFolderPicker(false);
    onMove();
    showToast('Moved!');

    setIsPending(false);
  }

  return (
    <>
      <FolderPicker
        isOpen={showFolderPicker}
        onClose={() => setShowFolderPicker(false)}
        onSave={handlePress}
        navigate={navigate}
        currentFolder={folder}
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
