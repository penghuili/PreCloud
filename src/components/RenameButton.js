import { IconButton } from 'native-base';
import React from 'react';

import useColors from '../hooks/useColors';
import { routeNames } from '../router/routes';
import Icon from './Icon';

function RenameButton({ file, navigate, onRename }) {
  const colors = useColors();

  async function handlePress() {
    onRename();
    navigate(routeNames.renameFileForm, {
      file: { name: file.name, path: file.path },
    });
  }

  return (
    <IconButton
      icon={<Icon name="create-outline" size={20} color={colors.text} />}
      size="sm"
      variant="subtle"
      mr="2"
      onPress={handlePress}
    />
  );
}

export default RenameButton;
