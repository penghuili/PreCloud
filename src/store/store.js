import create from 'zustand';

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

    if (!get().activePasswordId ) {
      await setActivePassword(get, set, passwords[0]?.id);
    } else if (get().activePasswordId === password.id) {
      await setActivePassword(get, set, passwords.id);
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

  decryptedFile: null,
  setDecryptedFile: file => set({ decryptedFile: file }),
}));
