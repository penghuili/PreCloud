import { Text, VStack } from 'native-base';
import React, { useState } from 'react';

import DecryptFileModal from './DecryptFileModal';
import FileItem from './FileItem';

function FolderFiles({ folder, files, navigate, onDelete }) {
  const [showDecryptModal, setShowDecryptModal] = useState(false);
  const [activeFile, setActiveFile] = useState(null);
  const [activeFileIndex, setActiveFileIndex] = useState(null);

  return (
    <>
      {!files.length && (
        <Text>
          Pick one or multiple files to encrypt.
        </Text>
      )}

      {!!files.length && (
        <VStack space="sm" alignItems="center">
          {files.map((file, index) => (
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
          setActiveFile(files[newIndex]);
          setActiveFileIndex(newIndex);
        }}
        hasNext={activeFileIndex < files.length - 1}
        onNext={() => {
          const newIndex = activeFileIndex + 1;
          setActiveFile(files[newIndex]);
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
