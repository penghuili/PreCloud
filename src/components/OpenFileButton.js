import { IconButton } from 'native-base';
import React, { useMemo } from 'react';
import FileViewer from 'react-native-file-viewer';

import useColors from '../hooks/useColors';
import { extractFileExtensionFromPath, viewableFileTypes } from '../lib/files';
import Icon from './Icon';

function OpenFileButton({ file }) {
  const colors = useColors();

  const canBeOpened = useMemo(() => {
    if (!file?.name) {
      return false;
    }

    const extension = extractFileExtensionFromPath(file.name);
    return viewableFileTypes.includes(extension);
  }, [file]);

  async function handlePress() {
    try {
      await FileViewer.open(file.path);
    } catch (e) {
      console.log('open file failed', e);
    }
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
