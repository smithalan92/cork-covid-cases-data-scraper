const axios = require('axios');

const {
  IRISH_DATA_URL,
  CORK_DATA_URL,
  CASES_IN_HOSPITAL_URL,
  CASES_IN_ICU_URL,
  COUNTY_BREAKDOWN_URL,
  VACCINE_DATA_URL,
} = require('./constants');

async function getIrishData() {
  const { data } = await axios.get(IRISH_DATA_URL);

  return data.features.map((r) => r.attributes);
}

async function getCorkCaseBreakdown() {
  const { data } = await axios.get(CORK_DATA_URL);

  return data.features.map((r) => r.attributes);
}

async function getCountyBreakdownData(afterDate) {
  const url = COUNTY_BREAKDOWN_URL.replace('TIMESTAMP_TO_FILTER_BY', afterDate);
  const { data } = await axios.get(url);

  return data.features.map((r) => r.attributes);
}

async function getHospitalStatistics() {
  const [{ data: icu }, { data: hospital }] = await Promise.all([
    axios.get(CASES_IN_ICU_URL),
    axios(CASES_IN_HOSPITAL_URL),
  ]);

  return {
    icuCount: icu.features[0].attributes.ncovidconf_sum,
    hospitalCount: hospital.features[0].attributes.SUM_number_of_confirmed_covid_1_sum,
  };
}

async function getVaccineStatistics() {
  const { data } = await axios.get(VACCINE_DATA_URL);

  return data.features[0].attributes;
}

module.exports = {
  getIrishData,
  getCorkCaseBreakdown,
  getCountyBreakdownData,
  getHospitalStatistics,
  getVaccineStatistics,
};
