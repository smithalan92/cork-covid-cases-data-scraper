const axios = require('axios');

const {
  IRISH_DATA_URL,
  CORK_DATA_URL,
  COUNTY_SUMMARY_URL,
} = require('./constants');

async function getIrishData() {
  const { data } = await axios.get(IRISH_DATA_URL);

  return data.features.map((r) => r.attributes);
}

async function getCorkCaseBreakdown() {
  const { data } = await axios.get(CORK_DATA_URL);

  return data.features.map((r) => r.attributes);
}

async function getCountyBreakdownData() {
  const { data } = await axios.get(COUNTY_SUMMARY_URL);

  return data.features.map((r) => r.attributes);
}

module.exports = {
  getIrishData,
  getCorkCaseBreakdown,
  getCountyBreakdownData,
};
