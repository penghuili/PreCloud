import { Alert, Button, Radio, Text, VStack } from 'native-base';
import React from 'react';

import AppBar from '../components/AppBar';
import ContentWrapper from '../components/ContentWrapper';
import PasswordItem from '../components/PasswordItem';
import ScreenWrapper from '../components/ScreenWrapper';
import { showToast } from '../lib/toast';
import { routeNames } from '../router/routes';
import { useStore } from '../store/store';

function Passwords({ navigation }) {
  const passwords = useStore(state => state.passwords);
  const activePasswordId = useStore(state => state.activePasswordId);
  const setActivePassword = useStore(state => state.setActivePassword);

  return (
    <ScreenWrapper>
      <AppBar title="Manage passwords" hasBack />
      <ContentWrapper>
        <VStack space="sm" alignItems="flex-start">
          <Alert w="100%" status="warning" mb={8}>
            <VStack space={1} flexShrink={1} w="100%" alignItems="center">
              <Alert.Icon size="md" />
              <Text fontSize="md" fontWeight="medium">
                Save your passwords in a safe place!
              </Text>
              <Text>
                Save all your passwords in a password manager. If you lose your passwords, You can
                not decrypt your texts or files.
              </Text>
            </VStack>
          </Alert>

          {!!passwords?.length && (
            <Radio.Group
              name="passwords"
              accessibilityLabel="Passwords"
              value={activePasswordId}
              onChange={async id => {
                await setActivePassword(id);
                const password = passwords.find(p => p.id === id);
                if (password) {
                  showToast(
                    `From now on you will use the "${password.label}" password to encrypt and decrypt.`,
                    'info'
                  );
                }
              }}
            >
              {passwords.map((password, index) => (
                <PasswordItem
                  key={password.id}
                  password={password}
                  index={index}
                  navigate={navigation.navigate}
                />
              ))}
            </Radio.Group>
          )}

          <Button
            onPress={() => {
              navigation.navigate(routeNames.passwordForm, { selectedPassword: null });
            }}
          >
            {passwords?.length ? 'Create new password' : 'Create your first password'}
          </Button>
        </VStack>
      </ContentWrapper>
    </ScreenWrapper>
  );
}

export default Passwords;
