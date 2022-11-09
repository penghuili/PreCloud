import { Text, VStack } from 'native-base';
import React from 'react';
import FS from 'react-native-fs';

import NoteItem from '../components/NoteItem';
import { deleteFile } from '../lib/files/actions';
import { cachePath } from '../lib/files/cache';
import { decryptFile } from '../lib/openpgp/helpers';
import { showToast } from '../lib/toast';
import { routeNames } from '../router/routes';
import { useStore } from '../store/store';
import Collapsible from './Collapsible';

function FolderNotes({ folder, notes, onMoved, navigation }) {
  const password = useStore(state => state.activePassword);
  const setNoteContent = useStore(state => state.setNoteContent);
  const setActiveNote = useStore(state => state.setActiveNote);

  async function handleOpenNote(note) {
    setActiveNote(note);
    const outputPath = `${cachePath}/${note.fileName}.txt`;
    const success = await decryptFile(note.path, outputPath, password);

    if (success) {
      const decryptedNote = await FS.readFile(outputPath, 'utf8');
      await deleteFile(outputPath);
      setNoteContent(decryptedNote || '');
      showToast('Note is decrypted.');

      navigation.navigate(routeNames.noteDetails, {
        folder: { name: folder.name, path: folder.path },
      });
    } else {
      showToast('Decrypt note failed.', 'error');
    }
  }

  function renderNotes() {
    if (!notes.length) {
      return (
        <VStack>
          <Text>No notes yet.</Text>
        </VStack>
      );
    }

    return (
      <>
        {notes.map(note => (
          <NoteItem
            key={note.path}
            note={note}
            onOpen={handleOpenNote}
            navigation={navigation}
            folder={folder}
            onMoved={onMoved}
          />
        ))}
      </>
    );
  }

  return (
    <Collapsible title="Notes">
      <VStack space="sm">{renderNotes()}</VStack>
    </Collapsible>
  );
}

export default FolderNotes;
