import { Actionsheet, Heading, Input, KeyboardAvoidingView, Text, VStack } from 'native-base';
import React, { useEffect, useRef, useState } from 'react';
import FS from 'react-native-fs';

import AppBar from '../components/AppBar';
import Editor from '../components/Editor';
import Icon from '../components/Icon';
import NotebookPicker from '../components/NotebookPicker';
import ScreenWrapper from '../components/ScreenWrapper';
import useColors from '../hooks/useColors';
import {
  deleteFile,
  downloadFile,
  getSizeText,
  makeNotesFolders,
  readNotes,
  shareFile,
} from '../lib/files';
import { showToast } from '../lib/toast';
import { useStore } from '../store/store';

const nodejs = require('nodejs-mobile-react-native');

function NoteDetails({
  navigation,
  route: {
    params: { notebook, note },
  },
}) {
  const editorRef = useRef();
  const colors = useColors();

  const password = useStore(state => state.activePassword);
  const noteTitle = useStore(state => state.noteTitle);
  const noteContent = useStore(state => state.noteContent);
  const notes = useStore(state => state.notes);
  const legacyNotes = useStore(state => state.legacyNotes);
  const setNotes = useStore(state => state.setNotes);
  const setLegacyNotes = useStore(state => state.setLegacyNotes);

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [showActions, setShowActions] = useState(false);
  const [showNotebookPicker, setShowNotebookPicker] = useState(false);

  useEffect(() => {
    setTitle(noteTitle);
  }, [noteTitle]);

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

          if (msg.payload.title !== noteTitle && noteTitle) {
            await deleteFile(note.path);
          }

          const notes = await readNotes(notebook.path);
          setNotes(notes);

          if (note) {
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
  }, [noteTitle, notebook]);

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

  async function handleShare() {
    try {
      await shareFile({
        fileName: noteTitle,
        filePath: note.path,
        saveToFiles: false,
      });
      showToast('Shared!');
    } catch (error) {
      console.log('Share file failed:', error);
    } finally {
      setShowActions(false);
    }
  }

  async function handleDownload() {
    const message = await downloadFile({
      fileName: noteTitle,
      path: note.path,
    });
    if (message) {
      showToast(message);
    }

    setShowActions(false);
  }

  async function handleMove(newNotebook) {
    await FS.moveFile(note.path, `${newNotebook.path}/${noteTitle}.precloudnote`);
    setNotes(notes.filter(n => n.path !== note.path));
    setLegacyNotes(legacyNotes.filter(n => n.path !== note.path));
    setShowNotebookPicker(false);
    navigation.goBack();
    showToast('Moved!');
  }

  async function handleDelete() {
    await deleteFile(note.path);
    setNotes(notes.filter(n => n.path !== note.path));
    setLegacyNotes(legacyNotes.filter(n => n.path !== note.path));
    setShowActions(false);
    navigation.goBack();
    showToast('Deleted!');
  }

  const editable = !note || isEditing;

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
          {editable ? <Input value={title} onChangeText={setTitle} /> : <Heading>{title}</Heading>}

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

      <NotebookPicker
        isOpen={showNotebookPicker}
        onClose={() => setShowNotebookPicker(false)}
        onSave={handleMove}
        navigate={navigation.navigate}
        notebook={notebook}
      />

      <Actionsheet isOpen={showActions} onClose={() => setShowActions(false)}>
        <Actionsheet.Content>
          <Actionsheet.Item
            startIcon={<Icon name="create-outline" color={colors.text} />}
            onPress={() => {
              setShowActions(false);
              setIsEditing(true);
            }}
          >
            Edit
          </Actionsheet.Item>
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
              setShowActions(false);
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
    </ScreenWrapper>
  );
}

export default NoteDetails;
