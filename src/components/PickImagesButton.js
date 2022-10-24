import { IconButton, Spinner } from 'native-base';
import React from 'react';
import { launchImageLibrary } from 'react-native-image-picker';

import useColors from '../hooks/useColors';
import { extractFilePath } from '../lib/files';
import Icon from './Icon';

function PickImagesButton({ isDisabled, isLoading, onSelected }) {
  const colors = useColors();

  async function handlePress() {
    try {
      const result = await launchImageLibrary({
        mediaType: 'mixed',
        selectionLimit: 0,
      });
      const images = result?.assets?.map(f => ({
        name: f.fileName,
        size: f.fileSize,
        path: extractFilePath(f.uri),
      }));

      await onSelected(images);
    } catch (e) {
      console.log('Pick images failed', e);
    }
  }

  return (
    <IconButton
      icon={
        isLoading ? (
          <Spinner size={32} />
        ) : (
          <Icon name="image-outline" size={32} color={colors.white} />
        )
      }
      size="md"
      variant="solid"
      mr="2"
      isLoading={isLoading}
      isDisabled={isDisabled || isLoading}
      onPress={handlePress}
    />
  );
}

export default PickImagesButton;
