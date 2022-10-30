import FileViewer from 'react-native-file-viewer';
import FS from 'react-native-fs';
import { moveFile, readFolder } from './actions';

import { filesFolder, largeFileExtension, legacyFilesFolder, precloudFolder } from './constant';
import { statFile } from './helpers';

export async function makeFolders() {
  const preCloudExists = await FS.exists(precloudFolder);
  if (!preCloudExists) {
    await FS.mkdir(precloudFolder);
  }

  const filesExists = await FS.exists(filesFolder);
  if (!filesExists) {
    await FS.mkdir(filesFolder);
  }

  const legacyExists = await FS.exists(legacyFilesFolder);
  if (legacyExists) {
    await moveFile(legacyFilesFolder, filesFolder);
  }
}

export async function createFolder(label, parentPath) {
  if (!label) {
    return;
  }

  await makeFolders();

  const fullPath = parentPath ? `${parentPath}/${label}` : `${filesFolder}/${label}`;
  const exists = await FS.exists(fullPath);
  if (!exists) {
    await FS.mkdir(fullPath);
  }

  const info = await statFile(fullPath);
  return info;
}

export async function readFolders() {
  await makeFolders();
  const folders = await FS.readDir(filesFolder);
  return folders
    .filter(n => n.isDirectory())
    .sort((a, b) => new Date(b.mtime).getTime() - new Date(a.mtime).getTime());
}

export async function readFiles(path) {
  const exists = await FS.exists(path);
  if (!exists) {
    return { files: [], folders: [] };
  }

  const result = await readFolder(path);
  const files = [];
  const folders = [];
  result.forEach(r => {
    if (r.isDirectory() && !r.name.endsWith(largeFileExtension)) {
      folders.push(r);
    } else {
      files.push(r);
    }
  });

  return { files, folders };
}

export async function viewFile(path) {
  try {
    await FileViewer.open(path);
  } catch (e) {
    console.log('open file failed', e);
  }
}
