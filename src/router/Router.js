import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import PasswordForm from '../views/PasswordForm';
import PasswordGenerator from '../views/PasswordGenerator';
import RichTextEditor from '../views/RichTextEditor';
import BottomTab from './BottomTab';
import { routeNames } from './routes';

const NavStack = createNativeStackNavigator();

function Router() {
  return (
    <NavStack.Navigator screenOptions={{ headerShown: false}}>
      <NavStack.Screen name="BottomTab" component={BottomTab} />

      <NavStack.Group screenOptions={{ headerShown: false }}>
        <NavStack.Screen name={routeNames.richTextEditor} component={RichTextEditor} />
        <NavStack.Screen name={routeNames.passwordGenerator} component={PasswordGenerator} />
        <NavStack.Screen name={routeNames.passwordForm} component={PasswordForm} />
      </NavStack.Group>
    </NavStack.Navigator>
  );
}

export default Router;
