const { join } = require('path');

const properties = require('properties-parser');

const gradlePath = join(__dirname, '../android/gradle.properties');
const gradlePropsEditor = properties.createEditor(gradlePath);
const versionCode = gradlePropsEditor.get('releaseVersionCode');
const newNumber = (+versionCode + 1).toString();
gradlePropsEditor.set('releaseVersionCode', newNumber);
gradlePropsEditor.save(gradlePath);
console.log(`Android build number ${newNumber} is written to ${gradlePath}`);
