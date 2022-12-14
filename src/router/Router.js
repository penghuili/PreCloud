import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import Backup from '../views/Backup';
import Donation from '../views/Donation';
import Folder from '../views/Folder';
import FolderForm from '../views/FolderForm';
import NoteDetails from '../views/NoteDetails';
import PasswordForm from '../views/PasswordForm';
import PasswordGenerator from '../views/PasswordGenerator';
import Passwords from '../views/Passwords';
import PlainText from '../views/PlainText';
import RenameFileForm from '../views/RenameFileForm';
import BottomTab from './BottomTab';
import { routeNames } from './routes';

const NavStack = createNativeStackNavigator();

function Router() {
  return (
    <NavStack.Navigator screenOptions={{ headerShown: false }}>
      <NavStack.Screen name="BottomTab" component={BottomTab} />

      <NavStack.Group screenOptions={{ headerShown: false }}>
        <NavStack.Screen name={routeNames.noteDetails} component={NoteDetails} />
        <NavStack.Screen name={routeNames.folderForm} component={FolderForm} />
        <NavStack.Screen name={routeNames.folder} component={Folder} />
        <NavStack.Screen name={routeNames.renameFileForm} component={RenameFileForm} />
        <NavStack.Screen name={routeNames.plainText} component={PlainText} />
        <NavStack.Screen name={routeNames.passwordGenerator} component={PasswordGenerator} />
        <NavStack.Screen name={routeNames.passwords} component={Passwords} />
        <NavStack.Screen name={routeNames.passwordForm} component={PasswordForm} />
        <NavStack.Screen name={routeNames.backup} component={Backup} />
        <NavStack.Screen name={routeNames.donation} component={Donation} />
      </NavStack.Group>
    </NavStack.Navigator>
  );
}

export default Router;
