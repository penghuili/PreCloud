var openpgp = require('openpgp');

function stringToBase64(str) {
  return Buffer.from(str).toString('base64');
}

function base64ToString(b64) {
  return Buffer.from(b64, 'base64').toString('utf8');
}

function base64ToUint8(base64String) {
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

async function encryptFile(mimeType, fileBase64, password) {
  try {
    const message = await openpgp.createMessage({
      binary: base64ToUint8(fileBase64),
    });

    const encrypted = await openpgp.encrypt({
      message,
      passwords: [password],
      format: 'binary',
    });

    const mimeTypeB64 = stringToBase64(mimeType);
    const mimeUnit8 = base64ToUint8(mimeTypeB64);
    const fileUnit8 = base64ToUint8(encrypted);
    const uint8 = new Uint8Array(MIME_TYPE_ARRAY_LENGTH + fileUnit8.length);
    uint8.set(mimeUnit8);
    uint8.set(fileUnit8, MIME_TYPE_ARRAY_LENGTH);
    const encryptedString = unit8ToBase64(uint8);

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

    return { data: { file: unit8ToBase64(data), mimeType }, error: null };
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
