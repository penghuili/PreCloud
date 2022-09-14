import Clipboard from '@react-native-clipboard/clipboard';
import { Button, Checkbox, Modal, Slider, Text, useToast } from 'native-base';
import React, { useState } from 'react';

import { generatePassword } from '../lib/password';

function PasswordGeneratorModal({ isOpen, onClose }) {
  const toast = useToast();

  const [passwordLength, setPasswordLength] = useState(16);
  const [hasSpecialCharacters, setHasSpecialCharacters] = useState(true);
  const [password, setPassword] = useState(generatePassword(passwordLength, hasSpecialCharacters));

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Modal.Content maxWidth="400px">
        <Modal.CloseButton />
        <Modal.Header>Password generator</Modal.Header>
        <Modal.Body>
          <Text>Password length: {passwordLength}</Text>
          <Slider
            defaultValue={16}
            minValue={8}
            maxValue={50}
            accessibilityLabel="Password length"
            step={1}
            value={passwordLength}
            onChange={setPasswordLength}
            my={2}
          >
            <Slider.Track>
              <Slider.FilledTrack />
            </Slider.Track>
            <Slider.Thumb />
          </Slider>
          <Checkbox isChecked={hasSpecialCharacters} onChange={setHasSpecialCharacters}>
            Has special characters
          </Checkbox>
          <Button
            mt={2}
            onPress={() => {
              setPassword(generatePassword(passwordLength, hasSpecialCharacters));
            }}
          >
            Generate password
          </Button>
          {!!password && (
            <>
              <Text mt={8}>{password}</Text>
              <Button
                mt={2}
                variant="outline"
                onPress={() => {
                  Clipboard.setString(password);
                  toast.show({ title: 'Copied!', placement: 'top' });
                }}
              >
                Copy
              </Button>
            </>
          )}
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
}

export default PasswordGeneratorModal;
