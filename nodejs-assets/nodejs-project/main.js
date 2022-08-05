const rn_bridge = require('rn-bridge');
const {
  encryptFile,
  decryptFile,
  encryptText,
  decryptText,
} = require('./openpgp');

rn_bridge.channel.on('message', async msg => {
  try {
    if (msg.type === 'encrypt-file') {
      const encrypted = await encryptFile(
        msg.data.fileBase64,
        msg.data.password,
      );
      rn_bridge.channel.send({
        type: 'encrypted-file',
        data: {encrypted, path: msg.data.path},
      });
    } else if (msg.type === 'decrypt-file') {
      const decrypted = await decryptFile(
        msg.data.fileBase64,
        msg.data.password,
      );
      rn_bridge.channel.send({
        type: 'decrypted-file',
        data: {decrypted, path: msg.data.path},
      });
    } else if (msg.type === 'encrypt-text') {
      const encrypted = await encryptText(msg.data.text, msg.data.password);
      rn_bridge.channel.send({
        type: 'encrypted-text',
        data: {encrypted},
      });
    } else if (msg.type === 'decrypt-text') {
      const decrypted = await decryptText(
        msg.data.encryptedText,
        msg.data.password,
      );
      rn_bridge.channel.send({
        type: 'decrypted-text',
        data: {decrypted},
      });
    } else {
      rn_bridge.channel.send(msg);
    }
  } catch (e) {
    rn_bridge.channel.send(JSON.stringify(e));
  }
});

rn_bridge.channel.send({type: 'initiated nodejs'});
