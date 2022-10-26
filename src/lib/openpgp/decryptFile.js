import { isLargeFile } from '../files/helpers';
import { decryptLargeFile } from './decryptLargeFile';
import { decryptSmallFile } from './decryptSmallFile';

export async function decryptFile(file, password) {
  let decrypted;
  if (isLargeFile(file)) {
    decrypted = await decryptLargeFile(file, password);
  } else {
    decrypted = await decryptSmallFile(file, password);
  }

  return decrypted;
}
