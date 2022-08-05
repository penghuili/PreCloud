import { useTheme } from 'native-base';
import React, { useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import Icon from 'react-native-vector-icons/Ionicons';
import useColors from '../hooks/useColors';

import EncryptFile from '../views/EncryptFile';
import EncryptText from '../views/EncryptText';
import Passwords from '../views/Passwords';
import Settings from '../views/Settings';

const routeNames = {
  encryptFile: 'encryptFile',
  encryptText: 'encryptText',
  passwords: 'passwords',
  settings: 'settings',
};

const renderScene = SceneMap({
  [routeNames.encryptText]: EncryptText,
  [routeNames.encryptFile]: EncryptFile,
  [routeNames.passwords]: Passwords,
  [routeNames.settings]: Settings,
});

function Router() {
  const layout = useWindowDimensions();
  const colors = useColors();

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: routeNames.encryptText },
    { key: routeNames.encryptFile },
    { key: routeNames.passwords },
    { key: routeNames.settings },
  ]);

  function getIconName(routeName, focused) {
    if (routeName === routeNames.encryptText) {
      return focused ? 'text-sharp' : 'text-outline';
    } else if (routeName === routeNames.encryptFile) {
      return focused ? 'document-attach-sharp' : 'document-attach-outline';
    } else if (routeName === routeNames.passwords) {
      return focused ? 'key-sharp' : 'key-outline';
    } else if (routeName === routeNames.settings) {
      return focused ? 'settings-sharp' : 'settings-outline';
    } else {
      return null;
    }
  }

  function renderTabBar(props) {
    return (
      <TabBar
        {...props}
        tabStyle={{ backgroundColor: colors.primary, height: 56 }}
        renderIcon={({ route, focused, color }) => (
          <Icon name={getIconName(route.key, focused)} color={color} size={20} />
        )}
        activeColor={colors.orange}
        inactiveColor={colors.text}
      />
    );
  }

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
      tabBarPosition="bottom"
      renderTabBar={renderTabBar}
      style={{ backgroundColor: colors.white }}
    />
  );
}

export default Router;
