import { IconButton, Spinner } from 'native-base';
import React from 'react';

import useColors from '../hooks/useColors';
import { takePhoto } from '../lib/files';
import Icon from './Icon';

function TakePhotoButton({ isDisabled, isLoading, onSelected }) {
  const colors = useColors();

  async function handlePress() {
    try {
      const photo = await takePhoto();
      if (photo) {
        onSelected(photo);
      }
    } catch (e) {
      console.log('Take photo failed', e);
    }
  }

  return (
    <IconButton
      icon={
        isLoading ? (
          <Spinner size={32} />
        ) : (
          <Icon name="camera-outline" size={32} color={colors.white} />
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

export default TakePhotoButton;
