import { IconButton, Spinner, Text } from 'native-base';
import React, { useState } from 'react';

import useColors from '../hooks/useColors';
import { asyncForEach } from '../lib/array';
import { moveFile, pickFiles } from '../lib/files/actions';
import { noteExtension } from '../lib/files/constant';
import { showToast } from '../lib/toast';
import Confirm from './Confirm';
import Icon from './Icon';

function PickNotesButton({ folder, onStart, isDisabled, isLoading, onSelected }) {
  const colors = useColors();

  const [showConfirm, setShowConfirm] = useState(false);

  async function handlePress() {
    onStart(true);
    const picked = await pickFiles();
    const filtered = picked.filter(f => f.name.endsWith(noteExtension));
    await asyncForEach(filtered, async file => {
      await moveFile(file.path, `${folder.path}/${file.name}`);
    });

    await onSelected(filtered);

    if (filtered.length) {
      showToast(`Selected ${filtered.length} ${filtered.length === 1 ? 'note' : 'notes'}.`);
    } else {
      showToast('No notes selected.');
    }

    onStart(false);
  }

  return (
    <>
      <IconButton
        icon={
          isLoading ? (
            <Spinner size={32} />
          ) : (
            <Icon name="newspaper-outline" size={32} color={colors.white} />
          )
        }
        size="md"
        variant="solid"
        mr="2"
        isLoading={isLoading}
        isDisabled={isDisabled || isLoading}
        onPress={() => setShowConfirm(true)}
      />
      <Confirm
        isOpen={showConfirm}
        message={
          <Text>
            Only select files ending with <Text highlight>.{noteExtension}</Text>
          </Text>
        }
        onClose={() => {
          setShowConfirm(false);
        }}
        onConfirm={async () => {
          setShowConfirm(false);
          handlePress();
        }}
      />
    </>
  );
}

export default PickNotesButton;
