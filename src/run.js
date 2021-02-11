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

    const processedCorkData = corkData.map(({ ConfirmedCovidCases, TimeStamp }, index) => {
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
    } = processedCorkData
      .slice(processedCorkData.length - 30)
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

    return { processedCorkData, totalCasesInCork, totalCorkCasesInPast30Days, totalCorkCasesInPast14Days };
  } catch (error) {
    console.error(`Failed to get new cork data: ${error}`);
    throw error;
  }
}

async function getCountyBreakdownStatistics() {
  try {
    const afterDate = moment().subtract(21, 'days').format('YYYY-MM-DD');
    const data = await api.getCountyBreakdownData(afterDate);

    const countyData = data.reduce((acc, current) => {
      const countyName = current.CountyName.toLowerCase();
      if (!acc[countyName]) {
        acc[countyName] = [];
      }

      acc[countyName].push({
        cases: current.ConfirmedCovidCases,
        date: new Date(current.TimeStamp),
        population: current.PopulationCensus16,
      });

      return acc;
    }, {});

    const processedCountyData = {};

    Object.keys(countyData).forEach((county) => {
      const countyCaseData = countyData[county];

      // Sort cases in DESC order
      const sortedCountCaseDataDesc = countyCaseData.sort((a, b) => new Date(b.date) - new Date(a.date));
      const numberOfRecords = sortedCountCaseDataDesc.length;

      const dailyCaseData = sortedCountCaseDataDesc.map((record, index) => {
        if (index === numberOfRecords - 1) return 0; // It dont matter we wont use it
        const dailyCases = record.cases - sortedCountCaseDataDesc[index + 1].cases;
        return dailyCases;
      });

      const totalCases14Days = dailyCaseData
        .slice(0, 14)
        .reduce((acc, current) => {
        // eslint-disable-next-line no-param-reassign
          acc += current;
          return acc;
        }, 0);

      const incidenceRate14Days = Math.round((totalCases14Days * 100000) / sortedCountCaseDataDesc[0].population);

      processedCountyData[county] = {
        totalCases: sortedCountCaseDataDesc[0].cases,
        totalCases14Days,
        incidenceRate14Days,
      };
    });

    console.log('Recieved and processed county data');

    return processedCountyData;
  } catch (error) {
    console.error(`Failed to get new county data: ${error}`);
    throw error;
  }
}

function isLatestDataMostRecent(newData, currentData) {
  const newLatestIrishDate = new Date(newData.latestIrishDataDateTime);
  const currentLatestIrishDate = new Date(currentData.latestIrishDataDateTime);
  const newLatestCorkDate = new Date(newData.latestCorkDataDateTime);
  const currentLatestCorkDate = new Date(currentData.latestCorkDataDateTime);

  const isLatest = newLatestIrishDate > currentLatestIrishDate && newLatestCorkDate > currentLatestCorkDate;

  if (!isLatest) {
    console.log(`
      Latest data is not the most recent:
      New Irish - ${newLatestIrishDate}
      Current Irish - ${currentLatestIrishDate}
      New Cork - ${newLatestCorkDate}
      Current Cork - ${currentLatestCorkDate}
    `);
  }

  return isLatest;
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
        processedCorkData,
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

    let dataObject = {
      totalIrishCases,
      totalIrishDeaths,
      changeInIrishCases: irishCaseIncreaseSinceYesterday,
      changeInIrishDeaths: irishDeathIncreaseSinceYesterday,
      irishCasesInPast30Days,
      irishCasesInPast14Days,
      irishDeathsInPast30Days,
      irishDeathsInPast14Days,
      lastDataUpdateDateTime: new Date().toISOString(),
      latestIrishDataDateTime: processedIrishData[processedIrishData.length - 1].date,
      latestCorkDataDateTime: processedCorkData[processedCorkData.length - 1].date,
      totalCasesInCork,
      totalCorkCasesInPast30Days,
      totalCorkCasesInPast14Days,
      corkData: processedCorkData,
      irishData: processedIrishData,
      countyData,
    };

    const currentAppData = webRepo.getLatestData();

    if (!isLatestDataMostRecent(dataObject, currentAppData)) {
      dataObject = currentAppData;
      dataObject.lastDataUpdateDateTime = new Date().toISOString();
    }

    await fs.writeJSON(DATA_FILE_PATH, dataObject, { spaces: 4 });

    await webRepo.updateDataFile(DATA_FILE_PATH);
  } catch (e) {
    console.log('Script failed...');
    console.error(e);
  }
}

module.exports = run;
