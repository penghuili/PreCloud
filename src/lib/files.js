import RNFS from 'react-native-fs';
import Share from 'react-native-share';

export const viewableFileTypes = [
  'css',
  'csv',
  'gif',
  'heic',
  'html',
  'jpeg',
  'jpg',
  'json',
  'png',
  'pdf',
  'txt',
  'webp',
];

export const internalFilePaths = {
  encrypted: `${RNFS.CachesDirectoryPath}/encrypted`,
  decrypted: `${RNFS.CachesDirectoryPath}/decrypted`,
};

export const androidDownloadFolder = RNFS.DownloadDirectoryPath;

export async function makeInternalFolders() {
  const encryptedExists = await RNFS.exists(internalFilePaths.encrypted);
  if (!encryptedExists) {
    await RNFS.mkdir(internalFilePaths.encrypted);
  }

  const decryptedExists = await RNFS.exists(internalFilePaths.decrypted);
  if (!decryptedExists) {
    await RNFS.mkdir(internalFilePaths.decrypted);
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

export function extractFileExtensionFromPath(path) {
  return path.split('.').pop().toLowerCase();
}

export async function shareFile({ fileName, filePath, mimeType, saveToFiles }) {
  await Share.open({
    title: fileName,
    filename: fileName,
    url: `file://${filePath}`,
    type: mimeType,
    saveToFiles,
  });
}

export async function deleteFile(path) {
  try {
    await RNFS.unlink(path);
  } catch (e) {
    console.log(`delete ${path} failed`, e);
  }
}
