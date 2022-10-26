import { IconButton } from 'native-base';
import React, { useMemo } from 'react';
import FileViewer from 'react-native-file-viewer';

import useColors from '../hooks/useColors';
import { viewableFileTypes } from '../lib/files/constant';
import { extractFileNameAndExtension } from '../lib/files/helpers';
import Icon from './Icon';

function OpenFileButton({ file }) {
  const colors = useColors();

  const canBeOpened = useMemo(() => {
    if (!file?.name) {
      return false;
    }

    const { extension } = extractFileNameAndExtension(file.name);
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
