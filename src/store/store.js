import create from 'zustand';

import {
  deleteFile as deleteFileFromPhone,
  extractFileNameAndExtension,
  filesFolder,
  makeFilesFolder,
  makeNotebook,
  moveFile,
  notesFolder,
  readFilesFolders,
  readNotebooks,
} from '../lib/files';
import { getPasswords, savePasswords } from '../lib/keychain';
import { LocalStorage, LocalStorageKeys } from '../lib/localstorage';

async function setActivePassword(get, set, passwordId) {
  const active = get().passwords.find(p => p.id === passwordId);
  set({
    activePassword: active?.password || '',
    activePasswordId: active?.id || '',
    activePasswordLabel: active?.label || '',
  });
  await LocalStorage.set(LocalStorageKeys.activePassword, passwordId || '');
}

export const useStore = create((set, get) => ({
  // passwords
  passwords: [],
  isLoadingPasswords: true,
  activePassword: '',
  activePasswordId: '',
  activePasswordLabel: '',
  getPasswords: async () => {
    set({ isLoadingPasswords: true });
    const passwords = await getPasswords();
    set({ passwords });

    const activePasswordId = await LocalStorage.get(LocalStorageKeys.activePassword);
    const active = passwords.find(p => p.id === activePasswordId) || passwords[0];
    set({
      activePassword: active?.password || '',
      activePasswordId: active?.id || '',
      activePasswordLabel: active?.label || '',
      isLoadingPasswords: false,
    });
  },
  savePassword: async password => {
    const passwords = password.id
      ? get().passwords.map(p => (p.id === password.id ? password : p))
      : [
          ...get().passwords,
          { id: Date.now().toString(), label: password.label, password: password.password },
        ];
    set({ passwords });
    await savePasswords(passwords);

    if (!get().activePasswordId) {
      await setActivePassword(get, set, passwords[0]?.id);
    } else if (get().activePasswordId === password.id) {
      await setActivePassword(get, set, password.id);
    }
  },
  movePasswordToTop: async password => {
    const passwords = get().passwords;
    if (passwords.length < 2) {
      return;
    }

    const otherPasswords = passwords.filter(p => p.id !== password.id);
    const orderedPasswords = [password, ...otherPasswords];
    set({ passwords: orderedPasswords });
    await savePasswords(orderedPasswords);
  },
  movePasswordToBottom: async password => {
    const passwords = get().passwords;
    if (passwords.length < 2) {
      return;
    }

    const otherPasswords = passwords.filter(p => p.id !== password.id);
    const orderedPasswords = [...otherPasswords, password];
    set({ passwords: orderedPasswords });
    await savePasswords(orderedPasswords);
  },
  deletePassword: async password => {
    const { passwords, activePasswordId } = get();
    const filtered = passwords.filter(p => p.id !== password.id);

    set({ passwords: filtered });
    await savePasswords(filtered);

    if (password.id === activePasswordId) {
      const newActive = filtered[0];
      await setActivePassword(get, set, newActive?.id);
    }
  },
  setActivePassword: async passwordId => {
    await setActivePassword(get, set, passwordId);
  },

  // notes
  notebooks: [],
  setNotebooks: value => set({ notebooks: value }),
  activeNotebook: null,
  setActiveNotebook: value => set({ activeNotebook: value }),
  createNotebook: async label => {
    await makeNotebook(label);
    const newNotebooks = await readNotebooks();
    set({
      notebooks: newNotebooks,
      activeNotebook: newNotebooks.find(n => n.name === label.trim()),
    });
  },
  renameNotebook: async ({ notebook, label }) => {
    const newNotebook = { path: `${notesFolder}/${label.trim()}`, name: label.trim() };
    await moveFile(notebook.path, newNotebook.path);
    const newNotebooks = await readNotebooks();
    set({ notebooks: newNotebooks, activeNotebook: newNotebook });
  },
  deleteNotebook: async notebook => {
    await deleteFileFromPhone(notebook.path);
    set({
      notebooks: get().notebooks.filter(n => n.path !== notebook.path),
      activeNotebook: null,
    });
  },
  notes: [],
  setNotes: value => set({ notes: value }),
  activeNote: null,
  setActiveNote: value => set({ activeNote: value }),
  noteContent: '',
  setNoteContent: content => set({ noteContent: content }),

  // files
  folders: [],
  setFolders: value => set({ folders: value }),
  activeFolder: null,
  setActiveFolder: value => set({ activeFolder: value }),
  createFolder: async label => {
    await makeFilesFolder(label);
    const newFolders = await readFilesFolders();
    set({
      folders: newFolders,
      activeFolder: newFolders.find(n => n.name === label.trim()),
    });
  },
  renameFolder: async ({ folder, label }) => {
    const newFolder = { path: `${filesFolder}/${label.trim()}`, name: label.trim() };
    await moveFile(folder.path, newFolder.path);
    const newFolders = await readFilesFolders();
    set({ folders: newFolders, activeFolder: newFolder });
  },
  deleteFolder: async folder => {
    await deleteFileFromPhone(folder.path);
    set({
      folders: get().folders.filter(n => n.path !== folder.path),
      activeFolder: null,
    });
  },
  files: [],
  setFiles: value => set({ files: value }),
  addFile: value => {
    const currentFiles = get().files;
    if (currentFiles.find(f => f.name === value.name)) {
      set({ files: currentFiles.map(f => (f.name === value.name ? value : f)) });
    } else {
      set({ files: [value, ...currentFiles] });
    }
  },
  renameFile: async ({ file, folder, label }) => {
    const { extension } = extractFileNameAndExtension(file.name);
    const newName = `${label.trim()}${extension}`;
    const newFile = { ...file, path: `${folder.path}/${newName}`, name: newName };
    await moveFile(file.path, newFile.path);
    const newFiles = get().files.map(f => (f.path === file.path ? newFile : f));
    set({ files: newFiles });
  },
  deleteFile: async file => {
    await deleteFileFromPhone(file.path);
    set({
      files: get().files.filter(f => f.path !== file.path),
    });
  },
}));
