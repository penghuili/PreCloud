import { Button, FormControl, Input } from 'native-base';
import React, { useEffect, useMemo, useState } from 'react';

import AppBar from '../components/AppBar';
import ContentWrapper from '../components/ContentWrapper';
import ScreenWrapper from '../components/ScreenWrapper';
import { showToast } from '../lib/toast';
import { routeNames } from '../router/routes';
import { useStore } from '../store/store';

function FolderForm({
  navigation,
  route: {
    params: { folder },
  },
}) {
  const folders = useStore(state => state.folders);
  const folderLabels = useMemo(() => folders.map(n => n.name), [folders]);
  const createFolder = useStore(state => state.createFolder);
  const renameFolder = useStore(state => state.renameFolder);

  const [label, setLabel] = useState('');

  useEffect(() => {
    setLabel(folder?.name || '');
  }, [folder]);

  async function handleSave() {
    const trimed = label.trim()
    if (folderLabels.includes(trimed)) {
      showToast('This name is used, please choose another one.', 'error');
      return;
    }

    try {
      if (folder) {
        await renameFolder({ folder, label: trimed });
        navigation.goBack();
        showToast(`Folder "${folder.name}" is renamed to "${trimed}"!`);
      } else {
        await createFolder(trimed);
        navigation.replace(routeNames.folder);
        showToast(`Folder ${trimed} is created!`);
      }
    } catch (e) {
      showToast(`Folder creation failed, please try again`, 'error');
    }
  }

  return (
    <ScreenWrapper>
      <AppBar title={'Add new folder'} hasBack />
      <ContentWrapper>
        <FormControl space={2}>
          <FormControl.Label>Folder name</FormControl.Label>
          <Input value={label} onChangeText={setLabel} />
        </FormControl>
        <Button mt="4" isDisabled={!label || !label.trim()} onPress={handleSave}>
          Save
        </Button>
      </ContentWrapper>
    </ScreenWrapper>
  );
}

export default FolderForm;
