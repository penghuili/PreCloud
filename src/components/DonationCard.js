import { Button, Text, VStack } from 'native-base';
import React from 'react';

import useColors from '../hooks/useColors';

function DonationCard({ product, onPress }) {
  const colors = useColors();

  const price = product?.localizedPrice || product?.oneTimePurchaseOfferDetails?.formattedPrice;

  if (!price) {
    return null;
  }

  return (
    <VStack
      borderWidth="2"
      borderColor={colors.primary}
      borderRadius="md"
      width="full"
      p="2"
      alignItems="center"
      space="sm"
    >
      <Text>
        Donate <Text>{price}</Text> to PreCloud
      </Text>

      <Button onPress={() => onPress(product)}>Donate</Button>
    </VStack>
  );
}

export default DonationCard;
