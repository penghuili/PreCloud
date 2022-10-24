import { Heading, Input, KeyboardAvoidingView, VStack } from 'native-base';
import React, { useEffect, useRef, useState } from 'react';

import AppBar from '../components/AppBar';
import Editor from '../components/Editor';
import NoteItemActions from '../components/NoteItemActions';
import ScreenWrapper from '../components/ScreenWrapper';
import {
  deleteFile,
  fileCachePaths,
  makeFileCacheFolders,
  makeNotesFolders,
  readNotes,
  writeFile,
} from '../lib/files';
import { encryptFile } from '../lib/openpgp/helpers';
import { showToast } from '../lib/toast';
import { useStore } from '../store/store';

function NoteDetails({ navigation }) {
  const editorRef = useRef();

  const password = useStore(state => state.activePassword);
  const activeNotebook = useStore(state => state.activeNotebook);
  const activeNote = useStore(state => state.activeNote);
  const noteContent = useStore(state => state.noteContent);
  const setNotes = useStore(state => state.setNotes);

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    setTitle(activeNote?.fileName || '');
  }, [activeNote]);

  async function handleSave() {
    if (!title.trim()) {
      showToast('Please add a title', 'error');
      return;
    }

    await makeFileCacheFolders();
    await makeNotesFolders();
    const trimedTitle = title.trim();
    const inputPath = `${fileCachePaths.decrypted}/${trimedTitle}.txt`;
    await writeFile(inputPath, content || '', 'utf8');
    const outputPath = `${activeNotebook.path}/${trimedTitle}.precloudnote`;
    const success = await encryptFile(inputPath, outputPath, password);

    if (success) {
      if (activeNote?.fileName && trimedTitle !== activeNote?.fileName) {
        await deleteFile(activeNote.path);
      }

      const notes = await readNotes(activeNotebook.path);
      setNotes(notes);

      if (activeNote) {
        setIsEditing(false);
      } else {
        navigation.goBack();
      }

      showToast('Your note is encrypted and saved on your phone.');
    } else {
      showToast('Encryption failed.', 'error');
    }
  }

  const editable = !activeNote || isEditing;

  return (
    <ScreenWrapper>
      <AppBar
        title="Note"
        hasBack
        rightIconName={editable ? 'checkmark-outline' : 'ellipsis-vertical-outline'}
        onRightIconPress={() => {
          if (editable) {
            handleSave();
          } else {
            setShowActions(true);
          }
        }}
      />
      <KeyboardAvoidingView>
        <VStack px={2} py={4} space="sm" keyboardShouldPersistTaps="handled">
          {editable ? (
            <Input value={title} onChangeText={setTitle} />
          ) : (
            <Heading numberOfLines={1}>{title}</Heading>
          )}

          <Editor
            ref={editorRef}
            disabled={!password || !editable}
            onInitialized={() => {
              setContent(noteContent);
              editorRef.current.setContentHTML(noteContent);
            }}
            onChange={setContent}
          />
        </VStack>
      </KeyboardAvoidingView>

      <NoteItemActions
        note={activeNote}
        isOpen={showActions}
        onClose={() => setShowActions(false)}
        isNoteDetails
        onEdit={() => {
          setShowActions(false);
          setIsEditing(true);
        }}
        navigation={navigation}
        notebook={activeNotebook}
      />
    </ScreenWrapper>
  );
}

export default NoteDetails;
