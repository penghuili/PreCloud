import OpenPGP from 'react-native-fast-openpgp';

export async function encryptFile(inputPath, outputPath, password) {
  try {
    await OpenPGP.encryptSymmetricFile(inputPath, outputPath, password);
    return true;
  } catch (e) {
    console.log('encrypt file failed', e);
    return false;
  }
}

export async function decryptFile(inputPath, outputPath, password) {
  try {
    await OpenPGP.decryptSymmetricFile(inputPath, outputPath, password);
    return true;
  } catch (e) {
    console.log('decrypt file failed', e);
    return false;
  }
}

const messageStart = `-----BEGIN PGP MESSAGE-----
Version: openpgp-mobile`;
const messageEnd = '----END PGP MESSAGE----';

function extractTextContent(encryptedText) {
  const startIndex = 53;
  const endIndex = encryptedText.indexOf(messageEnd) - 2;
  return `PreCloud:${encryptedText.slice(startIndex, endIndex)}`;
}

function removePreCloudPrefix(input) {
  if (!input) {
    return '';
  }

  const splitted = input.split(':');
  if (splitted.length > 1) {
    return splitted[1];
  }

  return splitted[0];
}

function fillText(extractedText) {
  const withoutPrefix = removePreCloudPrefix(extractedText);

  return `${messageStart}

${withoutPrefix}
${messageEnd}`;
}

// TODO: wait that this lib has unarmor and armor
export async function encryptText(text, password) {
  try {
    const encryptedText = await OpenPGP.encryptSymmetric(text, password);
    return extractTextContent(encryptedText);
  } catch (e) {
    console.log('encrypt text failed', e);
    return null;
  }
}

export async function decryptText(encryptedText, password) {
  try {
    const fullText = fillText(encryptedText);
    const text = await OpenPGP.decryptSymmetric(fullText, password);
    return text;
  } catch (e) {
    console.log('decrypt text failed', e);
    return null;
  }
}
