import React, { useEffect } from 'react';

import AppBar from '../components/AppBar';
import ContentWrapper from '../components/ContentWrapper';
import FoldersEmptyState from '../components/FoldersEmptyState';
import PasswordAlert from '../components/PasswordAlert';
import ScreenWrapper from '../components/ScreenWrapper';
import { takePhoto } from '../lib/files';
import { routeNames } from '../router/routes';
import { useStore } from '../store/store';

function TakePhoto({ navigation, route: { name: routeName } }) {
  const defaultFolder = useStore(state => state.defaultFolder);
  const folders = useStore(state => state.folders);
  const setActiveFolder = useStore(state => state.setActiveFolder);
  const getFolders = useStore(state => state.getFolders);

  useEffect(() => {
    if (routeName === routeNames.takePhoto) {
      if (folders?.length && defaultFolder) {
        const folder = folders.find(f => f.name === defaultFolder);
        if (folder) {
          setActiveFolder(folder);
          takePhoto().then(photo => {
            if (photo) {
              navigation.navigate(routeNames.folder, { pickedFiles: [photo] });
            }
          });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultFolder, folders, routeName]);

  useEffect(() => {
    getFolders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!folders?.length) {
    <ScreenWrapper>
      <AppBar title="Take photo" hasBack />
      <ContentWrapper>
        <PasswordAlert navigate={navigation.navigate} />

        <FoldersEmptyState navigate={navigation.navigate} />
      </ContentWrapper>
    </ScreenWrapper>;
  }

  return null;
}

export default TakePhoto;
