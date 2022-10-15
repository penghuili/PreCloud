import { Button, FormControl, Input } from 'native-base';
import React, { useEffect, useMemo, useState } from 'react';

import AppBar from '../components/AppBar';
import ContentWrapper from '../components/ContentWrapper';
import ScreenWrapper from '../components/ScreenWrapper';
import { showToast } from '../lib/toast';
import { routeNames } from '../router/routes';
import { useStore } from '../store/store';

function NotebookForm({
  navigation,
  route: {
    params: { notebook },
  },
}) {
  const notebooks = useStore(state => state.notebooks);
  const notebookLabels = useMemo(() => notebooks.map(n => n.name), [notebooks]);
  const createNotebook = useStore(state => state.createNotebook);
  const renameNotebook = useStore(state => state.renameNotebook);

  const [label, setLabel] = useState('');

  useEffect(() => {
    setLabel(notebook?.name || '');
  }, [notebook]);

  async function handleSave() {
    const trimed = label.trim();
    if (notebookLabels.includes(trimed)) {
      showToast('This name is used, please choose another one.', 'error');
      return;
    }

    try {
      if (notebook) {
        await renameNotebook({ notebook, label: trimed });
        navigation.goBack();
        showToast(`Notebook "${notebook.name}" is renamed to "${trimed}"!`);
      } else {
        await createNotebook(trimed);
        navigation.replace(routeNames.notebook);
        showToast(`Notebook ${trimed} is created!`);
      }
    } catch (e) {
      showToast(`Notebook creation failed, please try again`, 'error');
    }
  }

  return (
    <ScreenWrapper>
      <AppBar title={notebook ? 'Rename notebook' : 'Create new notebook'} hasBack />
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
