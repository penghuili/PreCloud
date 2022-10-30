import { Actionsheet } from 'native-base';
import React, { useState } from 'react';

import useColors from '../hooks/useColors';
import { deleteFile, pickFiles, readFolder } from '../lib/files/actions';
import { showToast } from '../lib/toast';
import Confirm from './Confirm';
import Icon from './Icon';

function UnzipFolderAction({ label, confirmMessage, folderPrefix, onUnzipped }) {
  const colors = useColors();

  const [isPending, setIsPending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handlePress() {
    setShowConfirm(false);
    setIsPending(true);

    const picked = await pickFiles({ allowMultiSelection: false });
    const unzipped = picked[0];
    if (unzipped && unzipped.isDirectory()) {
      if (!unzipped.name.startsWith(folderPrefix)) {
        showToast(
          `Please only pick zipped file, and file name should start with "${folderPrefix}".`
        );
      } else {
        const files = await readFolder(unzipped.path);

        await onUnzipped(files);
      }
    } else {
      showToast('Import failed', 'error');
    }

    if (unzipped) {
      await deleteFile(unzipped.path);
    }

    setIsPending(false);
  }

  return (
    <>
      <Confirm
        isOpen={showConfirm}
        message={confirmMessage}
        onClose={() => {
          setShowConfirm(false);
        }}
        onConfirm={handlePress}
        isDanger
      />
      <Actionsheet.Item
        startIcon={<Icon name="folder-open-outline" color={colors.text} />}
        onPress={() => setShowConfirm(true)}
        isLoading={isPending}
        isDisabled={isPending}
      >
        {label || 'Import zipped folder'}
      </Actionsheet.Item>
    </>
  );
}

export default UnzipFolderAction;
