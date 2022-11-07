import FS from 'react-native-fs';

import { asyncForEach } from '../array';
import { deleteFile, moveFile, readFolder } from './actions';
import { filesFolder, legacyNotesFolder, noteExtension, notesFolder } from './constant';
import { extractFileNameAndExtension } from './helpers';

export function getNoteTitle(note) {
  return extractFileNameAndExtension(note?.name)?.fileName;
}

export async function migrateNotesToFolders() {
  let notesPath = null;

  const notesExists = await FS.exists(notesFolder);
  const legacyExists = await FS.exists(legacyNotesFolder);
  if (notesExists) {
    notesPath = notesFolder;
  } else if (legacyExists) {
    notesPath = legacyNotesFolder;
  }

  if (notesPath) {
    const result = await readFolder(notesPath);
    const notebooks = result.filter(n => n.isDirectory());
    await asyncForEach(notebooks, async notebook => {
      const newPath = `${filesFolder}/${notebook.name}`;
      const notebookExists = await FS.exists(newPath);
      if (notebookExists) {
        const notes = await readFolder(notebook.path);
        const filtered = notes.filter(n => n.isFile() && n.name.endsWith(noteExtension));
        await asyncForEach(filtered, async note => {
          await moveFile(note.path, `${newPath}/${note.name}`);
        });
        await deleteFile(notebook.path);
      } else {
        await moveFile(notebook.path, newPath);
      }
    });

    await deleteFile(notesFolder);
  }
}
