import { Actionsheet, Text } from 'native-base';
import React, { useState } from 'react';

import useColors from '../hooks/useColors';
import { deleteFile, downloadFile, getSizeText, moveFile, shareFile } from '../lib/files';
import { showToast } from '../lib/toast';
import { useStore } from '../store/store';
import Icon from './Icon';
import NotebookPicker from './NotebookPicker';

function NoteItemActions({ note, isOpen, onClose, isNoteDetails, onEdit, navigation, notebook }) {
  const colors = useColors();
  const notes = useStore(state => state.notes);
  const setNotes = useStore(state => state.setNotes);

  const [showNotebookPicker, setShowNotebookPicker] = useState(false);

  async function handleShare() {
    try {
      onClose();
      await shareFile({
        fileName: note.name,
        filePath: note.path,
        saveToFiles: false,
      });
      showToast('Shared!');
    } catch (error) {
      console.log('Share file failed:', error);
    }
  }

  async function handleDownload() {
    onClose();
    const message = await downloadFile({
      fileName: note.name,
      path: note.path,
    });
    if (message) {
      showToast(message);
    }
  }

  async function handleMove(newNotebook) {
    await moveFile(note.path, `${newNotebook.path}/${note.name}`);
    setNotes(notes.filter(n => n.path !== note.path));
    setShowNotebookPicker(false);
    if (isNoteDetails) {
      navigation.goBack();
    }
    showToast('Moved!');
  }

  async function handleDelete() {
    onClose();
    await deleteFile(note.path);
    setNotes(notes.filter(n => n.path !== note.path));
    if (isNoteDetails) {
      navigation.goBack();
    }
    showToast('Deleted!');
  }

  return (
    <>
      <NotebookPicker
        isOpen={showNotebookPicker}
        onClose={() => setShowNotebookPicker(false)}
        onSave={handleMove}
        navigate={navigation.navigate}
        notebook={notebook}
      />
      <Actionsheet isOpen={isOpen} onClose={onClose}>
        <Actionsheet.Content>
          {isNoteDetails && (
            <Actionsheet.Item
              startIcon={<Icon name="create-outline" color={colors.text} />}
              onPress={onEdit}
            >
              Edit
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
              setShowNotebookPicker(true);
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
