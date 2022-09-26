const rn_bridge = require('rn-bridge');
const { replaceImagesWithHash } = require('./node-crypto');
const { encryptFile, decryptFile, encryptText, decryptText } = require('./openpgp');

rn_bridge.channel.on('message', async msg => {
  if (msg.type === 'encrypt-file') {
    const { data: encrypted, error } = await encryptFile(
      msg.data.fileBase64,
      msg.data.password
    );
    if (encrypted) {
      rn_bridge.channel.send({
        type: 'encrypted-file',
        payload: {
          data: encrypted,
          error: null,
          name: msg.data.name,
          path: msg.data.path,
        },
      });
    } else {
      rn_bridge.channel.send({
        type: 'encrypted-file',
        payload: {
          data: null,
          error,
          name: msg.data.name,
          path: msg.data.path,
        },
      });
    }
  } else if (msg.type === 'decrypt-file') {
    const { data: decrypted, error } = await decryptFile(msg.data.fileBase64, msg.data.password);

    if (decrypted) {
      rn_bridge.channel.send({
        type: 'decrypted-file',
        payload: {
          data: decrypted.file,
          error: null,
          path: msg.data.path,
        },
      });
    } else {
      rn_bridge.channel.send({
        type: 'decrypted-file',
        payload: { data: null, error, path: msg.data.path },
      });
    }
  } else if (msg.type === 'encrypt-text') {
    const { data: encrypted, error } = await encryptText(msg.data.text, msg.data.password);

    if (encrypted) {
      rn_bridge.channel.send({
        type: 'encrypted-text',
        payload: { data: encrypted, error: null },
      });
    } else {
      rn_bridge.channel.send({
        type: 'encrypted-text',
        payload: { data: null, error },
      });
    }
  } else if (msg.type === 'decrypt-text') {
    const { data: decrypted, error } = await decryptText(msg.data.encryptedText, msg.data.password);

    if (decrypted) {
      rn_bridge.channel.send({
        type: 'decrypted-text',
        payload: { data: decrypted, error: null },
      });
    } else {
      rn_bridge.channel.send({
        type: 'decrypted-text',
        payload: { data: null, error },
      });
    }
  } else if (msg.type === 'replace-image-with-hash') {
    const replaced = replaceImagesWithHash(msg.data.text);

    rn_bridge.channel.send({
      type: 'replaced-image-with-hash',
      payload: { data: replaced, error: null },
    });
  }
});

rn_bridge.channel.send({ type: 'initiated nodejs' });
