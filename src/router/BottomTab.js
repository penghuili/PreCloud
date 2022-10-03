import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Icon from '../components/Icon';
import useColors from '../hooks/useColors';
import EncryptDecryptFile from '../views/EncryptDecryptFile';
import EncryptDecryptText from '../views/EncryptDecryptText';
import Passwords from '../views/Passwords';
import Settings from '../views/Settings';
import { routeNames } from './routes';

const Tab = createBottomTabNavigator();

function BottomTab() {
    const colors = useColors();
    const { bottom } = useSafeAreaInsets();

  function getIconName(routeName, focused) {
    if (routeName === routeNames.encryptText) {
      return focused ? 'text' : 'text-outline';
    } else if (routeName === routeNames.encryptFile) {
      return focused ? 'document-attach' : 'document-attach-outline';
    } else if (routeName === routeNames.passwords) {
      return focused ? 'key' : 'key-outline';
    } else if (routeName === routeNames.settings) {
      return focused ? 'heart' : 'heart-outline';
    } else {
      return null;
    }
  }

  function getIcon(focused, color, routeName) {
    return <Icon name={getIconName(routeName, focused)} color={color} size={20} />;
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color }) => getIcon(focused, color, route.name),
        tabBarLabel: () => null,
        tabBarActiveTintColor: colors.orange,
        tabBarInactiveTintColor: colors.text,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
            paddingBottom: bottom,
            height: 50 + bottom,
            backgroundColor: colors.primary,
          },
      })}
    >
      <Tab.Screen name={routeNames.encryptText} component={EncryptDecryptText} />
      <Tab.Screen name={routeNames.encryptFile} component={EncryptDecryptFile} />
      <Tab.Screen name={routeNames.passwords} component={Passwords} />
      <Tab.Screen name={routeNames.settings} component={Settings} />
    </Tab.Navigator>
  );
}

export default BottomTab;
