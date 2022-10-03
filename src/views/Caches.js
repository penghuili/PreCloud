import { Button, HStack, Text, VStack } from 'native-base';
import React, { useEffect, useState } from 'react';
import RNFS from 'react-native-fs';

import AppBar from '../components/AppBar';
import ContentWrapper from '../components/ContentWrapper';
import FileItem from '../components/FileItem';
import ScreenWrapper from '../components/ScreenWrapper';
import {
  bytesToMB,
  emptyFolder,
  extractFileNameFromPath,
  getFolderSize,
  internalFilePaths,
} from '../lib/files';
import { useStore } from '../store/store';

async function readFilesInFolder(path) {
  try {
    const files = await RNFS.readDir(path);
    return (files || [])
      .map(file => ({ ...file, fileName: extractFileNameFromPath(file.path) }))
      .filter(file => !file.name.includes('A Document Being Saved By PreCloud'));
  } catch (e) {
    return [];
  }
}

function Caches() {
  const setEncryptedFilesInStore = useStore(state => state.setEncryptedFiles);
  const setDecryptedFilesInStore = useStore(state => state.setDecryptedFiles);

  const [cacheSize, setCacheSize] = useState(0);
  const [encryptedFiles, setEncryptedFiles] = useState([]);
  const [decryptedFiles, setDecryptedFiles] = useState([]);

  useEffect(() => {
    readFilesInCache();
  }, []);

  async function readFilesInCache() {
    getFolderSize(RNFS.CachesDirectoryPath).then(size => {
      setCacheSize(bytesToMB(size));
    });

    readFilesInFolder(internalFilePaths.encrypted).then(setEncryptedFiles);
    readFilesInFolder(internalFilePaths.decrypted).then(setDecryptedFiles);
  }

  async function handleClearCache() {
    await emptyFolder(RNFS.CachesDirectoryPath);
    await readFilesInCache();
    setEncryptedFilesInStore([]);
    setDecryptedFilesInStore([]);
  }

  const hasCachedFile = encryptedFiles.length > 0 || decryptedFiles.length > 0;

  return (
    <ScreenWrapper>
      <AppBar title="Caches" hasBack />
      <ContentWrapper>
        <HStack alignItems="center" space="sm">
          <Text>Cache: {cacheSize}MB</Text>

          {cacheSize > 0 && (
            <Button size="sm" onPress={handleClearCache}>
              Clear
            </Button>
          )}
        </HStack>

        {hasCachedFile && (
          <VStack space="xs" alignItems="flex-start" ml="2">
            {encryptedFiles.length > 0 && (
              <>
                <Text bold mt="2">
                  Encrypted files
                </Text>
                {encryptedFiles.map(file => (
                  <FileItem
                    key={file.fileName}
                    file={file}
                    forEncrypt
                    canRename={false}
                    onDelete={async () => {
                      await readFilesInCache();
                    }}
                  />
                ))}
              </>
            )}

            {decryptedFiles.length > 0 && (
              <>
                <Text bold mt="2">
                  Decrypted files
                </Text>
                {decryptedFiles.map(file => (
                  <FileItem
                    key={file.fileName}
                    file={file}
                    forEncrypt={false}
                    canRename={false}
                    onDelete={async () => {
                      await readFilesInCache();
                    }}
                  />
                ))}
              </>
            )}
          </VStack>
        )}
      </ContentWrapper>
    </ScreenWrapper>
  );
}

export default Caches;
