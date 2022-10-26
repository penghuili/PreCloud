import { unzip, zip } from 'react-native-zip-archive';

import { deleteFile } from './actions';
import { cachePath } from './cache';
import { getOriginalFileName, getParentPath } from './helpers';

export async function zipFolder(name, path) {
  try {
    const zippedName = `${name}.zip`;
    const targetPath = `${cachePath}/${zippedName}`;
    await deleteFile(targetPath);
    await zip(path, targetPath);
    return { name: zippedName, path: targetPath };
  } catch (e) {
    console.log('zip folder failed', e);
    return null;
  }
}

export async function unzipFolder(name, path) {
  try {
    const originalFileName = getOriginalFileName(name);
    const parentPath = getParentPath(path);
    const targetPath = `${parentPath}/${originalFileName}`;
    await unzip(path, targetPath);
    return {
      name: originalFileName,
      path: targetPath,
      isDirectory: () => true,
      isFile: () => false,
    };
  } catch (e) {
    console.log('unzip folder failed', e);
    return null;
  }
}
