import { Text } from 'native-base';
import React from 'react';
import { Linking } from 'react-native';

import useColors from '../hooks/useColors';

function DonateMessage({ onDonate, color }) {
  const colors = useColors();

  return (
    <Text color={color} bold>
      🫶 Consider donating $1 to this free and open source app:{' '}
      <Text
        bold
        underline
        color={colors.primary}
        onPress={() => {
          if (onDonate) {
            onDonate();
          }
          Linking.openURL(`https://paypal.me/penghuili/`);
        }}
      >
        PayPal
      </Text>{' '}
      or{' '}
      <Text
        bold
        underline
        color={colors.primary}
        onPress={() => {
          if (onDonate) {
            onDonate();
          }
          Linking.openURL(`https://ko-fi.com/penghuili`);
        }}
      >
        Ko-Fi
      </Text>
    </Text>
  );
}

export default DonateMessage;
