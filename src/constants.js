// These URLS are static, for now.
const IRISH_DATA_URL = 'https://services1.arcgis.com/eNO7HHeQ3rUcBllm/arcgis/rest/services/CovidStatisticsProfileHPSCIrelandOpenData/FeatureServer/0/query?f=json&where=1%3D1&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&orderByFields=Date%20asc&resultOffset=0&resultRecordCount=32000&resultType=standard&cacheHint=true';
const CORK_DATA_URL = 'https://services1.arcgis.com/eNO7HHeQ3rUcBllm/arcgis/rest/services/Covid19CountyStatisticsHPSCIreland/FeatureServer/0/query?f=json&where=(TimeStamp%3Etimestamp%20%272020-03-20%2023%3A59%3A59%27)%20AND%20(CountyName%3D%27Cork%27)&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&orderByFields=TimeStamp%20asc&resultOffset=0&resultRecordCount=4000&resultType=standard&cacheHint=true';
const CASES_IN_HOSPITAL_URL = 'https://services-eu1.arcgis.com/z6bHNio59iTqqSUY/arcgis/rest/services/Covid19AcuteHospitalCurrentData/FeatureServer/0/query?f=json&where=1%3D1&outFields=*&returnGeometry=false&outStatistics=%5B%7B%22onStatisticField%22%3A%22SUM_number_of_confirmed_covid_1%22%2C%22outStatisticFieldName%22%3A%22SUM_number_of_confirmed_covid_1_sum%22%2C%22statisticType%22%3A%22sum%22%7D%5D';
const CASES_IN_ICU_URL = 'https://services-eu1.arcgis.com/z6bHNio59iTqqSUY/arcgis/rest/services/ICUBISCurrentTimelinePublicView/FeatureServer/0/query?f=json&where=1%3D1&outFields=*&returnGeometry=false&outStatistics=%5B%7B%22onStatisticField%22%3A%22ncovidconf%22%2C%22outStatisticFieldName%22%3A%22ncovidconf_sum%22%2C%22statisticType%22%3A%22sum%22%7D%5D';
const VACCINE_DATA_URL = 'https://services-eu1.arcgis.com/z6bHNio59iTqqSUY/arcgis/rest/services/COVID19_Daily_Vaccination/FeatureServer/0/query?f=json&cacheHint=true&resultOffset=0&resultRecordCount=1&where=1%3D1&orderByFields=VaccinationDate%20DESC&outFields=*&resultType=standard&returnGeometry=false&spatialRel=esriSpatialRelIntersects';

// This provides cases for every county. Theres a placeholder "TIMESTAMP_TO_FILTER_BY" that needs to be replaced
// to get the cases after a certain date in YYYY-MM-DD format.
const COUNTY_BREAKDOWN_URL = 'https://services1.arcgis.com/eNO7HHeQ3rUcBllm/arcgis/rest/services/Covid19CountyStatisticsHPSCIreland/FeatureServer/0/query?f=json&where=(TimeStamp%3Etimestamp%20%27TIMESTAMP_TO_FILTER_BY%2023%3A59%3A59%27)&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&orderByFields=TimeStamp%20asc&resultOffset=0&resultRecordCount=4000&resultType=standard&cacheHint=true';

const IRISH_POPULATION_2021 = 5010000;

module.exports = {
  IRISH_DATA_URL,
  CORK_DATA_URL,
  CASES_IN_HOSPITAL_URL,
  CASES_IN_ICU_URL,
  COUNTY_BREAKDOWN_URL,
  VACCINE_DATA_URL,
  IRISH_POPULATION_2021,
};
