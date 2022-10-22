import { format } from 'date-fns';
import RNFS from 'react-native-fs';
import { launchCamera } from 'react-native-image-picker';
import Share from 'react-native-share';
import { isAndroid } from './device';

export const MAX_FILE_SIZE_MEGA_BYTES = 20;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MEGA_BYTES * 1024 * 1024;

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
  'mp4',
];

export const fileCachePaths = {
  encrypted: `${RNFS.CachesDirectoryPath}/encrypted`,
  decrypted: `${RNFS.CachesDirectoryPath}/decrypted`,
};

export const androidDownloadFolder = RNFS.DownloadDirectoryPath;

export const encryptionStatus = {
  tooLarge: 'encryption/tooLarge',
  encrypted: 'encryption/encrypted',
  error: 'encryption/error',
};

export const decryptionStatus = {
  wrongExtension: 'decryption/wrongExtension',
  decrypted: 'decryption/decrypted',
  error: 'decryption/error',
};

export async function makeFileCacheFolders() {
  const encryptedExists = await RNFS.exists(fileCachePaths.encrypted);
  if (!encryptedExists) {
    await RNFS.mkdir(fileCachePaths.encrypted);
  }

  const decryptedExists = await RNFS.exists(fileCachePaths.decrypted);
  if (!decryptedExists) {
    await RNFS.mkdir(fileCachePaths.decrypted);
  }
}

export const notesFolder = `${RNFS.DocumentDirectoryPath}/notes`;
export const filesFolder = `${RNFS.DocumentDirectoryPath}/files`;

export async function makeNotesFolders() {
  const exists = await RNFS.exists(notesFolder);
  if (!exists) {
    await RNFS.mkdir(notesFolder);
  }
}

export async function makeNotebook(label) {
  const trimed = label?.trim();
  if (!trimed) {
    return;
  }

  await makeNotesFolders();

  const path = `${notesFolder}/${trimed}`;
  const exists = await RNFS.exists(path);
  if (!exists) {
    await RNFS.mkdir(path);
  }
}

export async function readNotebooks() {
  await makeNotesFolders();
  const notes = await RNFS.readDir(notesFolder);
  return notes
    .filter(n => n.isDirectory())
    .sort((a, b) => new Date(b.ctime).getTime() - new Date(a.ctime).getTime());
}

export async function readNotes(path) {
  const exists = await RNFS.exists(path);
  if (!exists) {
    return [];
  }

  const notes = await RNFS.readDir(path);
  return notes
    .filter(n => n.isFile())
    .map(n => ({ ...n, fileName: extractFileNameAndExtension(n.name).fileName }))
    .sort((a, b) => new Date(b.ctime).getTime() - new Date(a.ctime).getTime());
}

export async function makeFilesFolder(label) {
  const trimed = label?.trim();
  if (!trimed) {
    return;
  }

  await makeFilesFolders();

  const path = `${filesFolder}/${trimed}`;
  const exists = await RNFS.exists(path);
  if (!exists) {
    await RNFS.mkdir(path);
  }
}

export async function makeFilesFolders() {
  const exists = await RNFS.exists(filesFolder);
  if (!exists) {
    await RNFS.mkdir(filesFolder);
  }
}

export async function readFilesFolders() {
  await makeFilesFolders();
  const folders = await RNFS.readDir(filesFolder);
  return folders
    .filter(n => n.isDirectory())
    .sort((a, b) => new Date(b.ctime).getTime() - new Date(a.ctime).getTime());
}

export async function readFiles(path) {
  const exists = await RNFS.exists(path);
  if (!exists) {
    return [];
  }

  const files = await RNFS.readDir(path);
  return files
    .filter(n => n.isFile())
    .map(n => ({ ...n, fileName: extractFileNameAndExtension(n.name).fileName }))
    .sort((a, b) => new Date(b.ctime).getTime() - new Date(a.ctime).getTime());
}

export async function getFolderSize(folderPath) {
  if (!folderPath) {
    return 0;
  }

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

export function extractFileNameAndExtension(fileName) {
  const parts = fileName.split('.');
  const last = parts[parts.length - 1];
  let extension = '';
  if (last.toLowerCase() === 'precloud') {
    extension = '.precloud';
    parts.pop();
  }

  if (parts.length === 1) {
    return fileName.startsWith('.')
      ? { fileName: '', extension: `.${parts[0]}${extension}` }
      : { fileName: parts[0], extension: `${extension}` };
  }

  return {
    fileName: parts.slice(0, parts.length - 1).join('.'),
    extension: `.${parts[parts.length - 1]}${extension}`,
  };
}

export function extractFileExtensionFromPath(path) {
  return path.split('.').pop().toLowerCase();
}

export async function shareFile({ fileName, filePath, saveToFiles }) {
  await Share.open({
    title: fileName,
    filename: fileName,
    url: `file://${filePath}`,
    saveToFiles,
  });
}

export async function deleteFile(path) {
  try {
    const exists = await RNFS.exists(path);
    if (exists) {
      await RNFS.unlink(path);
    }
  } catch (e) {
    console.log(`delete ${path} failed`, e);
  }
}

export async function copyFile(src, dest) {
  const exists = await RNFS.exists(dest);
  if (exists) {
    await RNFS.unlink(dest);
  }
  await RNFS.copyFile(src, dest);
}

export async function moveFile(src, dest) {
  const exists = await RNFS.exists(dest);
  if (exists) {
    await RNFS.unlink(dest);
  }
  await RNFS.moveFile(src, dest);
}

export async function writeFile(path, content, encoding = 'base64') {
  const exists = await RNFS.exists(path);
  if (exists) {
    await RNFS.unlink(path);
  }
  await RNFS.writeFile(path, content, encoding);
}

export async function downloadFile({ path, fileName }) {
  try {
    if (isAndroid()) {
      const downloadPath = `${androidDownloadFolder}/${fileName}`;
      await copyFile(path, downloadPath);

      return `File is downloaded to ${downloadPath}`;
    }

    await shareFile({
      fileName: fileName,
      filePath: path,
      saveToFiles: true,
    });
    return `File is downloaded.`;
  } catch (error) {
    console.log('Download file failed:', error);
    return null;
  }
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

function toFixed2(number) {
  return +number.toFixed(2);
}

export function getSizeText(size) {
  if (!size) {
    return '0KB';
  }

  const kbs = size / 1024;
  if (kbs < 1024) {
    return `${toFixed2(kbs)}KB`;
  }

  return `${toFixed2(kbs / 1024)}MB`;
}
