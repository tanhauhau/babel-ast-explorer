const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const folder = path.join(__dirname, '../src/utils/babel/versions');

const versions = fs.readdirSync(folder);
for (const version of versions) {
  const versionFolder = path.join(folder, version);
  if (fs.statSync(versionFolder).isDirectory()) {
    console.log(`Installing @babel/standalone@${version}`);
    execSync('yarn install', { cwd: versionFolder, stdio: 'inherit' });
  }
}
