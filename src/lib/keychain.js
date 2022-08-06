import * as Keychain from 'react-native-keychain';

export async function savePassword(password) {
  await Keychain.setGenericPassword('precloud', password);
}

export async function getPassword() {
  try {
    const result = await Keychain.getGenericPassword();
    return result && result.password;
  } catch (e) {
    console.log(e);
    return '';
  }
}
