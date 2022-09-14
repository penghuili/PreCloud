import { Button, FormControl, HStack, Input, Modal, useToast } from 'native-base';
import React, { useEffect, useMemo, useState } from 'react';

import useColors from '../hooks/useColors';
import { useStore } from '../store/store';
import Icon from './Icon';

function PasswordForm({ selectedPassword, isOpen, onClose }) {
  const colors = useColors();
  const toast = useToast();
  const passwords = useStore(state => state.passwords);
  const savePassword = useStore(state => state.savePassword);
  const passwordLabels = useMemo(() => passwords.map(p => p.label), [passwords]);

  const [label, setLabel] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLabel(selectedPassword?.label || '');
    setPassword(selectedPassword?.password || '');
  }, [selectedPassword]);

  function handleClose() {
    onClose();
    setLabel('');
    setPassword('');
    setShowPassword(false);
    setError('');
  }

  async function handleSavePassword() {
    setError('');
    if (passwordLabels.includes(label)) {
      setError('This password name is used, please choose another one.');
      return;
    }

    try {
      await savePassword({ id: selectedPassword?.id, label: label.trim(), password });
      handleClose();
      toast.show({ title: 'Password is saved in secure storage.', placement: 'top' });
    } catch (e) {
      setError('Save password failed. Please choose another one.');
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <Modal.Content>
        <Modal.CloseButton />
        <Modal.Header>{selectedPassword ? 'Update password' : 'Add new password'}</Modal.Header>
        <Modal.Body>
          <FormControl isInvalid={!!error} space={2}>
            <FormControl.Label>Name</FormControl.Label>
            <Input placeholder="Password name" value={label} onChangeText={setLabel} />
            <FormControl.Label>Password</FormControl.Label>
            <Input
              type={showPassword ? 'text' : 'password'}
              isDisabled={!!selectedPassword}
              placeholder="Enter password"
              value={password}
              onChangeText={setPassword}
              InputRightElement={
                <HStack pr={2}>
                  <Icon
                    name={showPassword ? 'eye' : 'eye-off'}
                    size={16}
                    color={colors.text}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                </HStack>
              }
            />
            <FormControl.HelperText>
              Recommend: use a password manager to generate a strong password.
            </FormControl.HelperText>
            {!!error && <FormControl.ErrorMessage>{error}</FormControl.ErrorMessage>}
          </FormControl>
        </Modal.Body>
        <Modal.Footer>
          <Button.Group space={2}>
            <Button variant="ghost" onPress={handleClose}>
              Cancel
            </Button>
            <Button isDisabled={!password || !label.trim()} onPress={() => handleSavePassword()}>
              Save
            </Button>
          </Button.Group>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
}

export default PasswordForm;
