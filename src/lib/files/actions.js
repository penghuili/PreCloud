import { format } from 'date-fns';
import DocumentPicker, { types } from 'react-native-document-picker';
import FS from 'react-native-fs';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Share from 'react-native-share';
import { URL } from 'react-native-url-polyfill';

import { asyncForEach, sortKeys, sortWith } from '../array';
import { isAndroid } from '../device';
import { hideToast, showToast } from '../toast';
import { cachePath } from './cache';
import { androidDownloadFolder } from './constant';
import {
  extractFileNameAndExtension,
  extractFilePath,
  getFileName,
  getParentPath,
  statFile,
} from './helpers';
import { unzipFolder } from './zip';

export async function readFolder(path, sortKey = sortKeys.mtime) {
  try {
    const result = await FS.readDir(path);

    return sortWith(result, sortKey);
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
  if (!path) {
    return;
  }

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

export async function downloadRemoteFile(url) {
  try {
    const parsed = new URL(url);
    const name = getFileName(parsed.pathname);
    const localPath = `${cachePath}/${name}`;
    await deleteFile(localPath);

    await FS.downloadFile({ fromUrl: url, toFile: localPath }).promise;

    const info = await statFile(localPath);
    return info;
  } catch (error) {
    console.log('Download remote file failed:', error);
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

export async function pickImages() {
  try {
    const result = await launchImageLibrary({
      mediaType: 'mixed',
      selectionLimit: 0,
      includeBase64: false,
    });

    if (result?.assets) {
      return result?.assets.map(f => ({
        type: f.type,
        name: f.fileName,
        size: f.fileSize,
        path: extractFilePath(f.uri),
        uri: f.uri,
      }));
    }

    return [];
  } catch (e) {
    console.log('pick images failed', e);
    return [];
  }
}
