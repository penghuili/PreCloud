import { Alert, Divider, Heading, Spinner, Text, VStack } from 'native-base';
import React, { useEffect, useState } from 'react';
import { Linking } from 'react-native';
import { requestPurchase, useIAP } from 'react-native-iap';

import AppBar from '../components/AppBar';
import ContentWrapper from '../components/ContentWrapper';
import DonationCard from '../components/DonationCard';
import ScreenWrapper from '../components/ScreenWrapper';
import useColors from '../hooks/useColors';
import { isAndroid } from '../lib/device';
import { showDonate } from '../lib/money';

function Donation() {
  const colors = useColors();
  const { products, getProducts } = useIAP();

  const [isLoading, setIsLoading] = useState(false);
  const [donations, setDonations] = useState([]);

  async function loadProducts() {
    setIsLoading(true);
    try {
      await getProducts({ skus: ['donation1', 'donation2', 'donation3'] });
    } catch (e) {
      console.log('load products failed', e);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setDonations((products || []).sort((a, b) => a.price - b.price));
  }, [products]);

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
      <AppBar title="Donate to PreCloud" hasBack />
      <ContentWrapper>
        <VStack space="sm">
          <Alert w="100%" status="info" mb="4">
            <Text fontSize="md">
              PreCloud is free forever, open sourced, has no tracking. Please consider donating to
              this project. 🫶
            </Text>
          </Alert>

          {showDonate() && (
            <>
              <VStack space="sm" alignItems="flex-start">
                <Heading>Donate with PayPal or Ko-Fi</Heading>
                <Text bold>
                  Please use PayPal or Ko-Fi to donate, so we don&lsquo;t need to pay the 15% fee to{' '}
                  {isAndroid() ? 'Google' : 'Apple'}.
                </Text>
                <Text
                  bold
                  underline
                  color={colors.primary}
                  onPress={() => {
                    Linking.openURL(`https://ko-fi.com/penghuili`);
                  }}
                >
                  Ko-Fi
                </Text>
                <Text
                  bold
                  underline
                  color={colors.primary}
                  onPress={() => {
                    Linking.openURL(`https://paypal.me/penghuili/`);
                  }}
                >
                  PayPal
                </Text>
              </VStack>

              <Divider />
            </>
          )}

          {isLoading && <Spinner />}
          {!!donations?.length && (
            <VStack space="sm" alignItems="flex-start">
              <Heading>Donate with in-app-purchase</Heading>
              {donations.map(d => (
                <DonationCard key={d.productId} product={d} onPress={handleDonate} />
              ))}
            </VStack>
          )}
        </VStack>
      </ContentWrapper>
    </ScreenWrapper>
  );
}

export default Donation;
