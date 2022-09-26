const crypto = require('crypto');

function hash(value) {
  return crypto.createHash('md5').update(value).digest('hex');
}

function replaceImagesWithHash(text) {
  const imageBase64s = Array.from(text.matchAll(/<img.*?src=.*?base64,(.*?)">/g)).map(
    item => item[1]
  );
  const hashes = imageBase64s.map(value => hash(value));

  let index = 0;
  const replaced = text.replace(/(<img.*?>)/g, () => {
    return `<img hash="${hashes[index++]}" >`;
  });

  return replaced;
}

module.exports = {
  replaceImagesWithHash,
};
