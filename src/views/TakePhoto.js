import { Text } from 'native-base';
import React from 'react';

import AppBar from '../components/AppBar';
import ContentWrapper from '../components/ContentWrapper';
import Icon from '../components/Icon';
import ScreenWrapper from '../components/ScreenWrapper';
import useColors from '../hooks/useColors';

function TakePhoto() {
  const colors = useColors();
  return (
    <ScreenWrapper>
      <AppBar title="Take photo" />
      <ContentWrapper>
        <Text alignItems="center">
          Press the <Icon name="camera-outline" color={colors.text} size={20} /> below again.
        </Text>
      </ContentWrapper>
    </ScreenWrapper>
  );
}

export default TakePhoto;
