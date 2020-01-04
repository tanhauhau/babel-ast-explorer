const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const folder = path.join(__dirname, '../src/utils/babel/versions');

const versions = [
  '7.5.0',
  '7.5.1',
  '7.5.2',
  '7.5.3',
  '7.5.4',
  '7.5.5',
  '7.6.0',
  '7.6.2',
  '7.6.3',
  '7.6.4',
  '7.7.0',
  '7.7.2',
  '7.7.4',
  '7.7.5',
  '7.7.7',
];

for (const version of versions) {
  const versionFolder = path.join(folder, version);
  if (fs.existsSync(versionFolder)) {
    continue;
  }
  fs.mkdirSync(versionFolder);
  fs.writeFileSync(
    path.join(versionFolder, 'index.js'),
    [
      '/* eslint-disable import/no-webpack-loader-syntax */',
      '',
      "module.exports = require('file-loader!@babel/standalone/babel.min.js');",
      '',
    ].join('\n'),
    'utf-8'
  );
  fs.writeFileSync(
    path.join(versionFolder, 'package.json'),
    JSON.stringify(
      {
        name: `babel-${version}`,
        private: true,
        main: 'index.js',
        dependencies: {
          '@babel/standalone': `${version}`,
        },
      },
      null,
      2
    ),
    'utf-8'
  );
  console.log(`Installing @babel/standalone@${version}`);
  execSync('yarn install', { cwd: versionFolder, stdio: 'inherit' });
}
