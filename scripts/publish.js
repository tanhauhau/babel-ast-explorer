const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const GIT_URL = 'https://github.com/tanhauhau/babel-ast-explorer.git';

(async function() {
  const cacheFolder = path.join(require('os').homedir(), '.cache/babel-ast-explorer');
  const outputFolder = path.join(__dirname, '../build');
  if (!(await fs.exists(cacheFolder))) {
    await fs.mkdirp(cacheFolder);
    exec(
      `git clone ${GIT_URL} ${cacheFolder} --branch master --single-branch --origin origin --depth 1`
    );
  }

  // clean cache folder
  exec('git clean -df');

  exec('git checkout master');

  // make sure branch is always up to date
  exec('git fetch origin master');
  exec('git reset --hard origin/master');

  exec('git rm -r .');

  const files = await fs.readdir(outputFolder);
  for (const file of files) {
    await fs.copy(path.join(outputFolder, file), path.join(cacheFolder, file));
  }

  exec('git add .');
  exec(`git commit -m "Built on ${String(new Date())}"`);
  exec('git push origin master');

  function exec(cmd) {
    console.log(chalk.dim(cmd));
    execSync(cmd, { cwd: cacheFolder });
  }
})();
