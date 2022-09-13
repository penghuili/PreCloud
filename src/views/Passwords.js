import { Alert, Button, HStack, IconButton, Menu, Radio, Text, VStack } from 'native-base';
import React, { useState } from 'react';

import AppBar from '../components/AppBar';
import ContentWrapper from '../components/ContentWrapper';
import Icon from '../components/Icon';
import PasswordForm from '../components/PasswordForm';
import useColors from '../hooks/useColors';
import { useStore } from '../store/store';

function Passwords() {
  const colors = useColors();
  const passwords = useStore(state => state.passwords);
  const activePasswordId = useStore(state => state.activePasswordId);
  const setActivePassword = useStore(state => state.setActivePassword);

  const [selectedPassword, setSelectedPassword] = useState('');
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <AppBar title="Manage passwords" />
      <ContentWrapper>
        <VStack space="sm" alignItems="flex-start">
          <Alert w="100%" status="warning" mb={8}>
            <VStack space={1} flexShrink={1} w="100%" alignItems="center">
              <Alert.Icon size="md" />
              <Text fontSize="md" fontWeight="medium">
                Save your password in a safe place!
              </Text>
              <Text>
                Save your password in a password manager. If you lose your password, You can not
                decrypt your texts or files.
              </Text>
            </VStack>
          </Alert>

          {!!passwords?.length && (
            <Radio.Group
              name="passwords"
              accessibilityLabel="Passwords"
              value={activePasswordId}
              onChange={setActivePassword}
            >
              {passwords.map(password => (
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
            Add your first password
          </Button>

          <PasswordForm
            isOpen={showForm}
            selectedPassword={selectedPassword}
            onClose={() => {
              setShowForm(false);
              setSelectedPassword(null);
            }}
          />
        </VStack>
      </ContentWrapper>
    </>
  );
}

export default Passwords;
