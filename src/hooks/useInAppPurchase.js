import { useEffect } from 'react';
import {
  endConnection,
  finishTransaction,
  flushFailedPurchasesCachedAsPendingAndroid,
  initConnection,
  purchaseErrorListener,
  purchaseUpdatedListener,
} from 'react-native-iap';

import { isAndroid } from '../lib/device';
import { showToast } from '../lib/toast';

let purchaseUpdateSubscription = null;
let purchaseErrorSubscription = null;

async function flushAndroid() {
  if (isAndroid()) {
    return flushFailedPurchasesCachedAsPendingAndroid().catch(e => {
      console.log('flushFailedPurchasesCachedAsPendingAndroid failed', e);
    });
  }

  return Promise.resolve();
}

function useInAppPurchase() {
  useEffect(() => {
    initConnection()
      .then(flushAndroid)
      .then(() => {
        purchaseUpdateSubscription = purchaseUpdatedListener(async purchase => {
          console.log('purchaseUpdatedListener', purchase);
          const receipt = purchase.transactionReceipt;
          if (receipt) {
            await finishTransaction({ purchase, isConsumable: true });
            console.log('purchase succeeded', receipt);
            showToast('Thank you very much for your support!')
          } else {
            console.log('purchase without receipt', purchase);
          }
        });

        purchaseErrorSubscription = purchaseErrorListener(error => {
          console.warn('purchaseErrorListener', error);
        });
      })
      .catch(e => {
        console.log('init purchase failed', e);
      });

    return () => {
      if (purchaseUpdateSubscription) {
        purchaseUpdateSubscription.remove();
        purchaseUpdateSubscription = null;
      }

      if (purchaseErrorSubscription) {
        purchaseErrorSubscription.remove();
        purchaseErrorSubscription = null;
      }

      endConnection();
    };
  }, []);
}

export default useInAppPurchase;
