import { Button, FormControl, Input } from 'native-base';
import React, { useMemo, useState } from 'react';

import AppBar from '../components/AppBar';
import ContentWrapper from '../components/ContentWrapper';
import ScreenWrapper from '../components/ScreenWrapper';
import { showToast } from '../lib/toast';
import { useStore } from '../store/store';

function NotebookForm({ navigation }) {
  const notebooks = useStore(state => state.notebooks);
  const notebookLabels = useMemo(() => notebooks.map(n => n.name), [notebooks]);
  const createNotebook = useStore(state => state.createNotebook);

  const [label, setLabel] = useState('');

  async function handleSave() {
    if (notebookLabels.includes(label)) {
      showToast('This name is used, please choose another one.', 'error');
      return;
    }

    try {
      await createNotebook(label);
      navigation.goBack();
      showToast(`Notebook ${label} is created!`);
    } catch (e) {
      showToast(`Notebook creation failed, please try again`, 'error');
    }
  }

  return (
    <ScreenWrapper>
      <AppBar title={'Add new notebook'} hasBack />
      <ContentWrapper>
        <FormControl space={2}>
          <FormControl.Label>Notebook name</FormControl.Label>
          <Input value={label} onChangeText={setLabel} />
        </FormControl>
        <Button mt="4" isDisabled={!label || !label.trim()} onPress={handleSave}>
          Save
        </Button>
      </ContentWrapper>
    </ScreenWrapper>
  );
}

export default NotebookForm;
