import { CachesDirectoryPath, mkdir, read } from 'react-native-fs';

import { asyncForEach } from '../array';
import { deleteFile, writeFile } from '../files/actions';
import { largeFileExtension, precloudExtension } from '../files/constant';
import { extractFileNameAndExtension, getFolderSize, statFile } from '../files/helpers';
import { openpgpStatus } from './constant';
import { encryptFile } from './helpers';

const CHUNK_SIZE_IN_BYTES = 20 * 1024 * 1024;

async function getChunkCount(path) {
  const info = await statFile(path);
  const reminder = info.size % CHUNK_SIZE_IN_BYTES;
  return (info.size - reminder) / CHUNK_SIZE_IN_BYTES + (reminder > 0 ? 1 : 0);
}

function append0(index) {
  const str = index.toString();
  const zeroLength = 10 - str.length;
  return `${Array(zeroLength).fill('0').join('')}${str}`;
}

export async function encryptLargeFile(file, { folder, password }) {
  const encryptedName = `${file.name}.${largeFileExtension}`;
  const encryptedPath = `${folder.path}/${encryptedName}`;
  await mkdir(encryptedPath);

  const { extension } = extractFileNameAndExtension(file.name);
  const chunkCount = await getChunkCount(file.path);

  try {
    await asyncForEach(Array(chunkCount).fill(0), async (_, index) => {
      const chunk = await read(
        file.path,
        CHUNK_SIZE_IN_BYTES,
        index * CHUNK_SIZE_IN_BYTES,
        'base64'
      );
      const tmpPath = `${CachesDirectoryPath}/chunk.${precloudExtension}`;
      await writeFile(tmpPath, chunk, 'base64');
      const success = await encryptFile(
        tmpPath,
        `${encryptedPath}/${append0(index)}${extension}.${precloudExtension}`,
        password
      );
      if (!success) {
        throw new Error(openpgpStatus.error);
      }
    });

    const size = await getFolderSize(encryptedPath);
    return {
      name: encryptedName,
      path: encryptedPath,
      size,
      status: openpgpStatus.encrypted,
      isDirectory: () => true,
      isFile: () => false,
    };
  } catch (e) {
    await deleteFile(encryptedPath);
    return {
      name: file.name,
      path: file.path,
      size: file.size,
      status: openpgpStatus.error,
      isDirectory: () => true,
      isFile: () => false,
    };
  }
}
