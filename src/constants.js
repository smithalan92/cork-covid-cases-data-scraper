// These URLS are static, for now.
const TOTAL_CASE_DATA_URL = 'https://services1.arcgis.com/eNO7HHeQ3rUcBllm/arcgis/rest/services/Covid19StatisticsProfileHPSCIrelandView/FeatureServer/0/query?f=json&where=1%3D1&outFields=*&returnGeometry=false&outStatistics=%5B%7B%22onStatisticField%22%3A%22TotalConfirmedCovidCases%22%2C%22outStatisticFieldName%22%3A%22TotalConfirmedCovidCases_max%22%2C%22statisticType%22%3A%22max%22%7D%5D';
const TOTAL_DEATH_DATA_URL = 'https://services1.arcgis.com/eNO7HHeQ3rUcBllm/arcgis/rest/services/Covid19StatisticsProfileHPSCIrelandView/FeatureServer/0/query?f=json&where=1%3D1&outFields=*&returnGeometry=false&outStatistics=%5B%7B%22onStatisticField%22%3A%22TotalCovidDeaths%22%2C%22outStatisticFieldName%22%3A%22TotalCovidDeaths_max%22%2C%22statisticType%22%3A%22max%22%7D%5D';
const CORK_DATA_URL = 'https://services1.arcgis.com/eNO7HHeQ3rUcBllm/arcgis/rest/services/Covid19CountyStatisticsHPSCIreland/FeatureServer/0/query?f=json&where=(TimeStamp%3Etimestamp%20%272020-03-20%2023%3A59%3A59%27)%20AND%20(CountyName%3D%27Cork%27)&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&orderByFields=TimeStamp%20asc&resultOffset=0&resultRecordCount=4000&resultType=standard&cacheHint=true';

module.exports = {
  TOTAL_CASE_DATA_URL,
  TOTAL_DEATH_DATA_URL,
  CORK_DATA_URL,
};
