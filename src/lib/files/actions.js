import { format } from 'date-fns';
import FS from 'react-native-fs';
import { launchCamera } from 'react-native-image-picker';
import Share from 'react-native-share';
import { isAndroid } from '../device';
import { androidDownloadFolder } from './constant';
import { extractFileNameAndExtension, extractFilePath, getParentPath } from './helpers';

export async function shareFile({ name, path, saveToFiles }) {
  await Share.open({
    title: name,
    filename: name,
    url: `file://${path}`,
    saveToFiles,
  });
}

export async function deleteFile(path) {
  try {
    const exists = await FS.exists(path);
    if (exists) {
      await FS.unlink(path);
    }
  } catch (e) {
    console.log(`delete ${path} failed`, e);
  }
}

export async function copyFile(src, dest) {
  const exists = await FS.exists(dest);
  if (exists) {
    await FS.unlink(dest);
  }
  await FS.copyFile(src, dest);
}

export async function moveFile(src, dest) {
  const exists = await FS.exists(dest);
  if (exists) {
    await FS.unlink(dest);
  }
  await FS.moveFile(src, dest);
}

export async function writeFile(path, content, encoding = 'base64') {
  const exists = await FS.exists(path);
  if (exists) {
    await FS.unlink(path);
  }
  await FS.writeFile(path, content, encoding);
}

export async function downloadFile({ path, name }) {
  try {
    if (isAndroid()) {
      const downloadPath = `${androidDownloadFolder}/${name}`;
      await copyFile(path, downloadPath);

      return `File is downloaded to ${downloadPath}`;
    }

    await shareFile({
      name,
      path,
      saveToFiles: true,
    });
    return `File is downloaded.`;
  } catch (error) {
    console.log('Download file failed:', error);
    return null;
  }
}

export async function renameFile(file, label) {
  const { extension } = extractFileNameAndExtension(file.name);
  const newName = `${label.trim()}${extension}`;
  const parentPath = getParentPath(file.path);
  const newPath = `${parentPath}/${newName}`;
  await moveFile(file.path, newPath);
}

export async function takePhoto() {
  try {
    const result = await launchCamera({
      mediaType: 'photo',
      selectionLimit: 1,
      saveToPhotos: false,
      maxWidth: 10000,
      maxHeight: 10000,
    });

    const raw = result?.assets?.[0];
    if (raw) {
      const { extension } = extractFileNameAndExtension(raw.fileName);
      return {
        type: raw.type,
        name: `${format(new Date(), 'yyyyMMdd_HHmmss')}${extension}`,
        size: raw.fileSize,
        path: extractFilePath(raw.uri),
      };
    }

    return null;
  } catch (e) {
    console.log('take photo failed', e);
    return null;
  }
}
