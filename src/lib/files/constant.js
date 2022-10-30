import FS from 'react-native-fs';

export const imageExtensions = ['gif', 'heic', 'jpg', 'jpeg', 'png', 'psd', 'webp'];
export const videoExtensions = [
  '3gp',
  'avi',
  'flv',
  'm4v',
  'mkv',
  'mov',
  'mp4',
  'mpeg',
  'mpg',
  'ogv',
  'webm',
];
const audioExtensions = [
  'mp3',
  'wav',
  'ogg',
  'm4a',
  'aac',
  'flac',
  'midi',
];
export const viewableFileExtensions = [
  ...imageExtensions,
  ...videoExtensions,
  ...audioExtensions,
  'css',
  'csv',
  'html',
  'json',
  'pdf',
  'txt',
];

export const androidDownloadFolder = FS.DownloadDirectoryPath;

export const notesFolder = `${FS.DocumentDirectoryPath}/notes`;

export const filesFolder = `${FS.DocumentDirectoryPath}/files`;

export const largeFileExtension = 'precloudlarge';
export const precloudExtension = 'precloud';
export const noteExtension = 'precloudnote';
