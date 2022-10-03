const openpgp = require('openpgp');

const { unit8ToBase64, base64ToString, base64ToUint8 } = require('./helpers')

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
    const encrypted = base64ToUint8(base64);
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

const MIME_TYPE_ARRAY_LENGTH = 60;

async function encryptFile(fileBase64, password) {
  try {
    const message = await openpgp.createMessage({
      binary: base64ToUint8(fileBase64),
    });

    const encrypted = await openpgp.encrypt({
      message,
      passwords: [password],
      format: 'binary',
    });

    const fileUnit8 = base64ToUint8(encrypted);
    const encryptedString = unit8ToBase64(fileUnit8);

    return { data: encryptedString, error: null };
  } catch (e) {
    return { data: null, error: e };
  }
}

function getMimeType(uintArr) {
  // Encrypted file after mimeType is added to encryption
  if (uintArr.filter(n => n === 0).length > 10) {
    return base64ToString(unit8ToBase64(uintArr.filter(n => n > 0)));
  }

  return null;
}

async function decryptFile(encryptedBase64, password) {
  try {
    const uint8 = base64ToUint8(encryptedBase64);
    const mimeTypeUint8 = uint8.slice(0, MIME_TYPE_ARRAY_LENGTH);
    const mimeType = getMimeType(mimeTypeUint8)

    const encryptedMessage = await openpgp.readMessage({
      binaryMessage: mimeType ? uint8.slice(MIME_TYPE_ARRAY_LENGTH) : uint8, // parse encrypted bytes
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
