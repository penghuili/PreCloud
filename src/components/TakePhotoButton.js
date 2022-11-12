import { Actionsheet } from 'native-base';
import React from 'react';

import useColors from '../hooks/useColors';
import { takePhoto } from '../lib/files/actions';
import Icon from './Icon';

function TakePhotoButton({ isDisabled, isLoading, onClose, onSelected }) {
  const colors = useColors();

  async function handlePress() {
    try {
      const photo = await takePhoto({ mediaType: 'mixed' });
      if (photo) {
        onSelected(photo);
      }
    } catch (e) {
      console.log('Take photo failed', e);
    }

    onClose();
  }

  return (
    <Actionsheet.Item
      isLoading={isLoading}
      isDisabled={isDisabled || isLoading}
      startIcon={<Icon name="camera-outline" color={colors.text} />}
      onPress={handlePress}
    >
      Take photo
    </Actionsheet.Item>
  );
}

export default TakePhotoButton;
