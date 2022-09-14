const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const integers = '0123456789';
const specialCharacters = '!@#$%^&*_-=+';

export function generatePassword(length, hasSpecialCharacters) {
  let chars = `${letters}${integers}`;
  if (hasSpecialCharacters) {
    chars = `${chars}${specialCharacters}`;
  }

  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return password;
}
