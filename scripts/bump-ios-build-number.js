const { join } = require('path');
const { writeFileSync, readFileSync } = require('fs');

const plist = require('simple-plist');

const plistPath = join(__dirname, '../ios/PreCloud/Info.plist');
const infoPlist = plist.parse(String(readFileSync(plistPath)));
const newNumber = ((+infoPlist.CFBundleVersion || 0) + 1).toString();
const content = plist.stringify({
  ...infoPlist,
  CFBundleVersion: newNumber,
});
const contentTabbed = content.replace(/^\s+/gm, spaces => {
  const indent = spaces.length / 2;
  return new Array(indent).join('\t');
});
writeFileSync(plistPath, `${contentTabbed}\n`);
console.log(`iOS build number ${newNumber} is written to ${plistPath}`);
