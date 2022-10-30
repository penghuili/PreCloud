import { IconButton, Spinner } from 'native-base';
import React from 'react';

import useColors from '../hooks/useColors';
import { pickFiles } from '../lib/files/actions';
import Icon from './Icon';

function PickFilesButton({ isDisabled, isLoading, onStart, onSelected }) {
  const colors = useColors();

  async function handlePress() {
    onStart(true);
    const pickedFiles = await pickFiles();

    await onSelected(pickedFiles);

    onStart(false);
  }

  return (
    <IconButton
      icon={
        isLoading ? (
          <Spinner size={32} />
        ) : (
          <Icon name="documents-outline" size={32} color={colors.white} />
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

export default PickFilesButton;
