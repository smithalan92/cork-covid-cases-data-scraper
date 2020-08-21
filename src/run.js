/* eslint-disable no-return-assign */
/* eslint-disable no-param-reassign */
const fs = require('fs-extra');
const path = require('path');
const moment = require('moment');
const api = require('./api');
const webRepo = require('./web-repo');

const DATA_FILE_PATH = path.join(__dirname, 'data.json');

/*
  Get Irish confirmed case & Death counts
  Returns a {Promise} that resolves to an {Object}
*/
async function getTotalIrishStatistics() {
  try {
    const [totalIrishCases, totalIrishDeaths] = await Promise.all([
      api.getTotalIrishCases(),
      api.getTotalIrishDeaths(),
    ]);

    console.log('Recieved Irish totals');

    return { totalIrishCases, totalIrishDeaths };
  } catch (error) {
    console.error(`Failed to get new irish stats: ${error}`);
    throw error;
  }
}

/*
  Gets Cork specific data and processes that data.
  Returns a {Promise} that resolves to an {Object}
*/
async function getCorkStatistics() {
  try {
    let corkData = await api.getCorkCaseBreakdown();

    // We're getting bad timestamps back from the API.
    // Need to filter out timestamps in the future
    // Then we sort so all the dates are in order ( ASC )
    corkData = corkData
      .filter(({ TimeStamp }) => !moment(TimeStamp).isAfter(moment(), 'day'))
      .sort((a, b) => new Date(a.TimeStamp) - new Date(b.TimeStamp));

    const processedData = corkData.map(({ ConfirmedCovidCases, TimeStamp }, index) => {
      let casesSincePrevious = 0;

      if (index > 0) {
        const previousConfirmedCases = corkData[index - 1].ConfirmedCovidCases;
        const differenceSincePrevious = ConfirmedCovidCases - previousConfirmedCases;
        casesSincePrevious = differenceSincePrevious > 0 ? differenceSincePrevious : 0;
      }

      return {
        date: new Date(TimeStamp).toISOString(),
        newCases: casesSincePrevious,
      };
    });

    const totalCasesInCork = corkData[corkData.length - 1].ConfirmedCovidCases;

    const totalCorkCasesInPast30Days = processedData
      .slice(processedData.length - 30, processedData.length)
      .reduce((acc, current) => acc += current.newCases, 0);

    console.log('Recieved and processed Cork data');

    return { processedData, totalCasesInCork, totalCorkCasesInPast30Days };
  } catch (error) {
    console.error(`Failed to get new cork data: ${error}`);
    throw error;
  }
}

/*
  Runs the entire script.
  1. Gets all Irish/Cork data and processes it.
  2. Writes the data to a JSON file
  3. Moves that JSON file to the web app git repo
  4. Commits the new data file
  5. Rebuilds the webapp which is automatically deployed
*/
async function run() {
  try {
    const [
      { totalIrishCases, totalIrishDeaths },
      { processedData, totalCasesInCork, totalCorkCasesInPast30Days }
    ] = await Promise.all([
      getTotalIrishStatistics(),
      getCorkStatistics(),
    ]);

    const dataObject = {
      totalIrishCases,
      totalIrishDeaths,
      latestIrishDataDateTime: new Date().toISOString(),
      latestCorkDataDateTime: processedData[processedData.length - 1].date,
      totalCasesInCork,
      totalCorkCasesInPast30Days,
      corkData: processedData,
    };

    await fs.writeJSON(DATA_FILE_PATH, dataObject, { spaces: 4 });

    await webRepo.updateDataFile(DATA_FILE_PATH);
  } catch {
    console.log('Script failed...');
    process.exit(1);
  }
}

module.exports = run();
