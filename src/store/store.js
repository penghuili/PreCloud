import create from 'zustand';
import FS from 'react-native-fs';

import { deleteFile, makeNotebook, notesFolder, readNotebooks } from '../lib/files';
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

  // encryptedFiles
  encryptedFiles: [],
  setEncryptedFiles: files => set({ encryptedFiles: files }),
  renameEncryptedFile: (originalFileName, file) =>
    set(state => ({
      encryptedFiles: state.encryptedFiles.map(f => (f.fileName === originalFileName ? file : f)),
    })),
  deleteEncryptedFile: file =>
    set(state => ({
      encryptedFiles: state.encryptedFiles.filter(f => f.fileName !== file.fileName),
    })),

  // decryptedFiles
  decryptedFiles: [],
  setDecryptedFiles: files => set({ decryptedFiles: files }),
  renameDecryptedFile: (originalFileName, file) =>
    set(state => ({
      decryptedFiles: state.decryptedFiles.map(f => (f.fileName === originalFileName ? file : f)),
    })),
  deleteDecryptedFile: file =>
    set(state => ({
      decryptedFiles: state.decryptedFiles.filter(f => f.fileName !== file.fileName),
    })),

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
    await FS.moveFile(notebook.path, newNotebook.path);
    const newNotebooks = await readNotebooks();
    set({ notebooks: newNotebooks, activeNotebook: newNotebook });
  },
  deleteNotebook: async notebook => {
    await deleteFile(notebook.path);
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
}));
