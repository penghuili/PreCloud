import { Button, HStack, IconButton, Text, VStack } from 'native-base';
import React, { useEffect, useState } from 'react';
import DocumentPicker, { types } from 'react-native-document-picker';
import FS from 'react-native-fs';

import AppBar from '../components/AppBar';
import Confirm from '../components/Confirm';
import ContentWrapper from '../components/ContentWrapper';
import Icon from '../components/Icon';
import Note from '../components/Note';
import ScreenWrapper from '../components/ScreenWrapper';
import useColors from '../hooks/useColors';
import { asyncForEach } from '../lib/array';
import { deleteFile, extractFilePath, readNotes } from '../lib/files';
import { showToast } from '../lib/toast';
import { routeNames } from '../router/routes';
import { useStore } from '../store/store';

function Notebook({
  navigation,
  route: {
    params: { notebook },
  },
}) {
  const colors = useColors();
  const password = useStore(state => state.activePassword);
  const notes = useStore(state => state.notes);
  const setNotes = useStore(state => state.setNotes);
  const setRichTextTitle = useStore(state => state.setRichTextTitle);
  const setRichTextContent = useStore(state => state.setRichTextContent);

  const [showPickConfirm, setShowPickConfirm] = useState(false);

  useEffect(() => {
    readNotes(notebook.path).then(result => {
      setNotes(result);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notebook]);

  function handleAddNote() {
    setRichTextTitle('');
    setRichTextContent('');
    navigation.navigate(routeNames.richTextEditor, { isNew: true });
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
          <Note key={note.path} navigation={navigation} note={note} notebook={notebook} />
        ))}
      </>
    );
  }

  return (
    <ScreenWrapper>
      <AppBar title={notebook.name} hasBack />

      <ContentWrapper>
        <VStack space="sm">
          {renderNotes()}
        </VStack>
      </ContentWrapper>

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
    </ScreenWrapper>
  );
}

export default Notebook;