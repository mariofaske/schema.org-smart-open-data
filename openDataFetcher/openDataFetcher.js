const request = require('request');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

var cologne_od_name = 'od_cologne';
var cologneData_root = 'https://geoportal.stadt-koeln.de/arcgis/rest/services/';
var cologne_format_string = '?f=pjson';
var cologne_queryString = "&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=4326&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&queryByDistance=&returnExtentsOnly=false&datumTransformation=&parameterValues=&rangeValues=&f=geojson";

var nyc_od_name = 'od_nyc';
var nycData_root_html = "https://data.cityofnewyork.us/browse?sortBy=most_accessed";
var nycData_root_api = "https://data.cityofnewyork.us/resource/";

var nycObjects = [];
var cologneObjects = [];

exports.getDatasetsList = async (callback) => {
    let response = await getDatasets();
    callback(response);
}

// gets the requested dataset from the specific portal
exports.getDataset = async (portal, requestedDataset, callback) => {
    switch (portal) {
        case cologne_od_name:
            let datasetString = requestedDataset.split(":");
            let datasetID = await new Promise((resolve, reject) => {
                for (const iterator of cologneObjects) {
                    if (Object.keys(iterator)[0] == requestedDataset) {
                        resolve(Object.values(iterator));
                    }
                }
            });
            // fetch the description of the dataset as json
            let responseJSON = await fetch(`${cologneData_root}${datasetString[0]}/MapServer/${datasetID}/${cologne_format_string}`)
                .then(res => res.json())
                .then(json => {
                    return json
                });
            // fetch specific dataset
            dataset = await fetch(`${cologneData_root}${datasetString[0]}/MapServer/${datasetID}/query?where=${responseJSON.fields[0].name}+is+not+null${cologne_queryString}`)
                .then(res => res.json())
                .then(json => {
                    return json
                });
            callback(dataset);
            break;
        case nyc_od_name:
            let datasetURL = await new Promise((resolve, reject) => {
                for (const iterator of nycObjects) {
                    if (Object.keys(iterator)[0] == requestedDataset) {
                        resolve(Object.values(iterator));
                    }
                }
            });
            let datasetHMTL = await fetch(datasetURL)
                .then(res => res.text())
                .then(body => {
                    return body
                });
            let textMatch = datasetHMTL.toString().match(/apiFoundryUrl":"https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/);
            let splittedID = textMatch[0].split("/");
            let datasetJSON = await fetch(`${nycData_root_api}${splittedID[splittedID.length - 1]}`)
                .then(res => res.json())
                .then(json => {
                    return json
                });
            callback(datasetJSON);
            break;

        default:
            console.log("NIX GEFUNDEN");
            break;
    }
}

async function getDatasets() {
    let cologneMainDatasetsList = await getCologneMainDatasetsList();

    let cologneSubDatasetsList = await getCologneSubDatasetsList(cologneMainDatasetsList);

    let nycDatasetsList = await getNYCDatasetsList();

    let datasetsObject = {
        [cologne_od_name]: cologneSubDatasetsList,
        [nyc_od_name]: nycDatasetsList
    }

    return datasetsObject;
}

async function getNYCDatasetsList() {
    let datasetsArray = [];
    let responseHTML = await fetch(nycData_root_html)
        .then(res => res.text())
        .then(body => {
            return body
        });
    let $ = cheerio.load(responseHTML);
    $('.browse2-results .browse2-result').each((i, elem) => {
        if ($(elem).find('.browse2-result-type-name').text().includes("Dataset")) {
            let datasetName = $(elem).find('.browse2-result-name-link').text();
            let datasetURL = $(elem).find('a.browse2-result-name-link').attr('href');
            let datasetID = datasetURL.split('/');
            nycObjects.push({ [datasetName]: datasetURL });
            datasetsArray.push(datasetName)
        }
    });
    return datasetsArray;
}

async function getCologneSubDatasetsList(mainDatasets) {
    let datasetsArray = [];

    for (const element of mainDatasets) {
        let serviceName = element.name;
        let serviceTyp = element.type;
        let response = await fetch(cologneData_root + '/' + serviceName + '/' + serviceTyp + cologne_format_string).then(function (response) {
            return response.json();
        });
        let layers = response.layers;

        for (const iterator of layers) {
            let layerName = iterator.name;
            cologneObjects.push({ [serviceName + ":" + layerName]: iterator.id });
            datasetsArray.push(serviceName + ":" + layerName);
        }
    }
    return datasetsArray;
}

function getCologneMainDatasetsList() {
    return new Promise((resolve, reject) => {
        request(cologneData_root + cologne_format_string, function (error, response, body) {
            if (response.statusCode == 200) {
                body = JSON.parse(body);
                var services = body.services;
                var goodServices = [];
                services.forEach((element, index) => {
                    if (!(element.type == 'GPServer' || element.type == 'GeocodeServer')) {
                        goodServices.push(element);
                    }
                });
                resolve(goodServices);
            } else {
                reject(error);
            }
        });
    });
}