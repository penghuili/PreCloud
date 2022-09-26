import { Box, ScrollView, Text } from 'native-base';
import React, { forwardRef } from 'react';
import { launchImageLibrary } from 'react-native-image-picker';
import { actions, RichEditor, RichToolbar } from 'react-native-pell-rich-editor';

import useColors from '../hooks/useColors';

const Editor = forwardRef(({ disabled, onChange }, ref) => {
  const { primary } = useColors();

  return (
    <Box w="full" rounded borderWidth="1" borderColor="gray.200" borderRadius="sm">
      <ScrollView w="full">
        <RichEditor
          ref={ref}
          placeholder="Type here ..."
          initialContentHTML={''}
          onChange={value => {
            onChange(value);
          }}
          disabled={disabled}
          initialHeight={100}
          editorStyle={{
            caretColor: primary,
          }}
        />
      </ScrollView>

      <RichToolbar
        editor={ref}
        actions={[
          actions.undo,
          actions.redo,
          'separator',
          actions.insertImage,
          actions.insertBulletsList,
          actions.insertOrderedList,
          actions.indent,
          actions.outdent,
          'separator',
          actions.setBold,
          actions.setItalic,
          actions.setUnderline,
          actions.setStrikethrough,
          actions.removeFormat,
          'separator',
          actions.line,
        ]}
        iconMap={{
          separator: () => (
            <Text color="gray.400" fontSize="xl">
              |
            </Text>
          ),
        }}
        separator={() => {}}
        onPressAddImage={async () => {
          const result = await launchImageLibrary({
            selectionLimit: 1,
            mediaType: 'photo',
            includeBase64: true,
          });
          const file = result.assets[0];

          ref.current.insertImage(`data:${file.type};base64,${file.base64}`);
        }}
        selectedIconTint={primary}
        disabled={disabled}
      />
    </Box>
  );
});

export default Editor;
