import { HStack, Select, Text, VStack } from 'native-base';
import React, { useState } from 'react';
import useColors from '../hooks/useColors';

import { sortKeys, sortWith } from '../lib/array';
import { ENCRYPTION_LIMIT_IN_GIGABYTES } from '../lib/openpgp/constant';
import DecryptFileModal from './DecryptFileModal';
import FileItem from './FileItem';
import Icon from './Icon';

function FolderFiles({ folder, files, navigate, onDelete }) {
  const colors = useColors();

  const [showDecryptModal, setShowDecryptModal] = useState(false);
  const [activeFile, setActiveFile] = useState(null);
  const [activeFileIndex, setActiveFileIndex] = useState(null);
  const [sortKey, setSortKey] = useState(sortKeys.mtime);
  const [sortedFiles, setSortedFiles] = useState(files);

  return (
    <>
      {!files?.length && (
        <Text>
          Pick one or multiple files to encrypt. File size can not be bigger than{' '}
          {ENCRYPTION_LIMIT_IN_GIGABYTES}GB.
        </Text>
      )}

      {!!files?.length && (
        <VStack space="sm">
          <HStack justifyContent="flex-end">
            <Select
              selectedValue={sortKey}
              mt="1"
              minWidth="150"
              onValueChange={value => {
                setSortKey(value);
                setSortedFiles(sortWith(files, value));
              }}
              _selectedItem={{
                endIcon: <Icon name="checkmark-outline" size={24} color={colors.primary} />
              }}
              color={colors.primary}
            >
              <Select.Item label="Update time" value={sortKeys.mtime} />
              <Select.Item label="File name" value={sortKeys.name} />
              <Select.Item label="Random" value={sortKeys.random} />
            </Select>
          </HStack>

          {sortedFiles.map((file, index) => (
            <FileItem
              key={file.name}
              file={file}
              folder={folder}
              navigate={navigate}
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
