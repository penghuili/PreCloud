import { Actionsheet } from 'native-base';
import React, { useState } from 'react';

import useColors from '../hooks/useColors';
import { deleteFile, shareFile } from '../lib/files/actions';
import { zipFolder } from '../lib/files/zip';
import { showToast } from '../lib/toast';
import Icon from './Icon';

function ZipAndShareAction({ folder, label, onShared }) {
  const colors = useColors();

  const [isPending, setIsPending] = useState(false);

  async function handlePress() {
    setIsPending(true);

    const zipped = await zipFolder(folder.name, folder.path);
    if (zipped) {
      const success = await shareFile({ name: zipped.name, path: zipped.path, saveToFiles: false });
      if (success) {
        showToast(`Shared! Please don't rename zipped file.`, 'success', 6);
      }
    } else {
      showToast('Share folder failed.', 'error');
    }

    setIsPending(false);
    onShared();

    deleteFile(zipped.path);
  }

  return (
    <Actionsheet.Item
      startIcon={<Icon name="share-outline" color={colors.text} />}
      onPress={handlePress}
      isLoading={isPending}
      isDisabled={isPending}
    >
      {label || 'Zip and share folder'}
    </Actionsheet.Item>
  );
}

export default ZipAndShareAction;
