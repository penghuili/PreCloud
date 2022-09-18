import React, { useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { TabBar, TabView } from 'react-native-tab-view';

import Icon from '../components/Icon';
import useColors from '../hooks/useColors';
import EncryptDecryptFile from '../views/EncryptDecryptFile';
import EncryptDecryptText from '../views/EncryptDecryptText';
import Passwords from '../views/Passwords';
import Settings from '../views/Settings';

export const routeNames = {
  encryptFile: 'encryptFile',
  encryptText: 'encryptText',
  passwords: 'passwords',
  settings: 'settings',
};

const routesArray = [
  { key: routeNames.encryptText },
  { key: routeNames.encryptFile },
  { key: routeNames.passwords },
  { key: routeNames.settings },
];

function Router() {
  const layout = useWindowDimensions();
  const colors = useColors();

  const [index, setIndex] = useState(0);
  const [routes] = useState(routesArray);

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

  const renderScene = ({ route, jumpTo }) => {
    const currentRouteObj = routesArray[index];
    const currentRoute = currentRouteObj ? currentRouteObj.key : null;
    switch (route.key) {
      case routeNames.encryptText:
        return <EncryptDecryptText route={route} jumpTo={jumpTo} currentRoute={currentRoute} />;
      case routeNames.encryptFile:
        return <EncryptDecryptFile route={route} jumpTo={jumpTo} currentRoute={currentRoute} />;
      case routeNames.passwords:
        return <Passwords route={route} jumpTo={jumpTo} currentRoute={currentRoute} />;
      case routeNames.settings:
        return <Settings route={route} jumpTo={jumpTo} currentRoute={currentRoute} />;
      default:
        return null;
    }
  };

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
      lazy
      swipeEnabled={false}
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
