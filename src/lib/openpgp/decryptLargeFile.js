import { appendFile, readDir, readFile } from 'react-native-fs';

import { asyncForEach } from '../array';
import { deleteFile } from '../files/actions';
import { cachePath } from '../files/cache';
import { precloudExtension } from '../files/constant';
import { getOriginalFileName, isLargeFile, statFile } from '../files/helpers';
import { openpgpStatus } from './constant';
import { decryptFile } from './helpers';

export async function decryptLargeFile(file, password) {
  try {
    const { path } = file;
    if (!isLargeFile(file)) {
      console.log('it should be a folder for large files');
      throw new Error(openpgpStatus.notLargeFile);
    }

    const files = await readDir(path);
    const sorted = files.sort((a, b) => (a.name > b.name ? 1 : -1));
    const originalFileName = getOriginalFileName(file.name);
    const decryptedPath = `${cachePath}/${originalFileName}`;
    const tempPath = `${cachePath}/large-file-chunk.${precloudExtension}`;
    await deleteFile(decryptedPath);
    await deleteFile(tempPath);

    await asyncForEach(sorted, async (encryptedChunk, index) => {
      if (index === 0) {
        const success = await decryptFile(encryptedChunk.path, decryptedPath, password);
        if (!success) {
          throw new Error(openpgpStatus.error);
        }
      } else {
        const success = await decryptFile(encryptedChunk.path, tempPath, password);
        if (!success) {
          throw new Error(openpgpStatus.error);
        } else {
          const content = await readFile(tempPath, 'base64');
          await appendFile(decryptedPath, content, 'base64');
        }
        await deleteFile(tempPath);
      }
    });

    const { size: decryptedSize } = await statFile(decryptedPath);
    return { name: originalFileName, path: decryptedPath, size: decryptedSize };
  } catch (e) {
    console.log('decrypt large file failed', e);
    return null;
  }
}
