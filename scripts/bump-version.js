const { join } = require('path');
const { writeFileSync, readFileSync } = require('fs');
const { execSync } = require('child_process');

const plist = require('simple-plist');
const properties = require('properties-parser');
const semver = require('semver');

const pkg = require('../package.json');

let version = process.argv[2];

if (!semver.valid(version)) {
  console.error('Please pass the new version as an argument');
  process.exit(1);
}

if (semver.lte(version, pkg.version)) {
  console.error('Please pass a version that is higher than the old one');
  process.exit(1);
}

version = semver.clean(version);

console.log(
  `Performing a ${semver.diff(version, pkg.version)} bump from ${pkg.version} to ${version}.`
);

const pkgPath = join(__dirname, '../package.json');
const pkgContent = JSON.stringify({ ...pkg, version }, null, 2);
writeFileSync(pkgPath, `${pkgContent}\n`);
console.log(`Version written to ${pkgPath}`);

const lock = require('../package-lock.json');
const lockPath = join(__dirname, '../package-lock.json');
const lockContent = JSON.stringify({ ...lock, version }, null, 2);
writeFileSync(lockPath, `${lockContent}\n`);
console.log(`Version written to ${lockPath}`);

const plistPath = join(__dirname, '../ios/PreCloud/Info.plist');
const infoPlist = plist.parse(String(readFileSync(plistPath)));
const content = plist.stringify({
  ...infoPlist,
  CFBundleShortVersionString: version,
});
const contentTabbed = content.replace(/^\s+/gm, spaces => {
  const indent = spaces.length / 2;
  return new Array(indent).join('\t');
});
writeFileSync(plistPath, `${contentTabbed}\n`);
console.log(`Version written to ${plistPath}`);

const gradlePath = join(__dirname, '../android/gradle.properties');
const gradlePropsEditor = properties.createEditor(gradlePath);
gradlePropsEditor.set('releaseVersionName', version);
gradlePropsEditor.save(gradlePath);
console.log(`Version written to ${gradlePath}`);

// Commit a version change
execSync(`git cc -am v${version} && git tag v${version} && git push && git push --tags`, {
  stdio: 'inherit',
});
