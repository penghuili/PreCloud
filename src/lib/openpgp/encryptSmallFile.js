import { precloudExtension } from '../files/constant';
import { statFile } from '../files/helpers';
import { openpgpStatus } from './constant';
import { encryptFile } from './helpers';

export async function encryptSmallFile(file, { folder, password }) {
  const { name, path, size } = file;

  const inputPath = path;
  const encryptedName = `${name}.${precloudExtension}`;
  const outputPath = `${folder.path}/${encryptedName}`;
  const success = await encryptFile(inputPath, outputPath, password);

  if (success) {
    const { size: newSize } = await statFile(outputPath);
    return {
      name: encryptedName,
      path: outputPath,
      size: newSize,
      status: openpgpStatus.encrypted,
    };
  }

  return {
    name,
    path,
    size,
    status: openpgpStatus.error,
  };
}
