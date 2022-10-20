import { useEffect } from 'react';

import { takePhoto } from '../lib/files';
import { navigationRef } from '../router/navigationRef';
import { routeNames } from '../router/routes';
import { useStore } from '../store/store';

function useTakePhotoInTabs() {
  const defaultFolder = useStore(state => state.defaultFolder);
  const folders = useStore(state => state.folders);
  const setActiveFolder = useStore(state => state.setActiveFolder);
  const getFolders = useStore(state => state.getFolders);

  useEffect(() => {
    getFolders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleTakePhoto() {
    const folder = folders.find(f => f.name === defaultFolder);
    if (folder) {
      setActiveFolder(folder);
      takePhoto().then(photo => {
        if (photo) {
          navigationRef.navigate(routeNames.folder, { pickedFiles: [photo] });
        }
      });
    }
  }

  return handleTakePhoto;
}

export default useTakePhotoInTabs;
