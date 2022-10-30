import { Actionsheet } from 'native-base';
import React, { useState } from 'react';

import AppBar from '../components/AppBar';
import ContentWrapper from '../components/ContentWrapper';
import Icon from '../components/Icon';
import PasswordAlert from '../components/PasswordAlert';
import RootFolders from '../components/RootFolders';
import ScreenWrapper from '../components/ScreenWrapper';
import ZipAndDownloadAction from '../components/ZipAndDownloadAction';
import ZipAndShareAction from '../components/ZipAndShareAction';
import useColors from '../hooks/useColors';
import { filesFolder } from '../lib/files/constant';
import { routeNames } from '../router/routes';
import { useStore } from '../store/store';

function EncryptFiles({ navigation }) {
  const colors = useColors();
  const rootFolders = useStore(state => state.rootFolders);

  const [showActions, setShowActions] = useState(false);

  const rootFolder = { name: 'PreCloud-files', path: filesFolder };

  return (
    <ScreenWrapper>
      <AppBar
        title="Encrypt files"
        rightIconName="ellipsis-vertical-outline"
        onRightIconPress={() => setShowActions(true)}
      />
      <ContentWrapper>
        <PasswordAlert navigate={navigation.navigate} />

        <RootFolders navigation={navigation} rootFolders={rootFolders} />

        <Actionsheet isOpen={showActions} onClose={() => setShowActions(false)}>
          <Actionsheet.Content>
            <Actionsheet.Item
              startIcon={<Icon name="add-outline" color={colors.text} />}
              onPress={() => {
                setShowActions(false);
                navigation.navigate(routeNames.folderForm, { folder: null });
              }}
            >
              Create new folder
            </Actionsheet.Item>
            {rootFolders?.length > 0 && (
              <>
                <ZipAndShareAction folder={rootFolder} onShared={() => setShowActions(false)} />
                <ZipAndDownloadAction
                  folder={rootFolder}
                  onDownloaded={() => setShowActions(false)}
                />
              </>
            )}
          </Actionsheet.Content>
        </Actionsheet>
      </ContentWrapper>
    </ScreenWrapper>
  );
}

export default EncryptFiles;
