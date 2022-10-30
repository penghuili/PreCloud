import { format } from 'date-fns';
import DocumentPicker, { types } from 'react-native-document-picker';
import FS from 'react-native-fs';
import { launchCamera } from 'react-native-image-picker';
import Share from 'react-native-share';

import { asyncForEach } from '../array';
import { isAndroid } from '../device';
import { hideToast, showToast } from '../toast';
import { cachePath } from './cache';
import { androidDownloadFolder } from './constant';
import { extractFileNameAndExtension, extractFilePath, getParentPath } from './helpers';
import { unzipFolder } from './zip';

export async function readFolder(path) {
  try {
    const result = await FS.readDir(path);

    return result.sort((a, b) => new Date(b.mtime).getTime() - new Date(a.mtime).getTime());
  } catch (e) {
    console.log('read folder failed', e);
    return [];
  }
}

export async function shareFile({ name, path, saveToFiles }) {
  try {
    const { success } = await Share.open({
      title: name,
      filename: name,
      url: `file://${path}`,
      saveToFiles,
      failOnCancel: false,
    });

    return !!success;
  } catch (e) {
    console.log('share file failed', e);
    return false;
  }
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
  try {
    const exists = await FS.exists(dest);
    if (exists) {
      await FS.unlink(dest);
    }
    await FS.copyFile(src, dest);
    return true;
  } catch (e) {
    console.log('copy file failed', e);
    return false;
  }
}

export async function moveFile(src, dest) {
  try {
    const exists = await FS.exists(dest);
    if (exists) {
      await FS.unlink(dest);
    }
    await FS.moveFile(src, dest);
    return true;
  } catch (e) {
    console.log('move file failed', e);
    return false;
  }
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
      const success = await copyFile(path, downloadPath);

      return success ? `File is downloaded to ${downloadPath}` : null;
    }

    const success = await shareFile({
      name,
      path,
      saveToFiles: true,
    });

    return success ? `File is downloaded.` : null;
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
      const name = `${format(new Date(), 'yyyyMMdd_HHmmss')}${extension}`;
      const path = `${cachePath}/${name}`;
      await moveFile(extractFilePath(raw.uri), path);

      return {
        type: raw.type,
        name,
        size: raw.fileSize,
        path,
      };
    }

    return null;
  } catch (e) {
    console.log('take photo failed', e);
    return null;
  }
}

export async function pickFiles({ allowMultiSelection = true } = {}) {
  try {
    showToast('Copying files ...', 'info', 300);

    const result = await DocumentPicker.pick({
      allowMultiSelection,
      type: types.allFiles,
      presentationStyle: 'fullScreen',
      copyTo: 'cachesDirectory',
    });

    hideToast();

    const mapped = result.map(f => ({
      name: f.name,
      size: f.size,
      path: extractFilePath(f.fileCopyUri),
    }));

    const pickedFiles = [];
    await asyncForEach(mapped, async file => {
      if (file.name.endsWith('zip')) {
        const unzipped = await unzipFolder(file.name, file.path);
        if (unzipped) {
          pickedFiles.push({ ...file, ...unzipped });
          await deleteFile(file.path);
        }
      } else {
        pickedFiles.push(file);
      }
    });

    return pickedFiles;
  } catch (e) {
    console.log('pick files failed', e);
    hideToast();
    return [];
  }
}
