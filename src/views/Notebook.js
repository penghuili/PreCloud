import { Actionsheet, Button, HStack, IconButton, Spinner, Text, VStack } from 'native-base';
import React, { useEffect, useState } from 'react';
import FS from 'react-native-fs';

import AppBar from '../components/AppBar';
import Confirm from '../components/Confirm';
import ContentWrapper from '../components/ContentWrapper';
import Icon from '../components/Icon';
import NoteItem from '../components/NoteItem';
import ScreenWrapper from '../components/ScreenWrapper';
import useColors from '../hooks/useColors';
import { asyncForEach } from '../lib/array';
import { copyFile, deleteFile, pickFiles } from '../lib/files/actions';
import { cachePath } from '../lib/files/cache';
import { noteExtension } from '../lib/files/constant';
import { readNotes } from '../lib/files/note';
import { decryptFile } from '../lib/openpgp/helpers';
import { showToast } from '../lib/toast';
import { routeNames } from '../router/routes';
import { useStore } from '../store/store';

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

  const [isLoading, setIsLoading] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showPickConfirm, setShowPickConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    readNotes(notebook.path).then(result => {
      setNotes(result);
      setIsLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notebook]);

  function handleAddNote() {
    setActiveNote(null);
    setNoteContent('');
    navigation.navigate(routeNames.noteDetails, { isNew: true, notebook });
  }

  async function handlePickNotes() {
    try {
      const picked = await pickFiles();
      const filtered = picked.filter(f => f.name.endsWith(noteExtension));
      await asyncForEach(filtered, async file => {
        await copyFile(file.path, `${notebook.path}/${file.name}`);
        await deleteFile(file.path);
      });

      const newNotes = await readNotes(notebook.path);
      setNotes(newNotes);

      if (filtered.length) {
        showToast(`Selected ${filtered.length} ${filtered.length === 1 ? 'note' : 'notes'}.`);
      } else {
        showToast('No notes selected.');
      }
    } catch (e) {
      console.log('Pick notes failed', e);
    }
  }

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
        isNew: false,
      });
    } else {
      showToast('Decrypt note failed.', 'error');
    }
  }

  function renderNotes() {
    if (isLoading) {
      return <Spinner />;
    }

    if (!notes.length) {
      return (
        <VStack space="sm" alignItems="center">
          <Text>Create your first note.</Text>
          <Button onPress={handleAddNote} isDisabled={!password} size="sm">
            Create note
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
            (Only select files ending with <Text highlight>.{noteExtension}</Text>)
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
            icon={<Icon name="add-outline" color={colors.white} size={32} />}
            variant="solid"
            size="md"
          />

          <IconButton
            onPress={() => setShowPickConfirm(true)}
            isDisabled={!password}
            icon={<Icon name="folder-open-outline" color={colors.white} size={32} />}
            variant="solid"
            size="md"
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
            Only select files ending with <Text highlight>.{noteExtension}</Text>
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
