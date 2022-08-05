var openpgp = require('openpgp');

function base64ToUnit8(base64String) {
  return new Uint8Array(Buffer.from(base64String, 'base64'));
}

function unit8ToBase64(unit8) {
  return Buffer.from(unit8).toString('base64');
}

async function encryptFile(fileBase64, password) {
  const message = await openpgp.createMessage({
    binary: base64ToUnit8(fileBase64),
  });

  const encrypted = await openpgp.encrypt({
    message,
    passwords: [password],
    format: 'binary',
  });
  const encryptedString = unit8ToBase64(encrypted);

  return encryptedString;
}

async function decryptFile(encryptedBase64, password) {
  const unit8 = base64ToUnit8(encryptedBase64);
  const encryptedMessage = await openpgp.readMessage({
    binaryMessage: unit8, // parse encrypted bytes
  });
  const {data} = await openpgp.decrypt({
    message: encryptedMessage,
    passwords: [password],
    format: 'binary',
  });

  return unit8ToBase64(data);
}

async function encryptText(text, password) {
  const message = await openpgp.createMessage({
    text,
  });
  const encrypted = await openpgp.encrypt({
    message,
    passwords: [password],
    format: 'armored',
  });

  return Buffer.from(encrypted, 'utf8').toString('base64');
}

async function decryptText(encryptedText, password) {
  const message = Buffer.from(encryptedText, 'base64').toString('utf8')
  const encryptedMessage = await openpgp.readMessage({
    armoredMessage: message,
  });
  const {data} = await openpgp.decrypt({
    message: encryptedMessage,
    passwords: [password],
    format: 'utf8',
  });

  return data;
}

module.exports = {
  encryptFile,
  decryptFile,
  encryptText,
  decryptText,
};
