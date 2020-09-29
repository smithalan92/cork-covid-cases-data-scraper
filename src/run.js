/* eslint-disable no-return-assign */
/* eslint-disable no-param-reassign */
const fs = require('fs-extra');
const path = require('path');
const moment = require('moment');
const api = require('./api');
const webRepo = require('./web-repo');

const DATA_FILE_PATH = path.join(__dirname, 'data.json');

/*
  Get Irish confirmed case & Death counts and timeline of both
  Returns a {Promise} that resolves to an {Object}
*/
async function getIrishStatistics() {
  try {
    const irishData = await api.getIrishData();

    const sortedIrishData = irishData.sort((a, b) => new Date(a.Date) - new Date(b.Date));

    const latestRecord = sortedIrishData[sortedIrishData.length - 1];
    const totalIrishCases = latestRecord.TotalConfirmedCovidCases;
    const totalIrishDeaths = latestRecord.TotalCovidDeaths;

    const irishCaseIncreaseSinceYesterday = latestRecord.ConfirmedCovidCases;
    const irishDeathIncreaseSinceYesterday = latestRecord.ConfirmedCovidDeaths;

    const processedIrishData = sortedIrishData.map((record) => ({
      date: new Date(record.Date).toISOString(),
      newCases: record.ConfirmedCovidCases,
      newDeaths: record.ConfirmedCovidDeaths,
    }));

    const {
      irishCasesInPast30Days,
      irishCasesInPast14Days,
      irishDeathsInPast30Days,
      irishDeathsInPast14Days,
    } = processedIrishData
      .slice(processedIrishData.length - 30)
      .reduce((acc, current, index) => {
        acc.irishCasesInPast30Days += current.newCases;
        acc.irishDeathsInPast30Days += current.newDeaths;

        if (index >= 16) {
          acc.irishCasesInPast14Days += current.newCases;
          acc.irishDeathsInPast14Days += current.newDeaths;
        }

        return acc;
      }, {
        irishCasesInPast30Days: 0,
        irishCasesInPast14Days: 0,
        irishDeathsInPast30Days: 0,
        irishDeathsInPast14Days: 0,
      });

    console.log('Recieved and processed Irish data');

    return {
      totalIrishCases,
      totalIrishDeaths,
      irishCaseIncreaseSinceYesterday,
      irishDeathIncreaseSinceYesterday,
      processedIrishData,
      irishCasesInPast30Days,
      irishCasesInPast14Days,
      irishDeathsInPast30Days,
      irishDeathsInPast14Days,
    };
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

    const {
      totalCorkCasesInPast30Days,
      totalCorkCasesInPast14Days,
    } = processedData
      .slice(processedData.length - 30)
      .reduce((acc, current, index) => {
        acc.totalCorkCasesInPast30Days += current.newCases;

        if (index >= 16) {
          acc.totalCorkCasesInPast14Days += current.newCases;
        }

        return acc;
      }, {
        totalCorkCasesInPast30Days: 0,
        totalCorkCasesInPast14Days: 0,
      });

    console.log('Recieved and processed Cork data');

    return { processedData, totalCasesInCork, totalCorkCasesInPast30Days, totalCorkCasesInPast14Days };
  } catch (error) {
    console.error(`Failed to get new cork data: ${error}`);
    throw error;
  }
}

async function getCountyBreakdownStatistics() {
  try {
    const countyData = await api.getCountyBreakdownData();

    const data = countyData.reduce((acc, { CountyName, value }) => {
      acc[CountyName.toLowerCase()] = value;
      return acc;
    }, {});

    console.log('Recieved and processed county data');

    return data;
  } catch (error) {
    console.error(`Failed to get new county data: ${error}`);
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
      {
        totalIrishCases,
        totalIrishDeaths,
        irishCaseIncreaseSinceYesterday,
        irishDeathIncreaseSinceYesterday,
        processedIrishData,
        irishCasesInPast30Days,
        irishCasesInPast14Days,
        irishDeathsInPast30Days,
        irishDeathsInPast14Days,
      },
      {
        processedData,
        totalCasesInCork,
        totalCorkCasesInPast30Days,
        totalCorkCasesInPast14Days,
      },
      countyData,
    ] = await Promise.all([
      getIrishStatistics(),
      getCorkStatistics(),
      getCountyBreakdownStatistics(),
    ]);

    const dataObject = {
      totalIrishCases,
      totalIrishDeaths,
      changeInIrishCases: irishCaseIncreaseSinceYesterday,
      changeInIrishDeaths: irishDeathIncreaseSinceYesterday,
      irishCasesInPast30Days,
      irishCasesInPast14Days,
      irishDeathsInPast30Days,
      irishDeathsInPast14Days,
      latestIrishDataDateTime: new Date().toISOString(),
      latestCorkDataDateTime: processedData[processedData.length - 1].date,
      totalCasesInCork,
      totalCorkCasesInPast30Days,
      totalCorkCasesInPast14Days,
      corkData: processedData,
      irishData: processedIrishData,
      countyData,
    };

    await fs.writeJSON(DATA_FILE_PATH, dataObject, { spaces: 4 });

    await webRepo.updateDataFile(DATA_FILE_PATH);
  } catch {
    console.log('Script failed...');
  }
}

module.exports = run;
