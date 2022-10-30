import FS from 'react-native-fs';
import { moveFile, readFolder } from './actions';

import { legacyNotesFolder, notesFolder, precloudFolder } from './constant';
import { extractFileNameAndExtension } from './helpers';

export async function makeNotesFolders() {
  const preCloudExists = await FS.exists(precloudFolder);
  if (!preCloudExists) {
    await FS.mkdir(precloudFolder);
  }

  const notesExists = await FS.exists(notesFolder);
  if (!notesExists) {
    await FS.mkdir(notesFolder);
  }

  const legacyExists = await FS.exists(legacyNotesFolder);
  if (legacyExists) {
    await moveFile(legacyNotesFolder, notesFolder);
  }
}

export async function makeNotebook(label) {
  const trimed = label?.trim();
  if (!trimed) {
    return;
  }

  await makeNotesFolders();

  const path = `${notesFolder}/${trimed}`;
  const exists = await FS.exists(path);
  if (!exists) {
    await FS.mkdir(path);
  }
}

export async function readNotebooks() {
  await makeNotesFolders();
  const notes = await readFolder(notesFolder);
  return notes.filter(n => n.isDirectory());
}

export async function readNotes(path) {
  const exists = await FS.exists(path);
  if (!exists) {
    return [];
  }

  const notes = await readFolder(path);
  return notes
    .filter(n => n.isFile())
    .map(n => ({ ...n, fileName: extractFileNameAndExtension(n.name).fileName }));
}
