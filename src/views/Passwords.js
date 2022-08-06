import {
  Alert,
  Box,
  Button,
  FormControl,
  HStack,
  Input,
  ScrollView,
  Text,
  useToast,
  VStack,
} from 'native-base';
import React, { useEffect, useState } from 'react';

import AppBar from '../components/AppBar';
import Icon from '../components/Icon';
import useColors from '../hooks/useColors';
import usePassword from '../hooks/usePassword';
import { savePassword } from '../lib/keychain';

function Passwords() {
  const toast = useToast();
  const savedPassword = usePassword();
  const colors = useColors();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [showPasswordRepeat, setShowPasswordRepeat] = useState(false);
  const [error, setError] = useState('');

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
      toast.show({ title: 'Password is saved in secure storage.' });
    } catch (e) {
      setError('Save password failed. Please choose another password.');
    }
  }

  return (
    <>
      <AppBar title="Set up master password" />
      <ScrollView px={4} py={4}>
        <VStack space="sm" alignItems="flex-end">
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
                Save your password in a password manager. You can't decrypt your texts or files, if
                you lose your password.
              </Box>
            </VStack>
          </Alert>

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
        </VStack>
      </ScrollView>
    </>
  );
}

export default Passwords;
