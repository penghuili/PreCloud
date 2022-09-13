import {
  Alert,
  AlertDialog,
  Button,
  HStack,
  IconButton,
  Menu,
  Radio,
  Text,
  useToast,
  VStack,
} from 'native-base';
import React, { useState } from 'react';

import AppBar from '../components/AppBar';
import ContentWrapper from '../components/ContentWrapper';
import Icon from '../components/Icon';
import PasswordForm from '../components/PasswordForm';
import useColors from '../hooks/useColors';
import { useStore } from '../store/store';

function Passwords() {
  const toast = useToast();
  const colors = useColors();
  const passwords = useStore(state => state.passwords);
  const activePasswordId = useStore(state => state.activePasswordId);
  const setActivePassword = useStore(state => state.setActivePassword);
  const movePasswordToTop = useStore(state => state.movePasswordToTop);
  const movePasswordToBottom = useStore(state => state.movePasswordToBottom);
  const deletePassword = useStore(state => state.deletePassword);

  const [selectedPassword, setSelectedPassword] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  return (
    <>
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
                  toast.show({
                    title: `From now on you will use the "${password.label}" password to encrypt and decrypt.`,
                  });
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
                        setSelectedPassword(password);
                        setShowForm(true);
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
                    {passwords.length > 1 && (
                      <Menu.Item
                        onPress={() => {
                          setShowDeleteAlert(true);
                          setSelectedPassword(password);
                        }}
                      >
                        Delete
                      </Menu.Item>
                    )}
                  </Menu>
                </HStack>
              ))}
            </Radio.Group>
          )}

          <Button
            onPress={() => {
              setSelectedPassword(null);
              setShowForm(true);
            }}
          >
            {passwords?.length ? 'Add new password' : 'Add your first password'}
          </Button>

          <PasswordForm
            isOpen={showForm}
            selectedPassword={selectedPassword}
            onClose={() => {
              setShowForm(false);
              setSelectedPassword(null);
            }}
          />

          <AlertDialog isOpen={showDeleteAlert}>
            <AlertDialog.Content>
              <AlertDialog.Header>Delete password</AlertDialog.Header>
              <AlertDialog.Body>
                After the password is deleted, you can&lsquo;t decrypt the texts and files that are
                encrypted with this password. Do you still want to delete this password?
              </AlertDialog.Body>
              <AlertDialog.Footer>
                <Button.Group space={2}>
                  <Button
                    variant="ghost"
                    onPress={() => {
                      setShowDeleteAlert(false);
                      setSelectedPassword(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    colorScheme="danger"
                    onPress={async () => {
                      await deletePassword(selectedPassword);
                      setSelectedPassword(null);
                      setShowDeleteAlert(false);
                    }}
                  >
                    Delete
                  </Button>
                </Button.Group>
              </AlertDialog.Footer>
            </AlertDialog.Content>
          </AlertDialog>
        </VStack>
      </ContentWrapper>
    </>
  );
}

export default Passwords;
