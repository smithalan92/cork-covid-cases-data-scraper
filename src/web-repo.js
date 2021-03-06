/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const { exec, spawn } = require('child_process');
const path = require('path');

const BASE_DIRECTORY = process.env.IRELAND_COVID_PROJECT_DIR;

/*
  Reset the web app to master && pull changes
  Returns a {Promise} that resolves when operation is complete
*/
async function updateProject() {
  return new Promise((resolve, reject) => {
    exec('git reset --hard && git checkout master && git pull', { cwd: BASE_DIRECTORY, timeout: 15000 }, (error) => {
      if (error) {
        console.error(`Failed to update project: ${error}`);
        return reject();
      }

      console.log('Project updated');
      return resolve();
    });
  });
}

/*
  Copies the newly generated data file to the web app directory
  Returns a {Promise} that resolves when operation is complete
*/
async function moveNewDataFile(newDateFilePath) {
  return new Promise((resolve, reject) => {
    const targetDirectory = path.join(BASE_DIRECTORY, 'src');

    exec(`mv -f ${newDateFilePath} ${targetDirectory}`, { timeout: 5000 }, (error) => {
      if (error) {
        console.error(`Failed to move new data file: ${error}`);
        return reject();
      }

      console.log('New data moved');
      return resolve();
    });
  });
}

/*
  Commits the new data file and pushes it to the remote
  Returns a {Promise} that resolves when operation is complete
*/
async function commitAndPushChange() {
  return new Promise((resolve, reject) => {
    const commandToExecute = `git add . && git commit -m "Update data file ${new Date().toISOString()}" && git push -u origin`;
    exec(commandToExecute, { cwd: BASE_DIRECTORY, timeout: 25000 }, (error) => {
      if (error) {
        console.error(`Failed to commit data changes: ${error}`);
        return reject();
      }

      console.log('New data commited and pushed');
      return resolve();
    });
  });
}

/*
  Rebuilds the web app with the latest data file
  Returns a {Promise} that resolves when operation is complete
*/
async function rebuildWebApp() {
  return new Promise((resolve, reject) => {
    const build = spawn('npm', ['run', 'build'], { cwd: BASE_DIRECTORY, detached: true });

    build.on('close', (code) => {
      if (code !== 0) {
        console.log('Web app rebuild failed: Code ', code);
        reject();
      } else {
        console.log('Web app rebuild finished');
        resolve();
      }
    });
  });
}

async function updateDataFile(newDataFilePath) {
  await updateProject();
  await moveNewDataFile(newDataFilePath);
  await commitAndPushChange();
  await rebuildWebApp();
}

function getLatestData() {
  return require(`${BASE_DIRECTORY}/src/data.json`);
}

module.exports = {
  updateDataFile,
  getLatestData,
};
