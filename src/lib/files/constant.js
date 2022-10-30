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
const audioExtensions = ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac', 'midi'];
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
export const documentPath = FS.DocumentDirectoryPath;
export const precloudFolder = `${documentPath}/PRECLOUD`;
export const notesFolderName = 'notes';
export const filesFolderName = 'files';
export const notesFolder = `${precloudFolder}/${notesFolderName}`;
export const filesFolder = `${precloudFolder}/${filesFolderName}`;
export const legacyNotesFolder = `${documentPath}/${notesFolderName}`;
export const legacyFilesFolder = `${documentPath}/${filesFolderName}`;

export const largeFileExtension = 'precloudlarge';
export const precloudExtension = 'precloud';
export const noteExtension = 'precloudnote';
