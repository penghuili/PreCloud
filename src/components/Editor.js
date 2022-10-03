import { Box, ScrollView, Text } from 'native-base';
import React, { forwardRef } from 'react';
import { Image } from 'react-native-compressor';
import { launchImageLibrary } from 'react-native-image-picker';
import { actions, RichEditor, RichToolbar } from 'react-native-pell-rich-editor';

import useColors from '../hooks/useColors';

const Editor = forwardRef(({ disabled, onChange }, ref) => {
  const { primary } = useColors();

  return (
    <Box w="full" borderTopWidth={1} borderColor="gray.200">
      <ScrollView>
        <RichEditor
          ref={ref}
          placeholder={disabled ? '' : 'Type here ...'}
          initialContentHTML={''}
          onChange={value => {
            onChange(value);
          }}
          disabled={disabled}
          editorStyle={{
            caretColor: primary,
            cssText: `#editor ul {padding-left: 16px} #editor ol {padding-left: 16px} .pell-content {padding: 0}`,
          }}
          initialHeight={200}
          useContainer
        />
      </ScrollView>

      {!disabled && (
        <RichToolbar
          editor={ref}
          actions={[
            actions.undo,
            actions.redo,
            'clear',
            actions.keyboard,
            'separator',
            actions.insertBulletsList,
            actions.insertOrderedList,
            actions.indent,
            actions.outdent,
            'separator',
            actions.insertImage,
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
            clear: () => (
              <Text color="gray.400" fontSize="xl">
                X
              </Text>
            ),
          }}
          separator={() => {}}
          clear={() => {
            ref.current.setContentHTML('');
            ref.current.blurContentEditor();
          }}
          onPressAddImage={async () => {
            const result = await launchImageLibrary({
              selectionLimit: 1,
              mediaType: 'photo',
              includeBase64: false,
            });
            const file = result.assets[0];

            const resized = await Image.compress(file.uri, {
              compressionMethod: 'auto',
              maxWidth: 500,
              input: 'uri',
              output: 'jpg',
              returnableOutputType: 'base64',
            });

            ref.current.insertImage(`data:${file.type};base64,${resized}`);
          }}
          selectedIconTint={primary}
        />
      )}
    </Box>
  );
});

export default Editor;
