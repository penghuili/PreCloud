import { Heading, Input, KeyboardAvoidingView, VStack } from 'native-base';
import React, { useEffect, useRef, useState } from 'react';
import RNFS from 'react-native-fs';

import AppBar from '../components/AppBar';
import Editor from '../components/Editor';
import ScreenWrapper from '../components/ScreenWrapper';
import { deleteFile, makeNotesFolders, readNotes } from '../lib/files';
import { showToast } from '../lib/toast';
import { useStore } from '../store/store';

const nodejs = require('nodejs-mobile-react-native');

function NoteDetails({
  navigation,
  route: {
    params: { isNew, notebook },
  },
}) {
  const editorRef = useRef();

  const password = useStore(state => state.activePassword);
  const richTextTitle = useStore(state => state.richTextTitle);
  const richTextContent = useStore(state => state.richTextContent);
  const setNotes = useStore(state => state.setNotes);

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    setTitle(richTextTitle);
  }, [richTextTitle]);

  useEffect(() => {
    const listener = async msg => {
      if (msg.type === 'encrypted-rich-text') {
        if (msg.payload.data) {
          await makeNotesFolders();
          await RNFS.writeFile(
            `${notebook.path}/${msg.payload.title}.precloudnote`,
            msg.payload.data,
            'base64'
          );

          if (msg.payload.title !== richTextTitle && richTextTitle) {
            await deleteFile(`${notebook.path}/${richTextTitle}.precloudnote`);
          }

          const notes = await readNotes(notebook.path);
          setNotes(notes);

          if (isNew) {
            navigation.goBack();
          } else {
            setIsEditing(false);
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
  }, [richTextTitle, notebook]);

  async function handleSave() {
    nodejs.channel.send({
      type: 'encrypt-rich-text',
      data: { title: title.trim(), content, password },
    });
  }

  const editable = isNew || isEditing;
  return (
    <ScreenWrapper>
      <AppBar
        title="Note"
        hasBack
        rightIconName={editable ? 'checkmark-outline' : 'create-outline'}
        onRightIconPress={() => {
          if (editable) {
            handleSave();
          } else {
            setIsEditing(true);
          }
        }}
      />
      <KeyboardAvoidingView>
        <VStack px={2} py={4} space="sm" keyboardShouldPersistTaps="handled">
          {editable ? <Input value={title} onChangeText={setTitle} /> : <Heading>{title}</Heading>}

          <Editor
            ref={editorRef}
            disabled={!password || !editable}
            onInitialized={() => {
              setContent(richTextContent);
              editorRef.current.setContentHTML(richTextContent);
            }}
            onChange={setContent}
          />
        </VStack>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

export default NoteDetails;
