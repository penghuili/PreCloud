import { addMonths, addSeconds, addWeeks } from 'date-fns';
import { Box, HStack } from 'native-base';
import React, { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import useColors from '../hooks/useColors';
import { LocalStorage, LocalStorageKeys } from '../lib/localstorage';
import { showDonate } from '../lib/money';
import DonateMessage from './DonateMessage';
import Icon from './Icon';

function DonateBanner() {
  const { bottom } = useSafeAreaInsets();
  const colors = useColors();

  const [checkDate, setCheckDate] = useState();
  const [donateDate, setDonateDate] = useState();

  useEffect(() => {
    LocalStorage.get(LocalStorageKeys.donateBannerCheckDate).then(date => {
      setCheckDate(date);
      if (!date) {
        LocalStorage.set(LocalStorageKeys.donateBannerCheckDate, Date.now());
      }
    });

    LocalStorage.get(LocalStorageKeys.donateBannerDonateDate).then(date => {
      setDonateDate(date);
    });
  }, []);

  function updateCheckDate() {
    const date = Date.now();
    LocalStorage.set(LocalStorageKeys.donateBannerCheckDate, date);
    setCheckDate(date);
  }

  function updateDonateDate() {
    const date = Date.now();
    LocalStorage.set(LocalStorageKeys.donateBannerDonateDate, date);
    setDonateDate(date);
  }

  function canShowBanner() {
    if (!showDonate() || !checkDate) {
      return false;
    }

    // eslint-disable-next-line no-undef
    if (!__DEV__ && addWeeks(+checkDate, 1).getTime() > Date.now()) {
      return false;
    }

    // eslint-disable-next-line no-undef
    if (__DEV__ && addSeconds(+checkDate, 10).getTime() > Date.now()) {
      return false;
    }

    // eslint-disable-next-line no-undef
    if (!__DEV__ && donateDate && addMonths(+donateDate, 1).getTime() > Date.now()) {
      return false;
    }

    // eslint-disable-next-line no-undef
    if (__DEV__ && donateDate && addSeconds(+checkDate, 20).getTime() > Date.now()) {
      return false;
    }

    return true;
  }

  if (!canShowBanner()) {
    return null;
  }

  return (
    <HStack
      position="absolute"
      bottom={50 + bottom}
      bg={colors.orange}
      w="full"
      p="2"
      pr="8"
      alignItems="flex-start"
      justifyContent="flex-start"
    >
      <DonateMessage
        color={colors.white}
        onDonate={() => {
          updateCheckDate();
          updateDonateDate();
        }}
      />
      <Box position="absolute" right="2" top="2">
        <Icon name="close-outline" color={colors.white} onPress={updateCheckDate} />
      </Box>
    </HStack>
  );
}

export default DonateBanner;
