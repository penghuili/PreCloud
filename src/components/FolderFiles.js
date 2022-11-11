import { HStack, IconButton, Select, Text, VStack } from 'native-base';
import React, { useEffect, useState } from 'react';

import useColors from '../hooks/useColors';
import { asyncForEach, sortKeys, sortWith } from '../lib/array';
import { deleteFile, moveFile } from '../lib/files/actions';
import { getFileName } from '../lib/files/helpers';
import { ENCRYPTION_LIMIT_IN_GIGABYTES } from '../lib/openpgp/constant';
import { showToast } from '../lib/toast';
import Collapsible from './Collapsible';
import Confirm from './Confirm';
import DecryptFileModal from './DecryptFileModal';
import FileItem from './FileItem';
import FolderPicker from './FolderPicker';
import Icon from './Icon';

let selectedFiles = {};

function FolderFiles({ folder, files, navigate, onMoveFiles, onDelete }) {
  const colors = useColors();

  const [showDecryptModal, setShowDecryptModal] = useState(false);
  const [activeFile, setActiveFile] = useState(null);
  const [activeFileIndex, setActiveFileIndex] = useState(null);
  const [sortKey, setSortKey] = useState(sortKeys.mtime);
  const [sortedFiles, setSortedFiles] = useState(files);

  const [isSelectingMultiple, setIsSelectingMultiple] = useState(false);
  const [showFolderPicker, setShowFolderPicker] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  useEffect(() => {
    sortFiles(sortKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  function sortFiles(newKey) {
    setSortedFiles(sortWith(files, newKey));
  }

  function handleFinishSelectMultiple() {
    setIsSelectingMultiple(false);
    selectedFiles = {};
  }

  async function handleMoveFiles(newFolder) {
    const paths = Object.keys(selectedFiles).filter(path => selectedFiles[path]);
    if (paths.length) {
      await asyncForEach(paths, async path => {
        await moveFile(path, `${newFolder.path}/${getFileName(path)}`);
      });

      onMoveFiles(selectedFiles);
      handleFinishSelectMultiple();
      showToast(`Moved ${paths.length} files!`);
    } else {
      showToast('Please select a file', 'info');
    }
  }

  async function handleDeleteFiles() {
    setShowDeleteAlert(false);
    const paths = Object.keys(selectedFiles).filter(path => selectedFiles[path]);
    if (paths.length) {
      await asyncForEach(paths, async path => {
        await deleteFile(path);
      });

      onMoveFiles(selectedFiles);
      handleFinishSelectMultiple();
      showToast(`Deleted ${paths.length} files!`);
    } else {
      showToast('Please select a file', 'info');
    }
  }

  function renderTopActions() {
    if (!isSelectingMultiple) {
      return (
        <HStack justifyContent="flex-end" h="12">
          <Select
            selectedValue={sortKey}
            mt="1"
            minWidth="150"
            onValueChange={value => {
              setSortKey(value);
              sortFiles(value);
            }}
            _selectedItem={{
              endIcon: <Icon name="checkmark-outline" size={24} color={colors.primary} />,
            }}
            variant="filled"
          >
            <Select.Item label="Update time" value={sortKeys.mtime} />
            <Select.Item label="File name" value={sortKeys.name} />
            <Select.Item label="Random" value={sortKeys.random} />
          </Select>
        </HStack>
      );
    }

    return (
      <HStack justifyContent="space-between" w="full" h="12">
        <HStack space="sm">
          <IconButton
            icon={<Icon name="arrow-back-outline" size={24} color={colors.text} />}
            onPress={() => {
              setShowFolderPicker(true);
            }}
          />
          <IconButton
            icon={<Icon name="trash-outline" size={24} color={colors.text} />}
            onPress={() => setShowDeleteAlert(true)}
          />
        </HStack>
        <IconButton
          icon={<Icon name="close-outline" size={24} color={colors.text} />}
          onPress={handleFinishSelectMultiple}
        />
      </HStack>
    );
  }

  return (
    <>
      <Collapsible title="Files">
        {!files?.length && (
          <Text>
            Pick one or multiple files to encrypt. File size can not be bigger than{' '}
            {ENCRYPTION_LIMIT_IN_GIGABYTES}GB.
          </Text>
        )}

        {!!files?.length && (
          <VStack space="sm">
            {renderTopActions()}

            {sortedFiles.map((file, index) => (
              <FileItem
                key={file.name}
                file={file}
                isSelectingMultiple={isSelectingMultiple}
                onSelect={(_, value) => {
                  selectedFiles = {
                    ...selectedFiles,
                    [file.path]: value,
                  };
                }}
                folder={folder}
                navigate={navigate}
                onLongPress={() => {
                  setIsSelectingMultiple(true);
                  selectedFiles = { ...selectedFiles, [file.path]: true };
                }}
                onDecrypt={() => {
                  setShowDecryptModal(true);
                  setActiveFile(file);
                  setActiveFileIndex(index);
                }}
                onDelete={onDelete}
              />
            ))}
          </VStack>
        )}
      </Collapsible>

      <FolderPicker
        isOpen={showFolderPicker}
        onClose={() => setShowFolderPicker(false)}
        onSave={handleMoveFiles}
        navigate={navigate}
        currentFolder={folder}
      />

      <Confirm
        isOpen={showDeleteAlert}
        title="Delete files"
        message="All selected files will be deleted. Are you sure?"
        onClose={() => {
          setShowDeleteAlert(false);
        }}
        onConfirm={handleDeleteFiles}
        isDanger
      />

      <DecryptFileModal
        isOpen={showDecryptModal}
        file={activeFile}
        folder={folder}
        hasPrevious={activeFileIndex > 0}
        onPrevious={() => {
          const newIndex = activeFileIndex - 1;
          setActiveFile(sortedFiles[newIndex]);
          setActiveFileIndex(newIndex);
        }}
        hasNext={activeFileIndex < sortedFiles.length - 1}
        onNext={() => {
          const newIndex = activeFileIndex + 1;
          setActiveFile(sortedFiles[newIndex]);
          setActiveFileIndex(newIndex);
        }}
        onClose={() => {
          setShowDecryptModal(false);
          setActiveFile(null);
        }}
        onDelete={onDelete}
        navigate={navigate}
      />
    </>
  );
}

export default FolderFiles;
