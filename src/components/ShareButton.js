import { IconButton } from 'native-base';
import React, { useState } from 'react';

import useColors from '../hooks/useColors';
import { shareFile } from '../lib/files';
import { showToast } from '../lib/toast';
import Icon from './Icon';

function ShareButton({ file }) {
  const colors = useColors();

  const [isPending, setIsPending] = useState(false);

  async function handlePress() {
    setIsPending(true);
    try {
      await shareFile({
        fileName: file.name,
        filePath: file.path,
        saveToFiles: false,
      });
      showToast('Shared!');
    } catch (error) {
      console.log('Share file failed:', error);
    }
    setIsPending(false);
  }

  return (
    <IconButton
      icon={<Icon name="share-outline" size={20} color={colors.text} />}
      size="sm"
      variant="subtle"
      mr="2"
      isDisabled={isPending}
      onPress={handlePress}
    />
  );
}

export default ShareButton;
