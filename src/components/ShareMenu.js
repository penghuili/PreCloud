import React, { useCallback, useEffect, useState } from 'react';
import RNShareMenu from 'react-native-share-menu';
import RNFS from 'react-native-fs';
import { Image, Text, View } from 'native-base';

function ShareMenu({ title }) {
  const [sharedData, setSharedData] = useState(null);
  const [sharedMimeType, setSharedMimeType] = useState(null);

  function getFileSizeFromBase64(b64) {
    const last2 = b64.slice(b64.length - 3);
    let y = 0;
    if (last2 === '==') {
      y = 2;
    } else if (last2.includes('=')) {
      y = 1;
    }

    return b64.length * (3 / 4) - y;
  }

  const handleShare = useCallback(async item => {
    if (!item) {
      return;
    }

    const { mimeType, data, extraData } = item;
    console.log(item);

    setSharedData(data);
    setSharedMimeType(mimeType);
    console.log(mimeType, data, extraData);

    const newPath = `${RNFS.CachesDirectoryPath}/${Date.now()}`;
    await RNFS.copyFile(data, newPath);

    try {
      const stats = await RNFS.stat(newPath);
      console.log('new path info', stats);
    } catch (e) {
      console.log('new path error', e);
    }

    try {
      const stats = await RNFS.readFile(data, 'base64');
      console.log(getFileSizeFromBase64(stats) / 1024);
    } catch (e) {
      console.log(e);
    }
  }, []);

  useEffect(() => {
    RNShareMenu.getInitialShare(handleShare);

    // RNFS.readDir(RNFS.CachesDirectoryPath).then(e => {
    //   console.log(e);
    //   RNFS.stat(e[0].path).then(ee => {
    //     console.log('sdsf', ee.size)
    //   })
    // });
  }, []);

  useEffect(() => {
    const listener = RNShareMenu.addNewShareListener(handleShare);

    return () => {
      listener.remove();
    };
  }, []);

  if (!sharedMimeType) {
    return null;
  }

  if (sharedMimeType === 'text/plain') {
    // The user shared text
    return <Text>Shared text: {sharedData}</Text>;
  }

  if (sharedMimeType.startsWith('image/')) {
    // The user shared an image
    return (
      <View>
        <Text>Shared image:</Text>
        <Image source={{ uri: sharedData }} />
      </View>
    );
  }

  // The user shared a file in general
  return (
    <View>
      <Text>Shared mime type: {sharedMimeType}</Text>
      <Text>Shared file location: {sharedData}</Text>
    </View>
  );
}

export default ShareMenu;
