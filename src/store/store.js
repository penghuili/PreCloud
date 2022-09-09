import create from 'zustand';
import { getPassword } from '../lib/keychain';

export const useStore = create(set => ({
  masterPassword: '',
  setMasterPassword: p => set({ masterPassword: p }),
  getMasterPassword: async () => {
    const p = await getPassword();
    set({ masterPassword: p || '' });
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
