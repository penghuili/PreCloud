import { Button, HStack, Text } from 'native-base';
import React, { useEffect, useState } from 'react';
import RNFS from 'react-native-fs';

import { emptyFolder, getFolderSize, getSizeText } from '../lib/files';
import { routeNames } from '../router/routes';

function Caches({ route }) {
  const [cacheSize, setCacheSize] = useState('');

  useEffect(() => {
    if (route === routeNames.settings) {
      readFilesInCache();
    }
  }, [route]);

  async function readFilesInCache() {
    const size = await getFolderSize(RNFS.CachesDirectoryPath);
    setCacheSize(getSizeText(size));
  }

  async function handleClearCache() {
    await emptyFolder(RNFS.CachesDirectoryPath);
    await readFilesInCache();
  }

  return (
    <HStack alignItems="center" space="sm">
      <Text>Cache: {cacheSize}</Text>

      {cacheSize !== '0KB' && (
        <Button size="xs" onPress={handleClearCache}>
          Clear
        </Button>
      )}
    </HStack>
  );
}

export default Caches;
