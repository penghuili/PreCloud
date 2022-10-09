import { Box, ScrollView, Text } from 'native-base';
import React, { forwardRef, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { Image } from 'react-native-compressor';
import { launchImageLibrary } from 'react-native-image-picker';
import { actions, RichEditor, RichToolbar } from 'react-native-pell-rich-editor';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useKeyboardHeight from 'react-native-use-keyboard-height';

import useColors from '../hooks/useColors';
import { heights, imageLimit } from '../lib/constants';
import { isAndroid } from '../lib/device';
import { showToast } from '../lib/toast';

const Editor = forwardRef(({ disabled, onChange, onInitialized }, ref) => {
  const colors = useColors();
  const { height } = useWindowDimensions();
  const { top, bottom } = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();

  const [innerValue, setInnerValue] = useState('');

  const editorHeight =
    height -
    top -
    heights.appBar -
    // title input
    60 -
    (disabled ? 0 : heights.editorToolBar) -
    bottom -
    keyboardHeight -
    // no idea what's this
    (isAndroid() ? 40 : 0);

  return (
    <Box borderTopWidth={1} borderColor="gray.200">
      <ScrollView h={editorHeight}>
        <RichEditor
          ref={ref}
          placeholder={disabled ? '' : 'Type here ...'}
          initialContentHTML={''}
          onChange={value => {
            setInnerValue(value);
            onChange(value);
          }}
          disabled={disabled}
          editorStyle={{
            caretColor: colors.primary,
            cssText: `#editor {font-size: 16px;} #editor ul {padding-left: 24px} #editor ol {padding-left: 24px} .pell-content {padding: 10px 0}`,
          }}
          initialHeight={editorHeight}
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
          }}
          separator={() => {}}
          clear={() => {
            ref.current.setContentHTML('');
            ref.current.blurContentEditor();
          }}
          onPressAddImage={async () => {
            if (innerValue.match(/<img([\w\W]+?)base64([\w\W]+?)>/g)?.length >= imageLimit) {
              showToast(`You can only insert ${imageLimit} images.`, 'error');
              return;
            }

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
