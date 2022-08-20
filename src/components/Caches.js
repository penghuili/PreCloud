import {
  Button,
  HStack,
  IconButton,
  PresenceTransition,
  Text,
  useToast,
  VStack,
} from 'native-base';
import React, { useEffect, useState } from 'react';
import { types } from 'react-native-document-picker';
import RNFS from 'react-native-fs';

import {
  bytesToMB,
  emptyFolder,
  extractFileNameFromPath,
  filePaths,
  getFolderSize,
  shareFile,
} from '../lib/files';
import { LocalStorage, mimeTypePrefix } from '../lib/localstorage';
import { routeNames } from '../router/Router';
import Icon from './Icon';

async function readCachedFiles(path) {
  try {
    const files = await RNFS.readDir(path);
    return (files || []).map(file => ({ ...file, fileName: extractFileNameFromPath(file.path) }));
  } catch (e) {
    return [];
  }
}

function Caches({ currentRoute }) {
  const toast = useToast();
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

    readCachedFiles(filePaths.encrypted).then(setEncryptedFiles);
    readCachedFiles(filePaths.decrypted).then(setDecryptedFiles);
  }

  async function handleClearCache() {
    await emptyFolder(RNFS.CachesDirectoryPath);
    await readFilesInCache();
    setShowCaches(false);
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
            icon={<Icon name={showCaches ? 'chevron-up-sharp' : 'chevron-down-sharp'} size={24} />}
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
                  <VStack key={file.fileName}>
                    <Text w="xs">{file.fileName}</Text>
                    <HStack alignItems="center">
                      <IconButton
                        icon={<Icon name="download-outline" size={24} />}
                        onPress={async () => {
                          await shareFile(file.fileName, file.path, types.plainText);
                          toast.show({ title: 'Downloaded.' });
                        }}
                        mr="4"
                      />
                      <IconButton
                        icon={<Icon name="trash-outline" size={24} />}
                        onPress={async () => {
                          await RNFS.unlink(file.path);
                          await readFilesInCache();
                        }}
                      />
                    </HStack>
                  </VStack>
                ))}
              </>
            )}

            {decryptedFiles.length > 0 && (
              <>
                <Text bold mt="2">
                  Decrypted files
                </Text>
                {decryptedFiles.map(file => (
                  <VStack key={file.fileName}>
                    <Text w="xs">{file.fileName}</Text>
                    <HStack alignItems="center">
                      <IconButton
                        icon={<Icon name="download-outline" size={24} />}
                        onPress={async () => {
                          const mimeType = await LocalStorage.get(
                            `${mimeTypePrefix}${file.fileName}`
                          );
                          if (!mimeType) {
                            toast.show({ title: 'Download failed.' });
                          } else {
                            await shareFile(file.fileName, file.path, mimeType);
                            toast.show({ title: 'Downloaded.' });
                          }
                        }}
                        mr="4"
                      />
                      <IconButton
                        icon={<Icon name="trash-outline" size={24} />}
                        onPress={async () => {
                          await RNFS.unlink(file.path);
                          await LocalStorage.remove(`${mimeTypePrefix}${file.fileName}`);
                          await readFilesInCache();
                        }}
                      />
                    </HStack>
                  </VStack>
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
