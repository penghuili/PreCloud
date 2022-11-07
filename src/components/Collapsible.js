import { Box, Collapse, Heading, HStack, Pressable } from 'native-base';
import React, { useState } from 'react';

import useColors from '../hooks/useColors';
import Icon from './Icon';

function Collapsible({ title, children, defaultValue = true }) {
  const colors = useColors();

  const [isOpen, setIsOpen] = useState(defaultValue);

  return (
    <Box mb="4">
      <Pressable onPress={() => setIsOpen(!isOpen)}>
        <HStack alignItems="center" space="sm">
          <Heading size="md"> {title}</Heading>

          <Icon name={isOpen ? 'chevron-up-outline' : 'chevron-down-outline'} color={colors.text} />
        </HStack>
      </Pressable>
      <Collapse isOpen={isOpen} pt="1">
        {children}
      </Collapse>
    </Box>
  );
}

export default Collapsible;
