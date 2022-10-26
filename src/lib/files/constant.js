import FS from 'react-native-fs';

export const viewableFileTypes = [
  'css',
  'csv',
  'gif',
  'heic',
  'html',
  'jpeg',
  'jpg',
  'json',
  'png',
  'pdf',
  'txt',
  'webp',
  'mp4',
  'mov',
];

export const androidDownloadFolder = FS.DownloadDirectoryPath;

export const notesFolder = `${FS.DocumentDirectoryPath}/notes`;

export const filesFolder = `${FS.DocumentDirectoryPath}/files`;

export const largeFileExtension = 'precloudlarge';
export const precloudExtension = 'precloud';
export const noteExtension = 'precloudnote';
