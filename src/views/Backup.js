import { format } from 'date-fns';
import { Alert, Button, Divider, Heading, HStack, Text, VStack } from 'native-base';
import React, { useState } from 'react';

import AppBar from '../components/AppBar';
import Confirm from '../components/Confirm';
import ContentWrapper from '../components/ContentWrapper';
import Icon from '../components/Icon';
import ScreenWrapper from '../components/ScreenWrapper';
import useColors from '../hooks/useColors';
import { asyncForEach } from '../lib/array';
import {
  deleteFile,
  downloadFile,
  moveFile,
  pickFiles,
  readFolder,
  shareFile,
} from '../lib/files/actions';
import { filesFolder, filesFolderName, precloudFolder } from '../lib/files/constant';
import { zipFolder } from '../lib/files/zip';
import { showToast } from '../lib/toast';
import { useStore } from '../store/store';

const backupPrefix = 'PreCloud-backup-';

function Backup() {
  const colors = useColors();
  const loadRootFolders = useStore(state => state.loadRootFolders);

  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  async function zipEverything() {
    const zippedName = `${backupPrefix}${format(new Date(), 'yyyyMMddHHmm')}`;
    const zipped = await zipFolder(zippedName, precloudFolder);
    return zipped;
  }

  async function handleDownload() {
    setIsDownloading(true);

    const zipped = await zipEverything();
    if (zipped) {
      const message = await downloadFile({ name: zipped.name, path: zipped.path });
      if (message) {
        showToast(`${message} Please don't rename the zipped file.`, 'success', 6);
      }

      deleteFile(zipped.path);
    }

    setIsDownloading(false);
  }

  async function handleShare() {
    setIsSharing(true);

    const zipped = await zipEverything();
    if (zipped) {
      const success = await shareFile({ name: zipped.name, path: zipped.path, saveToFiles: false });
      if (success) {
        showToast(`Shared! Please don't rename zipped file.`, 'success', 6);
      }

      deleteFile(zipped.path);
    } else {
      showToast('Share folder failed.', 'error');
    }

    setIsSharing(false);
  }

  async function handleImport() {
    setShowImportConfirm(false);
    setIsImporting(true);

    const picked = await pickFiles({ allowMultiSelection: false });
    const unzipped = picked[0];
    if (unzipped && unzipped.isDirectory()) {
      if (!unzipped.name.startsWith(backupPrefix)) {
        showToast(`Please only pick .zip file, and file name should start with "${backupPrefix}".`);
      } else {
        const res = await readFolder(unzipped.path);
        const allFiles = res.find(r => r.name === filesFolderName);

        if (allFiles) {
          const folders = await readFolder(allFiles.path);
          await asyncForEach(folders, async folder => {
            await moveFile(folder.path, `${filesFolder}/${folder.name}`);
          });

          await loadRootFolders();
        }

        if (allFiles || allFiles) {
          showToast('Everything is imported!');
        }
      }
    } else {
      showToast('Select backup failed.', 'error');
    }

    if (unzipped) {
      await deleteFile(unzipped.path);
    }

    setIsImporting(false);
  }

  const isPending = isDownloading || isSharing || isImporting;

  function renderExport() {
    return (
      <>
        <HStack alignItems="center" justifyContent="center">
          <Heading>Backup</Heading>
        </HStack>

        <Alert w="100%" status="info" mb="4">
          <VStack space="sm">
            <Text fontSize="md">
              PreCloud has no cloud storage, all encrypted files and notes are saved on your phone.
            </Text>
            <Text fontSize="md">
              Please backup everything regularly, and save the backup to a cloud storage.
            </Text>
          </VStack>
        </Alert>

        <VStack space="sm" alignItems="flex-start">
          <Button
            startIcon={<Icon name="download-outline" color={colors.white} />}
            onPress={handleDownload}
            isDisabled={isPending}
            isLoading={isDownloading}
          >
            Zip everything and download
          </Button>
          <Button
            startIcon={<Icon name="share-outline" color={colors.white} />}
            onPress={handleShare}
            isDisabled={isPending}
            isLoading={isSharing}
          >
            Zip everything and share
          </Button>
        </VStack>
      </>
    );
  }

  function renderImport() {
    return (
      <>
        <HStack alignItems="center" justifyContent="center">
          <Heading>Import backup</Heading>
        </HStack>

        <Alert w="100%" status="warning" mb="4">
          <VStack space="sm">
            <Text fontSize="md">
              Please only pick .zip file, and file name should start with &ldquo;{backupPrefix}
              &rdquo;.
            </Text>
            <Text fontSize="md">
              <Text bold>Important note</Text>: Imported folders or notebooks will overwrite
              existing ones.
            </Text>
          </VStack>
        </Alert>

        <VStack space="sm" alignItems="flex-start">
          <Button
            startIcon={<Icon name="folder-open-outline" color={colors.white} />}
            onPress={() => setShowImportConfirm(true)}
            isDisabled={isPending}
            isLoading={isImporting}
          >
            Import backup
          </Button>
        </VStack>
      </>
    );
  }

  return (
    <ScreenWrapper>
      <AppBar title="Backup all your files and notes" hasBack />
      <ContentWrapper>
        <VStack space="sm">
          {renderExport()}

          <Divider my="8" />

          {renderImport()}
        </VStack>

        <Confirm
          isOpen={showImportConfirm}
          message={`Please only pick .zip file, and file name should start with "${backupPrefix}".\n\nImportant note: Imported folders or notebooks will overwrite existing ones.`}
          onClose={() => {
            setShowImportConfirm(false);
          }}
          onConfirm={handleImport}
          isDanger
        />
      </ContentWrapper>
    </ScreenWrapper>
  );
}

export default Backup;
