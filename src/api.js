const axios = require('axios');

const {
  TOTAL_CASE_DATA_URL,
  TOTAL_DEATH_DATA_URL,
  CORK_DATA_URL,
} = require('./constants');

async function getTotalIrishCases() {
  const { data } = await axios.get(TOTAL_CASE_DATA_URL);

  return data.features[0].attributes.TotalConfirmedCovidCases_max;
}

async function getTotalIrishDeaths() {
  const { data } = await axios.get(TOTAL_DEATH_DATA_URL);

  return data.features[0].attributes.TotalCovidDeaths_max;
}

async function getCorkCaseBreakdown() {
  const { data } = await axios.get(CORK_DATA_URL);

  return data.features.map((r) => r.attributes);
}

module.exports = {
  getTotalIrishCases,
  getTotalIrishDeaths,
  getCorkCaseBreakdown,
};
