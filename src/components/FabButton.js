import { Fab } from 'native-base';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import useColors from '../hooks/useColors';
import Icon from './Icon';

function FabButton({ icon, onPress }) {
  const colors = useColors();
  const { bottom } = useSafeAreaInsets();

  return (
    <Fab
      bottom={bottom + 20}
      renderInPortal={false}
      shadow={2}
      size="sm"
      icon={icon || <Icon name="add-outline" size={32} color={colors.white} />}
      onPress={onPress}
    />
  );
}

export default FabButton;
