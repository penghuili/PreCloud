import { CachesDirectoryPath } from 'react-native-fs';

import { emptyFolder } from './helpers';

export const cachePath = CachesDirectoryPath;

export async function emptyCache() {
  await emptyFolder(cachePath);
}
