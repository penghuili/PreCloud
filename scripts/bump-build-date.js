const { join } = require('path');
const { writeFileSync } = require('fs');

const appSettings = require('../src/lib/app-settings.json');

const appSettingsPath = join(__dirname, '../src/lib/app-settings.json');
const appSettingsContent = JSON.stringify({ ...appSettings, buildDate: Date.now() }, null, 2);
writeFileSync(appSettingsPath, `${appSettingsContent}\n`);
console.log(`Build date written to ${appSettingsContent}`);
