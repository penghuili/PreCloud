import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

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
      </NavStack.Group>
    </NavStack.Navigator>
  );
}

export default Router;
