import {
  Alert,
  Box,
  Button,
  FormControl,
  HStack,
  Input,
  Text,
  useToast,
  VStack,
} from 'native-base';
import React, { useEffect, useState } from 'react';

import AppBar from '../components/AppBar';
import ContentWrapper from '../components/ContentWrapper';
import Icon from '../components/Icon';
import useColors from '../hooks/useColors';
import { savePassword } from '../lib/keychain';
import { useStore } from '../store/store';

function Passwords() {
  const toast = useToast();
  const savedPassword = useStore(state => state.masterPassword);
  const setMasterPassword = useStore(state => state.setMasterPassword);
  const colors = useColors();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [showPasswordRepeat, setShowPasswordRepeat] = useState(false);
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setPassword(savedPassword);
    setPasswordRepeat(savedPassword);
  }, [savedPassword]);

  async function handleSavePassword() {
    setError('');
    if (password !== passwordRepeat) {
      setError('Password does not match.');
      return;
    }

    try {
      await savePassword(password);
      setMasterPassword(password);
      toast.show({ title: 'Password is saved in secure storage.' });
      setIsUpdating(false);
    } catch (e) {
      setError('Save password failed. Please choose another password.');
    }
  }

  function renderSavedPassword() {
    if (!savedPassword || isUpdating) {
      return null;
    }

    return (
      <>
        <Text bold>Your master password is saved in secure storage.</Text>
        <Button variant="outline" onPress={() => setIsUpdating(true)}>Update</Button>
      </>
    );
  }

  function renderNewPassword() {
    if (savedPassword && !isUpdating) {
      return null;
    }

    return (
      <>
        <FormControl isInvalid={!!error}>
          <FormControl.Label>Master password</FormControl.Label>
          <Input
            type={showPassword ? 'text' : 'password'}
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
            Use a password manager to generate a strong password.
          </FormControl.HelperText>

          <FormControl.Label>Repeat password</FormControl.Label>
          <Input
            type={showPasswordRepeat ? 'text' : 'password'}
            placeholder="Repeat password"
            value={passwordRepeat}
            onChangeText={setPasswordRepeat}
            InputRightElement={
              <HStack pr={2}>
                <Icon
                  name={showPasswordRepeat ? 'eye' : 'eye-off'}
                  size={16}
                  color={colors.text}
                  onPress={() => setShowPasswordRepeat(!showPasswordRepeat)}
                />
              </HStack>
            }
          />
          {!!error && <FormControl.ErrorMessage>{error}</FormControl.ErrorMessage>}
        </FormControl>
        <Button isDisabled={!password || !passwordRepeat} onPress={() => handleSavePassword()}>
          Save
        </Button>
      </>
    );
  }

  return (
    <>
      <AppBar title="Master password" />
      <ContentWrapper>
        <VStack space="sm" alignItems="flex-start">
          <Alert w="100%" status="warning" mb={8}>
            <VStack space={1} flexShrink={1} w="100%" alignItems="center">
              <Alert.Icon size="md" />
              <Text fontSize="md" fontWeight="medium">
                Save your password in a safe place!
              </Text>

              <Box
                _text={{
                  textAlign: 'center',
                }}
              >
                Save your password in a password manager. If you lose your password, You can't
                decrypt your texts or files.
              </Box>
            </VStack>
          </Alert>

          {renderNewPassword()}
          {renderSavedPassword()}
        </VStack>
      </ContentWrapper>
    </>
  );
}

export default Passwords;
