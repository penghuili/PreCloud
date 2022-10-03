import { Button, Heading, Input, Text, VStack } from 'native-base';
import React, { useEffect, useRef, useState } from 'react';
import RNFS from 'react-native-fs';

import AppBar from '../components/AppBar';
import ScreenWrapper from '../components/ScreenWrapper';
import ContentWrapper from '../components/ContentWrapper';
import Editor from '../components/Editor';
import { deleteFile, makeNotesFolders, notesFolder, readNotes } from '../lib/files';
import { useStore } from '../store/store';

const nodejs = require('nodejs-mobile-react-native');

function RichTextEditor({
  navigation,
  route: {
    params: { isNew },
  },
}) {
  const editorRef = useRef();

  const password = useStore(state => state.activePassword);
  const richTextTitle = useStore(state => state.richTextTitle);
  const richTextContent = useStore(state => state.richTextContent);
  const setRichTexts = useStore(state => state.setRichTexts);

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setTitle(richTextTitle);
  }, [richTextTitle]);

  useEffect(() => {
    setTimeout(() => {
      setContent(richTextContent);
      editorRef.current.setContentHTML(richTextContent);
    }, 500);
  }, [richTextContent]);

  useEffect(() => {
    const listener = async msg => {
      if (msg.type === 'encrypted-rich-text') {
        if (msg.payload.data) {
          await makeNotesFolders();
          await RNFS.writeFile(
            `${notesFolder}/${msg.payload.title}.precloudnote`,
            msg.payload.data,
            'base64'
          );

          if (msg.payload.title !== richTextTitle && richTextTitle) {
            await deleteFile(`${notesFolder}/${richTextTitle}.precloudnote`);
          }

          const texts = await readNotes();
          setRichTexts(texts);

          navigation.goBack();
        } else {
          setErrorMessage('Encryption failed.');
        }
      }
    };

    nodejs.channel.addListener('message', listener);

    return () => {
      nodejs.channel.removeListener('message', listener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [richTextTitle]);

  async function handleSave() {
    setErrorMessage('');

    if (content.match(/<img.*?src=.*?base64,(.*?)>/g)?.length > 10) {
      setErrorMessage('You can only insert 10 images.');
      return;
    }

    nodejs.channel.send({
      type: 'encrypt-rich-text',
      data: { title: title.trim(), content, password },
    });
  }

  const editable = isNew || isEditing;
  return (
    <ScreenWrapper>
      <AppBar title="Rich text" hasBack />
      <ContentWrapper>
        <VStack space="sm" pb="15">
          {editable ? <Input value={title} onChangeText={setTitle} autoFocus={isNew} /> : <Heading>{title}</Heading>}

          <Editor ref={editorRef} disabled={!password || !editable} onChange={setContent} />
          {editable ? (
            <Button isDisabled={!title.trim()} onPress={handleSave}>
              Encrypt and Save
            </Button>
          ) : (
            <Button onPress={() => setIsEditing(true)} variant="outline">Edit</Button>
          )}
          {!!errorMessage && <Text colorScheme="error">{errorMessage}</Text>}
        </VStack>
      </ContentWrapper>
    </ScreenWrapper>
  );
}

export default RichTextEditor;
