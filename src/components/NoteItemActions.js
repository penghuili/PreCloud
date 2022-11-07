import { Actionsheet, Text } from 'native-base';
import React, { useState } from 'react';

import useColors from '../hooks/useColors';
import { deleteFile, downloadFile, moveFile, shareFile } from '../lib/files/actions';
import { getSizeText } from '../lib/files/helpers';
import { showToast } from '../lib/toast';
import FolderPicker from './FolderPicker';
import Icon from './Icon';

function NoteItemActions({
  folder,
  note,
  isOpen,
  onClose,
  isNoteDetails,
  onView,
  onEdit,
  onMoved,
  navigation,
}) {
  const colors = useColors();

  const [showFolderPicker, setShowFolderPicker] = useState(false);

  async function handleShare() {
    onClose();
    const success = await shareFile({
      name: note.name,
      path: note.path,
      saveToFiles: false,
    });

    if (success) {
      showToast('Shared!');
    }
  }

  async function handleDownload() {
    onClose();
    const message = await downloadFile({
      name: note.name,
      path: note.path,
    });
    if (message) {
      showToast(message);
    }
  }

  async function handleMove(newFolder) {
    await moveFile(note.path, `${newFolder.path}/${note.name}`);
    setShowFolderPicker(false);
    if (isNoteDetails) {
      navigation.goBack();
    } else {
      onMoved(note);
    }
    showToast('Moved!');
  }

  async function handleDelete() {
    onClose();
    await deleteFile(note.path);
    if (isNoteDetails) {
      navigation.goBack();
    } else {
      onMoved(note);
    }
    showToast('Deleted!');
  }

  return (
    <>
      <FolderPicker
        isOpen={showFolderPicker}
        onClose={() => setShowFolderPicker(false)}
        onSave={handleMove}
        navigate={navigation.navigate}
        currentFolder={folder}
      />
      <Actionsheet isOpen={isOpen} onClose={onClose}>
        <Actionsheet.Content>
          {isNoteDetails ? (
            <Actionsheet.Item
              startIcon={<Icon name="create-outline" color={colors.text} />}
              onPress={onEdit}
            >
              Edit
            </Actionsheet.Item>
          ) : (
            <Actionsheet.Item
              startIcon={<Icon name="eye-outline" color={colors.text} />}
              onPress={onView}
            >
              Open
            </Actionsheet.Item>
          )}
          <Actionsheet.Item
            startIcon={<Icon name="share-outline" color={colors.text} />}
            onPress={handleShare}
          >
            Share
          </Actionsheet.Item>
          <Actionsheet.Item
            startIcon={<Icon name="download-outline" color={colors.text} />}
            onPress={handleDownload}
          >
            Download
          </Actionsheet.Item>
          <Actionsheet.Item
            startIcon={<Icon name="arrow-back-outline" color={colors.text} />}
            onPress={() => {
              onClose();
              setShowFolderPicker(true);
            }}
          >
            Move to ...
          </Actionsheet.Item>
          <Actionsheet.Item
            startIcon={<Icon name="trash-outline" color={colors.text} />}
            onPress={handleDelete}
          >
            Delete
          </Actionsheet.Item>

          {!!note?.size && (
            <Text fontSize="xs" color="gray.400">
              {getSizeText(note.size)}
            </Text>
          )}
        </Actionsheet.Content>
      </Actionsheet>
    </>
  );
}

export default NoteItemActions;
