const rn_bridge = require('rn-bridge');
const { stringToBase64, base64ToString } = require('./helpers');
const { encryptFile, decryptFile, encryptText, decryptText } = require('./openpgp');

rn_bridge.channel.on('message', async msg => {
  if (msg.type === 'encrypt-file') {
    const { data, error } = await encryptFile(msg.data.fileBase64, msg.data.password);
    if (!error) {
      rn_bridge.channel.send({
        type: 'encrypted-file',
        payload: {
          data,
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
    const { data, error } = await decryptFile(msg.data.fileBase64, msg.data.password);

    if (!error) {
      rn_bridge.channel.send({
        type: 'decrypted-file',
        payload: {
          data,
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
    const { data, error } = await encryptText(msg.data.text, msg.data.password);

    if (!error) {
      rn_bridge.channel.send({
        type: 'encrypted-text',
        payload: { data, error: null },
      });
    } else {
      rn_bridge.channel.send({
        type: 'encrypted-text',
        payload: { data: null, error },
      });
    }
  } else if (msg.type === 'decrypt-text') {
    const { data, error } = await decryptText(msg.data.encryptedText, msg.data.password);

    if (!error) {
      rn_bridge.channel.send({
        type: 'decrypted-text',
        payload: { data, error: null },
      });
    } else {
      rn_bridge.channel.send({
        type: 'decrypted-text',
        payload: { data: null, error },
      });
    }
  } else if (msg.type === 'encrypt-rich-text') {
    const base64 = stringToBase64(msg.data.content);
    const { data, error } = await encryptFile(base64, msg.data.password);

    if (!error) {
      rn_bridge.channel.send({
        type: 'encrypted-rich-text',
        payload: {
          data,
          title: msg.data.title,
          error: null,
        },
      });
    } else {
      rn_bridge.channel.send({
        type: 'encrypted-rich-text',
        payload: {
          data: null,
          title: msg.data.title,
          error,
        },
      });
    }
  } else if (msg.type === 'decrypt-rich-text') {
    const { data, error } = await decryptFile(msg.data.fileBase64, msg.data.password);

    if (!error) {
      const text = base64ToString(data);
      rn_bridge.channel.send({
        type: 'decrypted-rich-text',
        payload: {
          data: text,
          fileName: msg.data.fileName,
          error: null,
        },
      });
    } else {
      rn_bridge.channel.send({
        type: 'decrypted-rich-text',
        payload: {
          data: null,
          error,
        },
      });
    }
  }
});

rn_bridge.channel.send({ type: 'initiated nodejs' });
