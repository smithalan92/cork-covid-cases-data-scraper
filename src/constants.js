// These URLS are static, for now.
const IRISH_DATA_URL = 'https://services1.arcgis.com/eNO7HHeQ3rUcBllm/arcgis/rest/services/CovidStatisticsProfileHPSCIrelandOpenData/FeatureServer/0/query?f=json&where=1%3D1&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&orderByFields=Date%20asc&resultOffset=0&resultRecordCount=32000&resultType=standard&cacheHint=true';
const CORK_DATA_URL = 'https://services1.arcgis.com/eNO7HHeQ3rUcBllm/arcgis/rest/services/Covid19CountyStatisticsHPSCIreland/FeatureServer/0/query?f=json&where=(TimeStamp%3Etimestamp%20%272020-03-20%2023%3A59%3A59%27)%20AND%20(CountyName%3D%27Cork%27)&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&orderByFields=TimeStamp%20asc&resultOffset=0&resultRecordCount=4000&resultType=standard&cacheHint=true';
const COUNTY_SUMMARY_URL = 'https://services1.arcgis.com/eNO7HHeQ3rUcBllm/arcgis/rest/services/CovidCountyStatisticsHPSCIrelandOsiView/FeatureServer/0/query?f=json&where=1%3D1&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&groupByFieldsForStatistics=CountyName&orderByFields=value%20desc&outStatistics=%5B%7B%22statisticType%22%3A%22avg%22%2C%22onStatisticField%22%3A%22ConfirmedCovidCases%22%2C%22outStatisticFieldName%22%3A%22value%22%7D%5D&resultType=standard&cacheHint=true';

module.exports = {
  IRISH_DATA_URL,
  CORK_DATA_URL,
  COUNTY_SUMMARY_URL,
};
