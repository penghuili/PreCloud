import { Actionsheet, Text } from 'native-base';
import React, { useState } from 'react';

import useColors from '../hooks/useColors';
import { asyncForEach } from '../lib/array';
import { moveFile, pickFiles } from '../lib/files/actions';
import { noteExtension } from '../lib/files/constant';
import { showToast } from '../lib/toast';
import Confirm from './Confirm';
import Icon from './Icon';

function PickNotesButton({ folder, onStart, isDisabled, isLoading, onClose, onSelected }) {
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
      <Actionsheet.Item
        isLoading={isLoading}
        isDisabled={isDisabled || isLoading}
        startIcon={<Icon name="newspaper-outline" color={colors.text} />}
        onPress={() => {
          setShowConfirm(true);
          onClose();
        }}
      >
        Pick notes
      </Actionsheet.Item>

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
