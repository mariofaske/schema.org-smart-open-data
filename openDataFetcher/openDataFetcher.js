const request = require('request');

var cologneData_root = 'https://geoportal.stadt-koeln.de/arcgis/rest/services/';
var format_string = '?f=pjson';

exports.getCologneDatasetsList = (callback) => {

    getCologneSubDatasets().then(function(response) {
        callback(response);
      }, function(error) {
        callback(error);
      })


}

exports.getCologneDataset = (name, callback) => {
    
}

function getCologneSubDatasets() {
    return new Promise((resolve, reject)=>{
        getCologneMainDatasets().then(function(response) {
            var combinedDatasets = [];
            response.forEach(element => {
                let serviceName = element.name;
                let serviceTyp = element.type;
                request(cologneData_root + '/' + serviceName + '/' +  serviceTyp + format_string, function (error, res, body) {
                    if (res.statusCode == 200) {
                        body = JSON.parse(body);
                        let layers = body.layers;
                        var layerArray = [];
                        layers.forEach(element => {
                            let layerID = element.id;
                            let layerName = element.name;
                            let layerObject = {
                                "id": layerID,
                                "name": layerName
                            }
                            layerArray.push(layerObject);
                        });
                        let datasetObject = {
                            "name": serviceName,
                            "layer": layerArray
                        }
                        combinedDatasets.push(datasetObject);
                        if (combinedDatasets.length == response.length) {
                            resolve(combinedDatasets);
                        }

                    } else {
                        reject(error);
                    }
                });

            });

          }, function(error) {
            reject(error);
          })
    });
    
}

function getCologneMainDatasets() {
    return new Promise((resolve, reject) =>{
    request(cologneData_root+format_string, function (error, response, body) {
        if (response.statusCode == 200) {
            body = JSON.parse(body);
            var services = body.services;
            var goodServices = [];
            services.forEach((element,index) => {
                if(!(element.type == 'GPServer' || element.type == 'GeocodeServer')){
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