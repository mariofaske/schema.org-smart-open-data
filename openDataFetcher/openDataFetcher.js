const request = require('request');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

var cologneData_root = 'https://geoportal.stadt-koeln.de/arcgis/rest/services/';
var cologne_format_string = '?f=pjson';

var nycData_root_html = "https://data.cityofnewyork.us/browse?sortBy=most_accessed";
var nycData_root_api = "https://data.cityofnewyork.us/resource/";

var nycObjects = [];

exports.getDatasetsList = async (callback) => {
    let response = await getDatasets();
    callback(response);
}

exports.getDataset = async (portal, dataset, callback) => {
    //if(portal.includes("ODCologne"))
}

async function getDatasets() {

    let cologneMainDatasetsList = await getCologneMainDatasetsList();

    let cologneSubDatasetsList = await getCologneSubDatasetsList(cologneMainDatasetsList);

    let nycDatasetsList = await getNYCDatasetsList();


    let datasetsObject = {
        "Offene Daten Köln": cologneSubDatasetsList,
        "NYC OpenData": nycDatasetsList
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
    $('.browse2-results .browse2-result').each(async (i, elem) => {
        if ($(elem).find('.browse2-result-type-name').text().includes("Dataset")) {
            let datasetName = $(elem).find('.browse2-result-name-link').text();
            let datasetURL = $(elem).find('a.browse2-result-name-link').attr('href');
            let datasetID = datasetURL.split('/');
            nycObjects.push({ [datasetName]: datasetURL});
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