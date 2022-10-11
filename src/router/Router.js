import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import Caches from '../views/Caches';
import Notebook from '../views/Notebook';
import NotebookForm from '../views/NotebookForm';
import NoteDetails from '../views/NoteDetails';
import PasswordForm from '../views/PasswordForm';
import PasswordGenerator from '../views/PasswordGenerator';
import PlainText from '../views/PlainText';
import BottomTab from './BottomTab';
import { routeNames } from './routes';

const NavStack = createNativeStackNavigator();

function Router() {
  return (
    <NavStack.Navigator screenOptions={{ headerShown: false }}>
      <NavStack.Screen name="BottomTab" component={BottomTab} />

      <NavStack.Group screenOptions={{ headerShown: false }}>
        <NavStack.Screen name={routeNames.notebookForm} component={NotebookForm} />
        <NavStack.Screen name={routeNames.notebook} component={Notebook} />
        <NavStack.Screen name={routeNames.noteDetails} component={NoteDetails} />
        <NavStack.Screen name={routeNames.plainText} component={PlainText} />
        <NavStack.Screen name={routeNames.passwordGenerator} component={PasswordGenerator} />
        <NavStack.Screen name={routeNames.passwordForm} component={PasswordForm} />
        <NavStack.Screen name={routeNames.caches} component={Caches} />
      </NavStack.Group>
    </NavStack.Navigator>
  );
}

export default Router;
