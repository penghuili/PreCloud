import { asyncForEach } from '../array';
import { deleteFile, encryptionStatus, MAX_FILE_SIZE_BYTES, moveFile, statFile } from '../files';
import { encryptFile } from './helpers';

export async function encryptFiles(files, { folder, onEncrypted, password }) {
  if (!files?.length) {
    return [];
  }

  const encryptedFiles = [];

  await asyncForEach(files, async file => {
    const { name, path, size } = file;

    let result;
    if (name.endsWith('.precloud')) {
      const newPath = `${folder.path}/${name}`;
      await moveFile(path, newPath);
      result = { name, path: newPath, size, status: encryptionStatus.encrypted };
    } else if (size > MAX_FILE_SIZE_BYTES) {
      await deleteFile(path);
      result = { name, path, size, status: encryptionStatus.tooLarge };
    } else {
      const inputPath = path;
      const encryptedName = `${name}.precloud`;
      const outputPath = `${folder.path}/${encryptedName}`;
      const success = await encryptFile(inputPath, outputPath, password);

      if (success) {
        const { size: newSize } = await statFile(outputPath);
        result = {
          name: encryptedName,
          path: outputPath,
          size: newSize,
          status: encryptionStatus.encrypted,
        };
      } else {
        result = {
          name,
          path,
          status: encryptionStatus.error,
        };
      }
    }

    encryptedFiles.push(result);
    if (onEncrypted) {
      onEncrypted(result);
    }
  });

  return encryptedFiles;
}
