import { Button, FormControl, Input, Text } from 'native-base';
import React, { useState } from 'react';

import AppBar from '../components/AppBar';
import ContentWrapper from '../components/ContentWrapper';
import ScreenWrapper from '../components/ScreenWrapper';
import { renameFile } from '../lib/files/actions';
import { extractFileNameAndExtension } from '../lib/files/helpers';

function RenameFileForm({
  navigation,
  route: {
    params: { file },
  },
}) {
  const { fileName, extension } = extractFileNameAndExtension(file?.name);
  const [innerFileName, setInnerFileName] = useState('');

  async function handleSave() {
    await renameFile(file, innerFileName);
    navigation.goBack();
  }

  return (
    <ScreenWrapper>
      <AppBar title="Rename file" hasBack />

      <ContentWrapper>
        <FormControl>
          <FormControl.Label>Current name:</FormControl.Label>
          <Text selectable>{fileName}</Text>
          <FormControl.Label>New name:</FormControl.Label>
          <Input
            value={innerFileName}
            onChangeText={setInnerFileName}
            InputRightElement={<Text color="muted.400">{extension}</Text>}
          />
        </FormControl>
        <Button mt="4" onPress={handleSave}>Save</Button>
      </ContentWrapper>
    </ScreenWrapper>
  );
}

export default RenameFileForm;
