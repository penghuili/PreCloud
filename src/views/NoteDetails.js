import { Heading, Input, KeyboardAvoidingView, VStack } from 'native-base';
import React, { useEffect, useRef, useState } from 'react';

import AppBar from '../components/AppBar';
import Editor from '../components/Editor';
import NoteItemActions from '../components/NoteItemActions';
import ScreenWrapper from '../components/ScreenWrapper';
import { deleteFile, writeFile } from '../lib/files/actions';
import { cachePath } from '../lib/files/cache';
import { noteExtension } from '../lib/files/constant';
import { getNoteTitle } from '../lib/files/note';
import { encryptFile } from '../lib/openpgp/helpers';
import { showToast } from '../lib/toast';
import { useStore } from '../store/store';

function NoteDetails({
  navigation,
  route: {
    params: { folder },
  },
}) {
  const editorRef = useRef();

  const password = useStore(state => state.activePassword);
  const activeNote = useStore(state => state.activeNote);
  const noteContent = useStore(state => state.noteContent);

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    setTitle(getNoteTitle(activeNote));
  }, [activeNote]);

  async function handleSave() {
    if (!title.trim()) {
      showToast('Please add a title', 'error');
      return;
    }

    const trimedTitle = title.trim();
    const inputPath = `${cachePath}/${trimedTitle}.txt`;
    await writeFile(inputPath, content || '', 'utf8');
    const outputPath = `${folder.path}/${trimedTitle}.${noteExtension}`;
    const success = await encryptFile(inputPath, outputPath, password);

    if (success) {
      if (activeNote?.fileName && trimedTitle !== activeNote?.fileName) {
        await deleteFile(activeNote.path);
      }

      showToast('Your note is encrypted and saved on your phone.');
      if (activeNote) {
        setIsEditing(false);
      } else {
        navigation.goBack();
      }
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
        folder={folder}
        note={activeNote}
        isOpen={showActions}
        onClose={() => setShowActions(false)}
        isNoteDetails
        onEdit={() => {
          setShowActions(false);
          setIsEditing(true);
        }}
        navigation={navigation}
      />
    </ScreenWrapper>
  );
}

export default NoteDetails;
