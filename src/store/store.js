import create from 'zustand';

import { deleteFile as deleteFileFromPhone, moveFile } from '../lib/files/actions';
import { filesFolder, notesFolder } from '../lib/files/constant';
import { createFolder, readFolders } from '../lib/files/file';
import { getParentPath } from '../lib/files/helpers';
import { makeNotebook, readNotebooks } from '../lib/files/note';
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

async function makeDefaultFolders(get, set, folders) {
  let innerFolders = folders;
  let defaultFolder;
  if (!innerFolders?.length) {
    defaultFolder = 'Inbox';
    await createFolder(defaultFolder);
    innerFolders = await readFolders();
  } else {
    defaultFolder = await LocalStorage.get(LocalStorageKeys.defaultFileFolder);
    if (!defaultFolder || !innerFolders.find(f => f.name === defaultFolder)) {
      defaultFolder = innerFolders[0].name;
      await LocalStorage.set(LocalStorageKeys.defaultFileFolder, defaultFolder);
    }
  }

  return { defaultFolder, folders: innerFolders };
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
  loadNotebooks: async () => {
    const books = await readNotebooks();
    set({ notebooks: books })
  },
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
  rootFolders: [],
  setRootFolders: value => set({ rootFolders: value }),
  loadRootFolders: async () => {
    const currentFolders = await readFolders();
    const { defaultFolder, folders } = await makeDefaultFolders(get, set, currentFolders);

    set({
      rootFolders: folders,
      defaultFolder,
    });
  },
  defaultFolder: null,
  createFolder: async (label, parentPath) => {
    const newFolder = await createFolder(label, parentPath);

    if (!parentPath) {
      const newFolders = await readFolders();
      const isFirst = newFolders.length === 1;
      if (isFirst) {
        await LocalStorage.set(LocalStorageKeys.defaultFileFolder, newFolders[0].name);
      }

      set({
        rootFolders: newFolders,
        defaultFolder: isFirst ? label : get().defaultFolder,
      });
    }

    return newFolder;
  },
  renameFolder: async ({ folder, label }) => {
    const parentPath = getParentPath(folder.path);
    const newPath = `${parentPath}/${label}`;
    await moveFile(folder.path, newPath);

    const isRoot = parentPath === filesFolder;
    if (isRoot) {
      const newFolders = await readFolders();
      const currentDefault = get().defaultFolder;
      const isDefault = currentDefault === folder.name;
      if (isDefault) {
        await LocalStorage.set(LocalStorageKeys.defaultFileFolder, label);
      }
      set({
        rootFolders: newFolders,
        defaultFolder: isDefault ? label : currentDefault,
      });
    }
  },
  updateDefaultFolder: async label => {
    await LocalStorage.set(LocalStorageKeys.defaultFileFolder, label);
    set({
      defaultFolder: label,
    });
  },
  deleteFolder: async folder => {
    await deleteFileFromPhone(folder.path);
    const newFolders = get().folders.filter(n => n.path !== folder.path);
    await LocalStorage.remove(LocalStorageKeys.defaultFileFolder);
    const { defaultFolder, folders } = await makeDefaultFolders(get, set, newFolders);
    set({
      rootFolders: folders,
      defaultFolder,
    });
  },
}));
