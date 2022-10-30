import { IconButton } from 'native-base';
import React, { useMemo } from 'react';

import useColors from '../hooks/useColors';
import { viewableFileExtensions } from '../lib/files/constant';
import { viewFile } from '../lib/files/file';
import { extractFileNameAndExtension } from '../lib/files/helpers';
import Icon from './Icon';

function OpenFileButton({ file }) {
  const colors = useColors();

  const canBeOpened = useMemo(() => {
    if (!file?.name) {
      return false;
    }

    const { extensionWithoutDot } = extractFileNameAndExtension(file.name);
    return viewableFileExtensions.includes(extensionWithoutDot);
  }, [file]);

  async function handlePress() {
    await viewFile(file.path)
  }

  if (!canBeOpened) {
    return null;
  }

  return (
    <IconButton
      icon={<Icon name="eye-outline" size={20} color={colors.text} />}
      size="sm"
      variant="subtle"
      mr="2"
      onPress={handlePress}
    />
  );
}

export default OpenFileButton;
