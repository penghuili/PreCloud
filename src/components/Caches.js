import { Button, HStack, IconButton, PresenceTransition, Text, VStack } from 'native-base';
import React, { useEffect, useState } from 'react';
import RNFS from 'react-native-fs';
import useColors from '../hooks/useColors';

import {
  bytesToMB,
  emptyFolder,
  extractFileNameFromPath,
  getFolderSize,
  internalFilePaths,
} from '../lib/files';
import { routeNames } from '../router/Router';
import { useStore } from '../store/store';
import FileItem from './FileItem';
import Icon from './Icon';

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

function Caches({ currentRoute }) {
  const colors = useColors();
  const encryptedFilesInStore = useStore(state => state.encryptedFiles);
  const setEncryptedFilesInStore = useStore(state => state.setEncryptedFiles);
  const decryptedFile = useStore(state => state.decryptedFile);
  const setDecryptedFile = useStore(state => state.setDecryptedFile);

  const [cacheSize, setCacheSize] = useState(0);
  const [encryptedFiles, setEncryptedFiles] = useState([]);
  const [decryptedFiles, setDecryptedFiles] = useState([]);
  const [showCaches, setShowCaches] = useState(false);

  useEffect(() => {
    if (currentRoute === routeNames.settings) {
      readFilesInCache();
    }
  }, [currentRoute]);

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
    setShowCaches(false);
    setEncryptedFilesInStore([]);
    setDecryptedFile(null);
  }

  const hasCachedFile = encryptedFiles.length > 0 || decryptedFiles.length > 0;

  return (
    <>
      <HStack alignItems="center" space="sm">
        <Text>Cache: {cacheSize}MB</Text>

        {cacheSize > 0 && (
          <Button size="sm" onPress={handleClearCache}>
            Clear
          </Button>
        )}
        {hasCachedFile && (
          <IconButton
            icon={
              <Icon
                name={showCaches ? 'chevron-up-sharp' : 'chevron-down-sharp'}
                color={colors.text}
              />
            }
            onPress={() => {
              setShowCaches(!showCaches);
            }}
          />
        )}
      </HStack>

      {hasCachedFile && showCaches && (
        <PresenceTransition
          visible={showCaches}
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
            transition: {
              duration: 250,
            },
          }}
        >
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
                    onDelete={async () => {
                      setEncryptedFilesInStore(encryptedFilesInStore.filter(f => f.fileName !== file.fileName));
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
                    onDelete={async () => {
                      if (decryptedFile && decryptedFile.fileName === file.fileName) {
                        setDecryptedFile(null);
                      }
                      await readFilesInCache();
                    }}
                  />
                ))}
              </>
            )}
          </VStack>
        </PresenceTransition>
      )}
    </>
  );
}

export default Caches;
