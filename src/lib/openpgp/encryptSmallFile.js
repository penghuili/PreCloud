import { precloudExtension } from '../files/constant';
import { statFile } from '../files/helpers';
import { encryptFile } from './helpers';

export async function encryptSmallFile(file, { folder, password }) {
  const { name, path } = file;

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
      isDirectory: () => false,
      isFile: () => true,
    };
  }

  return null;
}
