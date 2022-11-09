import { Actionsheet } from 'native-base';
import React from 'react';
import { launchImageLibrary } from 'react-native-image-picker';

import useColors from '../hooks/useColors';
import { extractFilePath } from '../lib/files/helpers';
import { hideToast, showToast } from '../lib/toast';
import Icon from './Icon';

function PickImagesButton({ isDisabled, isLoading, onClose, onStart, onSelected }) {
  const colors = useColors();

  async function handlePress() {
    onStart(true);
    try {
      showToast('Copying files ...', 'info', 300);

      const result = await launchImageLibrary({
        mediaType: 'mixed',
        selectionLimit: 0,
      });
      hideToast();

      const images = result?.assets?.map(f => ({
        name: f.fileName,
        size: f.fileSize,
        path: extractFilePath(f.uri),
      }));

      await onSelected(images);
    } catch (e) {
      hideToast();
      console.log('Pick images failed', e);
    }
    onStart(false);
    onClose();
  }

  return (
    <Actionsheet.Item
      isLoading={isLoading}
      isDisabled={isDisabled || isLoading}
      startIcon={<Icon name="image-outline" color={colors.text} />}
      onPress={handlePress}
    >
      Pick images
    </Actionsheet.Item>
  );
}

export default PickImagesButton;
