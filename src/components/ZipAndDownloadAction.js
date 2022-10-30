import { Actionsheet } from 'native-base';
import React, { useState } from 'react';

import useColors from '../hooks/useColors';
import { downloadFile } from '../lib/files/actions';
import { zipFolder } from '../lib/files/zip';
import { showToast } from '../lib/toast';
import Icon from './Icon';

function ZipAndDownloadAction({ folder, onDownloaded }) {
  const colors = useColors();

  const [isPending, setIsPending] = useState(false);

  async function handlePress() {
    setIsPending(true);

    const zipped = await zipFolder(folder.name, folder.path);
    if (zipped) {
      const message = await downloadFile({ name: zipped.name, path: zipped.path });
      if (message) {
        showToast(message);
      }
    }

    setIsPending(false);
    onDownloaded();
  }

  return (
    <Actionsheet.Item
      startIcon={<Icon name="download-outline" color={colors.text} />}
      onPress={handlePress}
      isLoading={isPending}
      isDisabled={isPending}
    >
      Zip and download folder
    </Actionsheet.Item>
  );
}

export default ZipAndDownloadAction;
