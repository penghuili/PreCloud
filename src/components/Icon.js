import React from 'react';
import Ionicon from 'react-native-vector-icons/Ionicons';

import useColors from '../hooks/useColors';

function Icon({ name, size, color, onPress }) {
  const colors = useColors();
  const innerSize = !size || typeof size !== 'number' ? 24 : size;
  return <Ionicon name={name} size={innerSize} color={color || colors.text} onPress={onPress} />;
}

export default Icon;
