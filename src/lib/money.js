import { isAndroid } from './device';

const { buildDate } = require('../lib/app-settings.json');

export function showDonate() {
  // eslint-disable-next-line no-undef
  return isAndroid() || Date.now() > buildDate + 3 * 24 * 60 * 60 * 1000 || !!__DEV__;
}
