import { IconButton, Spinner } from 'native-base';
import React from 'react';
import DocumentPicker, { types } from 'react-native-document-picker';

import useColors from '../hooks/useColors';
import { asyncForEach } from '../lib/array';
import { deleteFile } from '../lib/files/actions';
import { extractFilePath } from '../lib/files/helpers';
import { unzipFolder } from '../lib/files/zip';
import { hideToast, showToast } from '../lib/toast';
import Icon from './Icon';

function PickFilesButton({ isDisabled, isLoading, onStart, onSelected }) {
  const colors = useColors();

  async function handlePress() {
    onStart(true);
    try {
      setTimeout(() => {
        showToast('Copying files ...', 'info', 300);
      }, 1000);

      const result = await DocumentPicker.pick({
        allowMultiSelection: true,
        type: types.allFiles,
        presentationStyle: 'fullScreen',
        copyTo: 'cachesDirectory',
      });
      hideToast();

      const mapped = result.map(f => ({
        name: f.name,
        size: f.size,
        path: extractFilePath(f.fileCopyUri),
      }));

      const pickedFiles = [];
      await asyncForEach(mapped, async file => {
        if (file.name.endsWith('zip')) {
          const unzipped = await unzipFolder(file.name, file.path);
          if (unzipped) {
            pickedFiles.push({ ...file, ...unzipped });
            await deleteFile(file.path);
          }
        } else {
          pickedFiles.push(file);
        }
      });

      await onSelected(pickedFiles);
    } catch (e) {
      hideToast();
      console.log('Pick files failed', e);
    }

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
