import AsyncStorage from '@react-native-async-storage/async-storage';

export const mimeTypePrefix = 'precloudmimetype_';

export const LocalStorage = {
  async set(key, value) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (e) {}
  },
  async get(key) {
    try {
      return AsyncStorage.getItem(key);
    } catch (e) {
      return null;
    }
  },
  async remove(key) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {}
  },
  async getKeys() {
    try {
      return AsyncStorage.getAllKeys();
    } catch (e) {
      return [];
    }
  },
  async batchRemove(keys) {
    try {
      await AsyncStorage.multiRemove(keys);
    } catch (e) {}
  },
};

export async function removeAllMimeTypes() {
  const keys = await LocalStorage.getKeys();
  const mimeTypeKeys = keys.filter(key => key.startsWith(mimeTypePrefix));
  if (mimeTypeKeys.length) {
    await LocalStorage.batchRemove(mimeTypeKeys);
  }
}
