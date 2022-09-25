import { Box, ScrollView } from 'native-base';
import React, { forwardRef } from 'react';
import { actions, RichEditor, RichToolbar } from 'react-native-pell-rich-editor';

import useColors from '../hooks/useColors';

const Editor = forwardRef(({ onChange }, ref) => {
  const { primary } = useColors();

  return (
    <Box w="full" rounded borderWidth="1" borderColor="gray.200" borderRadius="sm">
      <ScrollView w="full">
        <RichEditor
          ref={ref}
          placeholder="Type here ..."
          onChange={onChange}
          initialHeight={100}
          editorStyle={{
            caretColor: primary,
          }}
        />
      </ScrollView>

      <RichToolbar
        editor={ref}
        actions={[
          actions.setBold,
          actions.setItalic,
          actions.setUnderline,
          actions.setStrikethrough,

          actions.insertBulletsList,
          actions.insertOrderedList,
          actions.indent,
          actions.outdent,

          actions.code,
          actions.line,
          actions.blockquote,
          actions.setStrikethrough,
        ]}
      />
    </Box>
  );
});

export default Editor;
