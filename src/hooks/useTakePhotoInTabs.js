import { takePhoto } from '../lib/files/actions';
import { navigationRef } from '../router/navigationRef';
import { routeNames } from '../router/routes';
import { useStore } from '../store/store';

function useTakePhotoInTabs() {
  const defaultFolder = useStore(state => state.defaultFolder);
  const rootFolders = useStore(state => state.rootFolders);

  function handleTakePhoto() {
    const folder = rootFolders.find(f => f.name === defaultFolder);
    if (folder) {
      takePhoto().then(photo => {
        if (photo) {
          navigationRef.navigate(routeNames.folder, { selectedFiles: [photo], path: folder.path });
        }
      });
    }
  }

  return handleTakePhoto;
}

export default useTakePhotoInTabs;
