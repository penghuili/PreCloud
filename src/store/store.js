import create from 'zustand';
import { getPassword } from '../lib/keychain';

export const useStore = create(set => ({
  masterPassword: '',
  setMasterPassword: p => set({ masterPassword: p }),
  getMasterPassword: async () => {
    const p = await getPassword();
    set({ masterPassword: p || '' });
  },
}));
