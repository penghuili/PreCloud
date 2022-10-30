import FS from 'react-native-fs';
import { readFolder } from './actions';

import { notesFolder } from './constant';
import { extractFileNameAndExtension } from './helpers';

export async function makeNotesFolders() {
  const exists = await FS.exists(notesFolder);
  if (!exists) {
    await FS.mkdir(notesFolder);
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
