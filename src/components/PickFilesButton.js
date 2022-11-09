import { Actionsheet } from 'native-base';
import React from 'react';

import useColors from '../hooks/useColors';
import { pickFiles } from '../lib/files/actions';
import Icon from './Icon';

function PickFilesButton({ isDisabled, isLoading, onClose, onStart, onSelected }) {
  const colors = useColors();

  async function handlePress() {
    onStart(true);
    const pickedFiles = await pickFiles();

    await onSelected(pickedFiles);

    onStart(false);
    onClose();
  }

  return (
    <Actionsheet.Item
      isLoading={isLoading}
      isDisabled={isDisabled || isLoading}
      startIcon={<Icon name="documents-outline" color={colors.text} />}
      onPress={handlePress}
    >
      Pick files
    </Actionsheet.Item>
  );
}

export default PickFilesButton;
