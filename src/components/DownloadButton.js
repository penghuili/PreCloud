import { IconButton } from 'native-base';
import React, { useState } from 'react';

import useColors from '../hooks/useColors';
import { downloadFile } from '../lib/files/actions';
import { showToast } from '../lib/toast';
import Icon from './Icon';

function DownloadButton({ file }) {
  const colors = useColors();

  const [isPending, setIsPending] = useState(false);

  async function handlePress() {
    setIsPending(true);

    const message = await downloadFile({ path: file.path, name: file.name });
    if (message) {
      showToast(message);
    }

    setIsPending(false);
  }

  return (
    <IconButton
      icon={<Icon name="download-outline" size={20} color={colors.text} />}
      size="sm"
      variant="subtle"
      mr="2"
      isDisabled={isPending}
      onPress={handlePress}
    />
  );
}

export default DownloadButton;
