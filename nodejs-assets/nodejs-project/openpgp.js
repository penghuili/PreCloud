var openpgp = require('openpgp');

function base64ToUnit8(base64String) {
  return new Uint8Array(Buffer.from(base64String, 'base64'));
}

function unit8ToBase64(unit8) {
  return Buffer.from(unit8).toString('base64');
}

async function encryptText(text, password) {
  try {
    const message = await openpgp.createMessage({
      text,
    });
    const encrypted = await openpgp.encrypt({
      message,
      passwords: [password],
      format: 'armored',
    });
    const unarmored = await openpgp.unarmor(encrypted);

    return { data: `PreCloud:${unit8ToBase64(unarmored.data)}`, error: null };
  } catch (e) {
    return { data: null, error: e };
  }
}

function getEncryptedText(input) {
  if (!input) {
    return '';
  }

  const splitted = input.split(':');
  if (splitted.length > 1) {
    return splitted[1];
  }

  return splitted[0];
}

async function decryptText(input, password) {
  try {
    const base64 = getEncryptedText(input);
    const encrypted = base64ToUnit8(base64);
    const armored = openpgp.armor(openpgp.enums.armor.message, encrypted);

    const encryptedMessage = await openpgp.readMessage({
      armoredMessage: armored,
    });
    const { data } = await openpgp.decrypt({
      message: encryptedMessage,
      passwords: [password],
      format: 'utf8',
    });

    return { data, error: null };
  } catch (e) {
    return { data: null, error: e };
  }
}

async function encryptFile(fileBase64, password) {
  try {
    const message = await openpgp.createMessage({
      binary: base64ToUnit8(fileBase64),
    });

    const encrypted = await openpgp.encrypt({
      message,
      passwords: [password],
      format: 'binary',
    });
    const encryptedString = unit8ToBase64(encrypted);

    return { data: encryptedString, error: null };
  } catch (e) {
    return { data: null, error: e };
  }
}

async function decryptFile(encryptedBase64, password) {
  try {
    const unit8 = base64ToUnit8(encryptedBase64);
    const encryptedMessage = await openpgp.readMessage({
      binaryMessage: unit8, // parse encrypted bytes
    });
    const { data } = await openpgp.decrypt({
      message: encryptedMessage,
      passwords: [password],
      format: 'binary',
    });

    return { data: unit8ToBase64(data), error: null };
  } catch (e) {
    return { data: null, error: e };
  }
}

module.exports = {
  encryptFile,
  decryptFile,
  encryptText,
  decryptText,
};
