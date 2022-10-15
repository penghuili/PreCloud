import Clipboard from '@react-native-clipboard/clipboard';
import { Actionsheet, HStack, IconButton, Radio, Text } from 'native-base';
import React, { useState } from 'react';

import Icon from '../components/Icon';
import useColors from '../hooks/useColors';
import { showToast } from '../lib/toast';
import { routeNames } from '../router/routes';
import { useStore } from '../store/store';
import Confirm from './Confirm';

function PasswordItem({ navigate, password, index }) {
  const colors = useColors();
  const passwords = useStore(state => state.passwords);
  const movePasswordToTop = useStore(state => state.movePasswordToTop);
  const movePasswordToBottom = useStore(state => state.movePasswordToBottom);
  const deletePassword = useStore(state => state.deletePassword);

  const [selectedPassword, setSelectedPassword] = useState('');
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showActions, setShowActions] = useState(false);

  return (
    <>
      <HStack justifyContent="space-between" width="full">
        <Radio value={password.id} my={2}>
          <Text>{password.label}</Text>
        </Radio>

        <IconButton
          icon={<Icon name="ellipsis-vertical-outline" size={20} color={colors.text} />}
          size="sm"
          onPress={() => {
            setSelectedPassword(password);
            setShowActions(true);
          }}
        />
      </HStack>

      <Actionsheet isOpen={showActions} onClose={() => setShowActions(false)}>
        <Actionsheet.Content>
          <Actionsheet.Item
            startIcon={<Icon name="create-outline" color={colors.text} />}
            onPress={() => {
              navigate(routeNames.passwordForm, {
                selectedPassword: password,
              });
              setShowActions(false);
            }}
          >
            Rename
          </Actionsheet.Item>
          {index !== 0 && passwords.length > 1 && (
            <Actionsheet.Item
              startIcon={<Icon name="arrow-up-outline" color={colors.text} />}
              onPress={async () => {
                await movePasswordToTop(password);
                setShowActions(false);
              }}
            >
              Move to top
            </Actionsheet.Item>
          )}
          {index !== passwords.length - 1 && passwords.length > 1 && (
            <Actionsheet.Item
              startIcon={<Icon name="arrow-down-outline" color={colors.text} />}
              onPress={async () => {
                await movePasswordToBottom(password);
                setShowActions(false);
              }}
            >
              Move to bottom
            </Actionsheet.Item>
          )}
          <Actionsheet.Item
            startIcon={<Icon name="copy-outline" color={colors.text} />}
            onPress={() => {
              Clipboard.setString(password.password);
              setShowActions(false);
              showToast('Copied!');
            }}
          >
            Copy
          </Actionsheet.Item>
          {passwords?.length > 1 && (
            <Actionsheet.Item
              startIcon={<Icon name="trash-outline" color={colors.text} />}
              onPress={() => {
                setSelectedPassword(password);
                setShowActions(false);
                setShowDeleteAlert(true);
              }}
            >
              Delete
            </Actionsheet.Item>
          )}
        </Actionsheet.Content>
      </Actionsheet>

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
    </>
  );
}

export default PasswordItem;
