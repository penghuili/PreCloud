import { cachePath } from '../files/cache';
import { getOriginalFileName, statFile } from '../files/helpers';
import { decryptFile } from './helpers';

export async function decryptSmallFile(file, password) {
  const originalFileName = getOriginalFileName(file.name);
  const decryptedPath = `${cachePath}/${originalFileName}`;

  const success = await decryptFile(file.path, decryptedPath, password);

  if (success) {
    const { size: decryptedSize } = await statFile(decryptedPath);
    return { path: decryptedPath, name: originalFileName, size: decryptedSize };
  }

  return null;
}
