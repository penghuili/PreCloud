import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Icon from '../components/Icon';
import useColors from '../hooks/useColors';
import useTakePhotoInTabs from '../hooks/useTakePhotoInTabs';
import EncryptFiles from '../views/EncryptFiles';
import EncryptNotes from '../views/EncryptNotes';
import Passwords from '../views/Passwords';
import Settings from '../views/Settings';
import TakePhoto from '../views/TakePhoto';
import { routeNames } from './routes';

const Tab = createBottomTabNavigator();

function BottomTab() {
  const colors = useColors();
  const { bottom } = useSafeAreaInsets();
  const handleTakePhoto = useTakePhotoInTabs();

  function getIconName(routeName, focused) {
    if (routeName === routeNames.encryptNotes) {
      return focused ? 'text' : 'text-outline';
    } else if (routeName === routeNames.encryptFiles) {
      return focused ? 'document-attach' : 'document-attach-outline';
    } else if (routeName === routeNames.takePhoto) {
      return 'camera-outline';
    } else if (routeName === routeNames.passwords) {
      return focused ? 'key' : 'key-outline';
    } else if (routeName === routeNames.settings) {
      return focused ? 'heart' : 'heart-outline';
    } else {
      return null;
    }
  }

  function getIcon(focused, color, routeName) {
    return (
      <Icon
        name={getIconName(routeName, focused)}
        color={color}
        size={routeName === routeNames.takePhoto ? 32 : 20}
        onPress={routeName === routeNames.takePhoto ? handleTakePhoto : undefined}
      />
    );
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
      <Tab.Screen name={routeNames.encryptNotes} component={EncryptNotes} />
      <Tab.Screen name={routeNames.encryptFiles} component={EncryptFiles} />
      <Tab.Screen name={routeNames.takePhoto} component={TakePhoto} />
      <Tab.Screen name={routeNames.passwords} component={Passwords} />
      <Tab.Screen name={routeNames.settings} component={Settings} />
    </Tab.Navigator>
  );
}

export default BottomTab;
