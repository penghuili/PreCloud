import { IconButton } from 'native-base';
import React, { useState } from 'react';

import useColors from '../hooks/useColors';
import { shareFile } from '../lib/files/actions';
import { showToast } from '../lib/toast';
import Icon from './Icon';

function ShareButton({ file }) {
  const colors = useColors();

  const [isPending, setIsPending] = useState(false);

  async function handlePress() {
    setIsPending(true);

    const success = await shareFile({
      name: file.name,
      path: file.path,
      saveToFiles: false,
    });
    if (success) {
      showToast('Shared!');
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
