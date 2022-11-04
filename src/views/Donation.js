import { Alert, Heading, HStack, Text, VStack } from 'native-base';
import React, { useEffect, useState } from 'react';
import { requestPurchase, useIAP } from 'react-native-iap';

import AppBar from '../components/AppBar';
import ContentWrapper from '../components/ContentWrapper';
import DonationCard from '../components/DonationCard';
import ScreenWrapper from '../components/ScreenWrapper';
import { isAndroid } from '../lib/device';

function Donation() {
  const { products, getProducts } = useIAP();

  const [donations, setDonations] = useState([]);

  async function loadProducts() {
    try {
      await getProducts({ skus: ['donation1', 'donation2', 'donation3'] });
      setDonations((products || []).sort((a, b) => a.price - b.price));
    } catch (e) {
      console.log('load products failed', e);
    }
  }

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDonate(product) {
    try {
      const payload = isAndroid()
        ? { skus: [product.productId] }
        : { sku: product.productId, andDangerouslyFinishTransactionAutomaticallyIOS: false };
      await requestPurchase(payload);
    } catch (e) {
      console.log('donate failed', e);
    }
  }

  return (
    <ScreenWrapper>
      <AppBar title="Backup all your files and notes" hasBack />
      <ContentWrapper>
        <VStack space="sm">
          <HStack alignItems="center" justifyContent="center">
            <Heading>Backup</Heading>
          </HStack>

          <Alert w="100%" status="info" mb="4">
            <VStack space="sm">
              <Text fontSize="md">
                PreCloud has no cloud storage, all encrypted files and notes are saved on your
                phone.
              </Text>
              <Text fontSize="md">
                Please backup everything regularly, and save the backup to a cloud storage.
              </Text>
            </VStack>
          </Alert>

          {!!donations?.length && (
            <VStack space="sm" alignItems="flex-start">
              {donations.map(d => (
                <DonationCard key={d.productId} product={d} onPress={handleDonate} />
              ))}
              <Text>{JSON.stringify(donations)}</Text>
            </VStack>
          )}
        </VStack>
      </ContentWrapper>
    </ScreenWrapper>
  );
}

export default Donation;
