function stringToBase64(str) {
  return Buffer.from(str, 'utf8').toString('base64');
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

module.exports = {
  stringToBase64,
  base64ToString,
  base64ToUint8,
  unit8ToBase64,
};
