import { IconButton, Spinner } from 'native-base';
import React from 'react';
import DocumentPicker, { types } from 'react-native-document-picker';

import useColors from '../hooks/useColors';
import { extractFilePath } from '../lib/files';
import Icon from './Icon';

function PickFilesButton({ isDisabled, isLoading, onSelected }) {
  const colors = useColors();

  async function handlePress() {
    try {
      const result = await DocumentPicker.pick({
        allowMultiSelection: true,
        type: types.allFiles,
        presentationStyle: 'fullScreen',
        copyTo: 'cachesDirectory',
      });
      const pickedFiles = result.map(f => ({
        name: f.name,
        size: f.size,
        path: extractFilePath(f.fileCopyUri),
      }));

      await onSelected(pickedFiles);
    } catch (e) {
      console.log('Pick files failed', e);
    }
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
