import { asyncForEach } from '../array';
import { moveFile } from '../files/actions';
import { largeFileExtension, precloudExtension } from '../files/constant';
import { getFolderSize } from '../files/helpers';
import { showToast } from '../toast';
import { openpgpStatus } from './constant';
import { encryptLargeFile, LARGE_FILE_SIZE_IN_BYTES } from './encryptLargeFile';
import { encryptSmallFile } from './encryptSmallFile';

export async function encryptFiles(files, { folder, onEncrypted, password }) {
  if (!files?.length) {
    return [];
  }

  const encryptedFiles = [];
  let encrypted;

  await asyncForEach(files, async file => {
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
    } else if (file.size > LARGE_FILE_SIZE_IN_BYTES) {
      showToast(
        `${file.name} is a large file, encryption may take a while, keep PreCloud active and be patient :)`,
        'info'
      );
      encrypted = await encryptLargeFile(file, { folder, password });
    } else {
      encrypted = await encryptSmallFile(file, { folder, password });
    }

    encryptedFiles.push(encrypted);
    if (onEncrypted) {
      onEncrypted(encrypted);
    }
  });

  return encryptedFiles;
}
