import FS from 'react-native-fs';

import { filesFolder, largeFileExtension } from './constant';
import { statFile } from './helpers';

export async function makeFolders() {
  const exists = await FS.exists(filesFolder);
  if (!exists) {
    await FS.mkdir(filesFolder);
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
    return [];
  }

  const result = await FS.readDir(path);
  const files = [];
  const folders = [];
  result
    .sort((a, b) => new Date(b.mtime).getTime() - new Date(a.mtime).getTime())
    .forEach(r => {
      if (r.isDirectory() && !r.name.endsWith(largeFileExtension)) {
        folders.push(r);
      } else {
        files.push(r);
      }
    });

  return { files, folders };
}