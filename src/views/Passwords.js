import Clipboard from '@react-native-clipboard/clipboard';
import { Alert, Button, HStack, IconButton, Menu, Radio, Text, VStack } from 'native-base';
import React, { useState } from 'react';

import AppBar from '../components/AppBar';
import Confirm from '../components/Confirm';
import ContentWrapper from '../components/ContentWrapper';
import Icon from '../components/Icon';
import ScreenWrapper from '../components/ScreenWrapper';
import useColors from '../hooks/useColors';
import { showToast } from '../lib/toast';
import { routeNames } from '../router/routes';
import { useStore } from '../store/store';

function Passwords({ navigation }) {
  const colors = useColors();
  const passwords = useStore(state => state.passwords);
  const activePasswordId = useStore(state => state.activePasswordId);
  const setActivePassword = useStore(state => state.setActivePassword);
  const movePasswordToTop = useStore(state => state.movePasswordToTop);
  const movePasswordToBottom = useStore(state => state.movePasswordToBottom);
  const deletePassword = useStore(state => state.deletePassword);

  const [selectedPassword, setSelectedPassword] = useState('');
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  return (
    <ScreenWrapper>
      <AppBar title="Manage passwords" />
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
                <HStack key={password.id} justifyContent="space-between" width="full">
                  <Radio value={password.id} my={2}>
                    <Text>{password.label}</Text>
                  </Radio>

                  <Menu
                    trigger={triggerProps => {
                      return (
                        <IconButton
                          {...triggerProps}
                          icon={
                            <Icon name="ellipsis-vertical-outline" size={20} color={colors.text} />
                          }
                          size="sm"
                        />
                      );
                    }}
                  >
                    <Menu.Item
                      onPress={() => {
                        navigation.navigate(routeNames.passwordForm, {
                          selectedPassword: password,
                        });
                      }}
                    >
                      Edit
                    </Menu.Item>
                    {index !== 0 && passwords.length > 1 && (
                      <Menu.Item
                        onPress={() => {
                          movePasswordToTop(password);
                        }}
                      >
                        Move to top
                      </Menu.Item>
                    )}
                    {index !== passwords.length - 1 && passwords.length > 1 && (
                      <Menu.Item
                        onPress={() => {
                          movePasswordToBottom(password);
                        }}
                      >
                        Move to bottom
                      </Menu.Item>
                    )}
                    <Menu.Item
                      onPress={() => {
                        Clipboard.setString(password.password);
                        showToast('Copied!');
                      }}
                    >
                      Copy
                    </Menu.Item>
                    <Menu.Item
                      onPress={() => {
                        setShowDeleteAlert(true);
                        setSelectedPassword(password);
                      }}
                    >
                      Delete
                    </Menu.Item>
                  </Menu>
                </HStack>
              ))}
            </Radio.Group>
          )}

          <Button
            onPress={() => {
              navigation.navigate(routeNames.passwordForm, { selectedPassword: null });
            }}
          >
            {passwords?.length ? 'Add new password' : 'Add your first password'}
          </Button>

          <Confirm
            isOpen={showDeleteAlert}
            title="Delete password"
            message="After the password is deleted, you can&lsquo;t decrypt the texts and files that are encrypted with this password. Do you still want to delete this password?"
            onClose={() => {
              setShowDeleteAlert(false);
              setSelectedPassword(null);
            }}
            onConfirm={async () => {
              await deletePassword(selectedPassword);
              setSelectedPassword(null);
              setShowDeleteAlert(false);
            }}
            isDanger
          />
        </VStack>
      </ContentWrapper>
    </ScreenWrapper>
  );
}

export default Passwords;
