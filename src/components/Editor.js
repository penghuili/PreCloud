import { Box, ScrollView, Text } from 'native-base';
import React, { forwardRef } from 'react';
import { Image } from 'react-native-compressor';
import { launchImageLibrary } from 'react-native-image-picker';
import { actions, RichEditor, RichToolbar } from 'react-native-pell-rich-editor';

import useColors from '../hooks/useColors';
import Icon from './Icon';

const Editor = forwardRef(({ disabled, onChange, onInitialized }, ref) => {
  const colors = useColors();

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
            caretColor: colors.primary,
            cssText: `#editor ul {padding-left: 24px} #editor ol {padding-left: 24px} .pell-content {padding: 10px 0}`,
          }}
          initialHeight={200}
          useContainer
          editorInitializedCallback={() => {
            if (onInitialized) {
              onInitialized();
            }
          }}
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
            'newLine',
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
              <Text color={colors.text} fontSize="xl">
                X
              </Text>
            ),
            newLine: () => <Icon name="enter-outline" color={colors.text} />,
          }}
          separator={() => {}}
          clear={() => {
            ref.current.setContentHTML('');
            ref.current.blurContentEditor();
          }}
          newLine={() => {
            ref.current.insertHTML('<br/>')
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
          iconTint={colors.text}
          selectedIconTint={colors.primary}
        />
      )}
    </Box>
  );
});

export default Editor;
