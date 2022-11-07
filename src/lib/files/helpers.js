import FS from 'react-native-fs';

import { filesFolder, largeFileExtension, precloudExtension } from './constant';

export function extractFileNameAndExtension(name) {
  if (!name) {
    return {
      fileName: '',
      extension: '',
      extensionWithoutDot: '',
    };
  }

  const parts = name.split('.');
  const last = (parts[parts.length - 1] || '').toLowerCase();
  let extension = '';
  let extensionWithoutDot = '';
  if (last === precloudExtension) {
    extension = `.${precloudExtension}`;
    extensionWithoutDot = precloudExtension;
    parts.pop();
  }

  if (last === largeFileExtension) {
    extension = `.${largeFileExtension}`;
    extensionWithoutDot = largeFileExtension;
    parts.pop();
  }

  if (parts.length === 1) {
    return name.startsWith('.')
      ? {
          fileName: '',
          extension: `.${parts[0]}${extension}`,
          extensionWithoutDot: `${parts[0]}${extension}`,
        }
      : { fileName: parts[0], extension, extensionWithoutDot };
  }

  return {
    fileName: parts.slice(0, parts.length - 1).join('.'),
    extension: `.${parts[parts.length - 1]}${extension}`,
    extensionWithoutDot: `${parts[parts.length - 1]}${extension}`,
  };
}

export async function statFile(path) {
  try {
    const info = await FS.stat(path);
    return { ...info, name: info.path.split('/').pop() };
  } catch (e) {
    console.log('stat file failed', e);
    return null;
  }
}

export async function getFolderSize(folderPath) {
  if (!folderPath) {
    return 0;
  }

  try {
    const info = await FS.stat(folderPath);
    if (info.isFile()) {
      return info.size;
    }

    const filesOrFolders = await FS.readDir(folderPath);
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
    const filesOrFolders = await FS.readDir(folderPath);
    if (!filesOrFolders.length) {
      return;
    }

    for (let i = 0; i < filesOrFolders.length; i += 1) {
      try {
        await FS.unlink(filesOrFolders[i].path);
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

export function getOriginalFileName(encryptedFileName) {
  const parts = encryptedFileName.split('.');
  parts.pop();
  return parts.join('.');
}

export function getParentPath(path) {
  if (!path) {
    return null;
  }

  const parts = path.split('/');
  parts.pop();
  const parentPath = parts.join('/');

  return parentPath;
}

export function getFileName(path) {
  if (!path) {
    return null;
  }

  const parts = path.split('/');
  return parts.pop();
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

export function isRootFolder(path) {
  if (!path) {
    return false;
  }

  const parentPath = getParentPath(path);

  return parentPath === filesFolder;
}

export function isLargeFile(file) {
  return !!file?.isDirectory && !!file.isDirectory() && file.name.endsWith(largeFileExtension);
}
