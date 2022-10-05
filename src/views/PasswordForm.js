import { Button, FormControl, HStack, Input, Text } from 'native-base';
import React, { useEffect, useMemo, useState } from 'react';

import AppBar from '../components/AppBar';
import ContentWrapper from '../components/ContentWrapper';
import Icon from '../components/Icon';
import ScreenWrapper from '../components/ScreenWrapper';
import useColors from '../hooks/useColors';
import { showToast } from '../lib/toast';
import { routeNames } from '../router/routes';
import { useStore } from '../store/store';

function PasswordForm({
  navigation,
  route: {
    params: { selectedPassword },
  },
}) {
  const colors = useColors();
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

  async function handleSavePassword() {
    setError('');
    if (passwordLabels.includes(label)) {
      setError('This password name is used, please choose another one.');
      return;
    }

    try {
      await savePassword({ id: selectedPassword?.id, label: label.trim(), password });
      navigation.goBack();
      showToast('Password is saved in secure storage.')
    } catch (e) {
      setError('Save password failed. Please choose another one.');
    }
  }

  return (
    <ScreenWrapper>
      <AppBar title={selectedPassword ? 'Update password' : 'Add new password'} hasBack />
      <ContentWrapper>
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
          {!selectedPassword && (
            <FormControl.HelperText>
              Recommend: use a password manager to generate a strong password.{' '}
              <Text underline onPress={() => navigation.navigate(routeNames.passwordGenerator)}>
                Generate
              </Text>
            </FormControl.HelperText>
          )}
          {!!error && <FormControl.ErrorMessage>{error}</FormControl.ErrorMessage>}
        </FormControl>
        <Button mt="4" isDisabled={!password || !label.trim()} onPress={() => handleSavePassword()}>
          Save
        </Button>
      </ContentWrapper>
    </ScreenWrapper>
  );
}

export default PasswordForm;
