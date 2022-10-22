const { join } = require('path');
const { writeFileSync, readFileSync } = require('fs');
const { execSync } = require('child_process');

// bump android build number
const properties = require('properties-parser');
const gradlePath = join(__dirname, '../android/gradle.properties');
const gradlePropsEditor = properties.createEditor(gradlePath);
const versionCode = gradlePropsEditor.get('releaseVersionCode');
const newAndroidNumber = (+versionCode + 1).toString();
gradlePropsEditor.set('releaseVersionCode', newAndroidNumber);
gradlePropsEditor.save(gradlePath);
console.log(`Android build number ${newAndroidNumber} is written to ${gradlePath}`);

// bump ios build number
const plist = require('simple-plist');
const plistPath = join(__dirname, '../ios/PreCloud/Info.plist');
const infoPlist = plist.parse(String(readFileSync(plistPath)));
const newIOSNumber = ((+infoPlist.CFBundleVersion || 0) + 1).toString();
const content = plist.stringify({
  ...infoPlist,
  CFBundleVersion: newIOSNumber,
});
const contentTabbed = content.replace(/^\s+/gm, spaces => {
  const indent = spaces.length / 2;
  return new Array(indent).join('\t');
});
writeFileSync(plistPath, `${contentTabbed}\n`);
console.log(`iOS build number ${newIOSNumber} is written to ${plistPath}`);

// bump build date
const appSettings = require('../src/lib/app-settings.json');
const appSettingsPath = join(__dirname, '../src/lib/app-settings.json');
const appSettingsContent = JSON.stringify({ ...appSettings, buildDate: Date.now() }, null, 2);
writeFileSync(appSettingsPath, `${appSettingsContent}\n`);
console.log(`Build date written to ${appSettingsContent}`);

execSync(`git cc -am "build-number: Android ${newAndroidNumber}, iOS ${newIOSNumber}"`, {
  stdio: 'inherit',
});
