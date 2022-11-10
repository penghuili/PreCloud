import Clipboard from '@react-native-clipboard/clipboard';
import { Button, Checkbox, Slider, Text } from 'native-base';
import React, { useState } from 'react';

import AppBar from '../components/AppBar';
import ContentWrapper from '../components/ContentWrapper';
import ScreenWrapper from '../components/ScreenWrapper';
import { generatePassword } from '../lib/password';
import { showToast } from '../lib/toast';

const defaultLength = 20;

function PasswordGenerator() {
  const [passwordLength, setPasswordLength] = useState(defaultLength);
  const [hasSpecialCharacters, setHasSpecialCharacters] = useState(true);
  const [password, setPassword] = useState(generatePassword(passwordLength, hasSpecialCharacters));

  return (
    <ScreenWrapper>
      <AppBar title="Password generator" hasBack />
      <ContentWrapper>
        <Text>Password length: {passwordLength}</Text>
        <Slider
          defaultValue={defaultLength}
          minValue={8}
          maxValue={50}
          accessibilityLabel="Password length"
          step={1}
          value={passwordLength}
          onChange={length => {
            setPasswordLength(length);
            setPassword(generatePassword(length, hasSpecialCharacters));
          }}
          my={2}
        >
          <Slider.Track>
            <Slider.FilledTrack />
          </Slider.Track>
          <Slider.Thumb />
        </Slider>
        <Checkbox
          isChecked={hasSpecialCharacters}
          onChange={checked => {
            setHasSpecialCharacters(checked);
            setPassword(generatePassword(passwordLength, checked));
          }}
        >
          Has special characters
        </Checkbox>
        <Button
          mt={2}
          onPress={() => {
            setPassword(generatePassword(passwordLength, hasSpecialCharacters));
          }}
        >
          Generate
        </Button>
        {!!password && (
          <>
            <Text mt={8}>{password}</Text>
            <Button
              mt={2}
              variant="outline"
              onPress={() => {
                Clipboard.setString(password);
                showToast('Copied!')
              }}
            >
              Copy
            </Button>
          </>
        )}
      </ContentWrapper>
    </ScreenWrapper>
  );
}

export default PasswordGenerator;
