import * as Keychain from 'react-native-keychain';

const passwordSeparator = 'YE7VJ6WBUGGV6D4RZRN36Q';
const labelPasswordSeparator = 'QR62XVUHJU7TBCNHTXF9TM';
const defaultId = '1663012537092';

export async function savePasswords(passwords) {
  const value = passwords
    .map(
      p => `${p.id}${labelPasswordSeparator}${p.label.trim()}${labelPasswordSeparator}${p.password}`
    )
    .join(passwordSeparator);
  await Keychain.setGenericPassword('precloud', value);
}

export async function getPasswords() {
  try {
    const result = await Keychain.getGenericPassword();
    if (!result?.password) {
      return [];
    }
    const password = result.password;
    return password.split(passwordSeparator).map(p => {
      const arr = p.split(labelPasswordSeparator);
      return arr.length === 3
        ? { id: arr[0], label: arr[1], password: arr[2] }
        : { id: defaultId, label: 'Primary password', password: arr[0] };
    });
  } catch (e) {
    console.log('read keychain failed', e);
    return [];
  }
}
