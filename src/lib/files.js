import RNFS from 'react-native-fs';
import Share from 'react-native-share';

export const filePaths = {
  encrypted: `${RNFS.CachesDirectoryPath}/encrypted`,
  decrypted: `${RNFS.CachesDirectoryPath}/decrypted`,
};

export async function makeEncryptedFolder() {
  const exists = await RNFS.exists(filePaths.encrypted);
  if (!exists) {
    await RNFS.mkdir(filePaths.encrypted, { NSURLIsExcludedFromBackupKey: true });
  }
}

export async function makeDecryptedFolder() {
  const exists = await RNFS.exists(filePaths.decrypted);
  if (!exists) {
    await RNFS.mkdir(filePaths.decrypted, { NSURLIsExcludedFromBackupKey: true });
  }
}

export async function getFolderSize(folderPath) {
  try {
    const info = await RNFS.stat(folderPath);
    if (info.isFile()) {
      return info.size;
    }

    const filesOrFolders = await RNFS.readDir(folderPath);
    if (!filesOrFolders.length) {
      return 0;
    }

    let size = 0;
    for (let i = 0; i < filesOrFolders.length; i += 1) {
      const fileOrFolder = filesOrFolders[i];
      if (fileOrFolder.isFile()) {
        size += fileOrFolder.size;
      } else {
        const folderSize = await getFolderSize(fileOrFolder.path);
        size += folderSize;
      }
    }

    return size;
  } catch (e) {
    return 0;
  }
}

export async function emptyFolder(folderPath) {
  try {
    const filesOrFolders = await RNFS.readDir(folderPath);
    if (!filesOrFolders.length) {
      return;
    }

    for (let i = 0; i < filesOrFolders.length; i += 1) {
      try {
        await RNFS.unlink(filesOrFolders[i].path);
      } catch (e) {}
    }
  } catch (e) {}
}

export function bytesToMB(bytes) {
  return Math.round((bytes / 1024 / 1024) * 100) / 100;
}

export function extractFilePath(path) {
  if (path.startsWith('file:///')) {
    return path.slice(7);
  } else if (path.startsWith('file://')) {
    return path.slice(6);
  } else if (path.startsWith('file:/')) {
    return path.slice(5);
  }
  return path;
}

export function extractFileNameFromPath(path) {
  return path.split('/').pop();
}

export async function shareFile(fileName, filePath, mimeType) {
  await Share.open({
    title: fileName,
    filename: fileName,
    url: `file://${filePath}`,
    type: mimeType,
  });
}