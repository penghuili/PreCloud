import { Heading, Input, KeyboardAvoidingView, VStack } from 'native-base';
import React, { useEffect, useRef, useState } from 'react';
import FS from 'react-native-fs';

import AppBar from '../components/AppBar';
import Editor from '../components/Editor';
import NoteItemActions from '../components/NoteItemActions';
import ScreenWrapper from '../components/ScreenWrapper';
import { deleteFile, makeNotesFolders, readNotes } from '../lib/files';
import { showToast } from '../lib/toast';
import { useStore } from '../store/store';

const nodejs = require('nodejs-mobile-react-native');

function NoteDetails({
  navigation,
  route: {
    params: { notebook },
  },
}) {
  const editorRef = useRef();

  const password = useStore(state => state.activePassword);
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

  useEffect(() => {
    const listener = async msg => {
      if (msg.type === 'encrypted-rich-text') {
        if (msg.payload.data) {
          await makeNotesFolders();
          await FS.writeFile(
            `${notebook.path}/${msg.payload.title}.precloudnote`,
            msg.payload.data,
            'base64'
          );

          if (activeNote?.fileName && msg.payload.title !== activeNote?.fileName) {
            await deleteFile(activeNote.path);
          }

          const notes = await readNotes(notebook.path);
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
    };

    nodejs.channel.addListener('message', listener);

    return () => {
      nodejs.channel.removeListener('message', listener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSave() {
    if (!title.trim()) {
      showToast('Please add a title', 'error');
      return;
    }

    nodejs.channel.send({
      type: 'encrypt-rich-text',
      data: { title: title.trim(), content, password },
    });
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
        notebook={notebook}
      />
    </ScreenWrapper>
  );
}

export default NoteDetails;
