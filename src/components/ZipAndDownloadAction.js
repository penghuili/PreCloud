import { Actionsheet } from 'native-base';
import React, { useState } from 'react';

import useColors from '../hooks/useColors';
import { deleteFile, downloadFile } from '../lib/files/actions';
import { zipFolder } from '../lib/files/zip';
import { showToast } from '../lib/toast';
import Icon from './Icon';

function ZipAndDownloadAction({ folder, label, onDownloaded }) {
  const colors = useColors();

  const [isPending, setIsPending] = useState(false);

  async function handlePress() {
    setIsPending(true);

    const zipped = await zipFolder(folder.name, folder.path);
    if (zipped) {
      const message = await downloadFile({ name: zipped.name, path: zipped.path });
      if (message) {
        showToast(`${message} Please don't rename zipped file.`, 'success', 6);
      }
    }

    setIsPending(false);
    onDownloaded();

    deleteFile(zipped.path);
  }

  return (
    <Actionsheet.Item
      startIcon={<Icon name="download-outline" color={colors.text} />}
      onPress={handlePress}
      isLoading={isPending}
      isDisabled={isPending}
    >
      {label || 'Zip and download folder'}
    </Actionsheet.Item>
  );
}

export default ZipAndDownloadAction;
