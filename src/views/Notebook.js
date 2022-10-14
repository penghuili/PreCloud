import { Actionsheet, Button, HStack, IconButton, Text, VStack } from 'native-base';
import React, { useEffect, useState } from 'react';
import DocumentPicker, { types } from 'react-native-document-picker';
import FS from 'react-native-fs';

import AppBar from '../components/AppBar';
import Confirm from '../components/Confirm';
import ContentWrapper from '../components/ContentWrapper';
import Icon from '../components/Icon';
import NoteItem from '../components/NoteItem';
import ScreenWrapper from '../components/ScreenWrapper';
import useColors from '../hooks/useColors';
import { asyncForEach } from '../lib/array';
import { deleteFile, extractFilePath, readNotes } from '../lib/files';
import { showToast } from '../lib/toast';
import { routeNames } from '../router/routes';
import { useStore } from '../store/store';

const nodejs = require('nodejs-mobile-react-native');

function Notebook({ navigation }) {
  const colors = useColors();
  const password = useStore(state => state.activePassword);
  const notebook = useStore(state => state.activeNotebook);
  const notes = useStore(state => state.notes);
  const setNotes = useStore(state => state.setNotes);
  const setNoteContent = useStore(state => state.setNoteContent);
  const notebooks = useStore(state => state.notebooks);
  const setNotebooks = useStore(state => state.setNotebooks);
  const setActiveNotebook = useStore(state => state.setActiveNotebook);
  const setActiveNote = useStore(state => state.setActiveNote);

  const [showActions, setShowActions] = useState(false);
  const [showPickConfirm, setShowPickConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    readNotes(notebook.path).then(result => {
      setNotes(result);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notebook]);

  useEffect(() => {
    const listener = async msg => {
      if (msg.type === 'decrypted-rich-text') {
        if (!msg.payload.error) {
          setNoteContent(msg.payload.data || '');
          showToast('Note is decrypted.');

          navigation.navigate(routeNames.noteDetails, {
            isNew: false,
            notebook,
          });
        } else {
          showToast('Decrypt note failed.', 'error');
        }
      }
    };

    nodejs.channel.addListener('message', listener);

    return () => {
      nodejs.channel.removeListener('message', listener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleAddNote() {
    setActiveNote(null);
    setNoteContent('');
    navigation.navigate(routeNames.noteDetails, { isNew: true, notebook });
  }

  async function handlePickNotes() {
    try {
      const result = await DocumentPicker.pick({
        allowMultiSelection: true,
        type: types.allFiles,
        presentationStyle: 'fullScreen',
        copyTo: 'cachesDirectory',
      });
      const files = result
        .filter(f => f.name.endsWith('.precloudnote'))
        .map(f => ({
          name: f.name,
          size: f.size,
          path: extractFilePath(f.fileCopyUri),
        }));

      await asyncForEach(files, async file => {
        await FS.copyFile(file.path, `${notebook.path}/${file.name}`);
        await deleteFile(file.path);
      });

      const newNotes = await readNotes(notebook.path);
      setNotes(newNotes);

      if (files.length) {
        showToast(`Selected ${files.length} ${files.length === 1 ? 'note' : 'notes'}.`);
      } else {
        showToast('No notes selected.');
      }
    } catch (e) {
      console.log('Pick notes failed', e);
    }
  }

  async function handleOpenNote(note) {
    setActiveNote(note);
    const base64 = await FS.readFile(note.path, 'base64');

    nodejs.channel.send({
      type: 'decrypt-rich-text',
      data: { fileBase64: base64, password },
    });
  }

  function renderNotes() {
    if (!notes.length) {
      return (
        <VStack space="sm" alignItems="center">
          <Text>Create your first note.</Text>
          <Button onPress={handleAddNote} isDisabled={!password} size="sm">
            Add note
          </Button>

          <Button
            onPress={() => setShowPickConfirm(true)}
            isDisabled={!password}
            variant="outline"
            size="sm"
          >
            Select notes
          </Button>
          <Text>
            (Only select files ending with <Text highlight>.precloudnote</Text>)
          </Text>
        </VStack>
      );
    }

    return (
      <>
        <HStack space="sm">
          <IconButton
            onPress={handleAddNote}
            isDisabled={!password}
            icon={<Icon name="add-outline" color={colors.white} size={24} />}
            variant="solid"
            size="xs"
          />

          <IconButton
            onPress={() => setShowPickConfirm(true)}
            isDisabled={!password}
            icon={<Icon name="folder-open-outline" color={colors.white} size={24} />}
            variant="solid"
            size="xs"
          />
        </HStack>
        {notes.map(note => (
          <NoteItem
            key={note.path}
            note={note}
            onOpen={handleOpenNote}
            navigation={navigation}
            notebook={notebook}
          />
        ))}
      </>
    );
  }

  return (
    <ScreenWrapper>
      <AppBar
        title={notebook.name}
        hasBack
        rightIconName="ellipsis-vertical-outline"
        onRightIconPress={() => setShowActions(true)}
      />

      <ContentWrapper>
        <VStack space="sm">{renderNotes()}</VStack>
      </ContentWrapper>

      <Actionsheet isOpen={showActions} onClose={() => setShowActions(false)}>
        <Actionsheet.Content>
          <Actionsheet.Item
            startIcon={<Icon name="create-outline" color={colors.text} />}
            onPress={() => {
              setShowActions(false);
              navigation.navigate(routeNames.notebookForm, {
                notebook,
              });
            }}
          >
            Rename
          </Actionsheet.Item>
          <Actionsheet.Item
            startIcon={<Icon name="trash-outline" color={colors.text} />}
            onPress={() => {
              setShowDeleteConfirm(true);
              setShowActions(false);
            }}
          >
            Delete
          </Actionsheet.Item>
        </Actionsheet.Content>
      </Actionsheet>

      <Confirm
        isOpen={showPickConfirm}
        message={
          <Text>
            Only select files ending with <Text highlight>.precloudnote</Text>
          </Text>
        }
        onClose={() => {
          setShowPickConfirm(false);
        }}
        onConfirm={async () => {
          setShowPickConfirm(false);
          handlePickNotes();
        }}
      />

      <Confirm
        isOpen={showDeleteConfirm}
        message="All notes in this notebook will be deleted. Are you sure?"
        onClose={() => {
          setShowDeleteConfirm(false);
        }}
        onConfirm={async () => {
          await deleteFile(notebook.path);
          setShowDeleteConfirm(false);
          navigation.goBack();
          setNotebooks(notebooks.filter(n => n.path !== notebook.path));
          setActiveNotebook(null);
        }}
        isDanger
      />
    </ScreenWrapper>
  );
}

export default Notebook;
