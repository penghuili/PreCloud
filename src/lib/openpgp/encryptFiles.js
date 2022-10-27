import { asyncForEach } from '../array';
import { moveFile } from '../files/actions';
import { largeFileExtension, precloudExtension } from '../files/constant';
import { getFolderSize } from '../files/helpers';
import { showToast } from '../toast';
import {
  ENCRYPTION_LIMIT_IN_BYTES,
  ENCRYPTION_LIMIT_IN_GIGABYTES,
  LARGE_FILE_SIZE_IN_BYTES,
  openpgpStatus,
} from './constant';
import { encryptLargeFile } from './encryptLargeFile';
import { encryptSmallFile } from './encryptSmallFile';

export async function encryptFiles(files, { folder, onEncrypted, password }) {
  if (!files?.length) {
    return [];
  }

  const encryptedFiles = [];
  
  await asyncForEach(files, async file => {
    let encrypted = null;

    if (file.name.endsWith(precloudExtension)) {
      const newPath = `${folder.path}/${file.name}`;
      await moveFile(file.path, newPath);

      encrypted = {
        name: file.name,
        path: newPath,
        size: file.size,
        status: openpgpStatus.encrypted,
        isDirectory: () => false,
        isFile: () => true,
      };
    } else if (file.name.endsWith(largeFileExtension)) {
      const newPath = `${folder.path}/${file.name}`;
      await moveFile(file.path, newPath);
      const size = await getFolderSize(newPath);

      encrypted = {
        name: file.name,
        path: newPath,
        size,
        status: openpgpStatus.encrypted,
        isDirectory: () => true,
        isFile: () => false,
      };
    } else if (file.size > ENCRYPTION_LIMIT_IN_BYTES) {
      showToast(
        `${file.name} is bigger than ${ENCRYPTION_LIMIT_IN_GIGABYTES}GB, PreCloud can't encrypt such large files for now.`,
        'info'
      );
    } else if (file.size > LARGE_FILE_SIZE_IN_BYTES) {
      showToast(
        `${file.name} is a large file, encryption may take a while, keep PreCloud active and be patient :)`,
        'info'
      );
      encrypted = await encryptLargeFile(file, { folder, password });
    } else {
      encrypted = await encryptSmallFile(file, { folder, password });
    }

    if (encrypted) {
      encryptedFiles.push(encrypted);
      if (onEncrypted) {
        onEncrypted(encrypted);
      }
    }
  });

  return encryptedFiles;
}
