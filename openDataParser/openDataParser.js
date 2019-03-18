const dataTypeMapper = require('../nlp/dataTypeMapper');
const traverse = require('traverse');


exports.executeRoutine = () => {
    // sample use case with 'Coordinate', expected match: 'GeoCoordinates'
    let sampleJSON = {
        "type": "FeatureCollection",
        "crs": {
            "type": "name",
            "properties": {
                "name": "EPSG:4326"
            }
        },
        "features": [
            {
                "type": "Feature",
                "id": 13,
                "geometry": {
                    "type": "Point",
                    "coordinates": [
                        6.948446631610459,
                        50.93545844603362
                    ]
                },
                "properties": {
                    "OBJECTID": 13,
                    "GEBAEUDE": "Gesundheitsamt",
                    "PLZ": "50667",
                    "ADRESSE": "Neumarkt 15-21",
                    "NR_STADTBEZIRK": "1",
                    "STADTBEZIRK": "Innenstadt",
                    "TYP1": "Gebäude",
                    "TYP2": null,
                    "BETREIBER": "Stadt Köln",
                    "ANZAHL_ACCES_POINTS": null,
                    "STATUS": "aktiv"
                }
            },
            {
                "type": "Feature",
                "id": 17,
                "geometry": {
                    "type": "Point",
                    "coordinates": [
                        6.959324898065372,
                        50.93788294009714
                    ]
                },
                "properties": {
                    "OBJECTID": 17,
                    "GEBAEUDE": "Historisches Rathaus",
                    "PLZ": "50667",
                    "ADRESSE": "Rathausplatz 1",
                    "NR_STADTBEZIRK": "1",
                    "STADTBEZIRK": "Innenstadt",
                    "TYP1": "Trauzimmer",
                    "TYP2": "Rat und Ausschüsse: Sitzungs- und Besprechungsräume",
                    "BETREIBER": "Stadt Köln",
                    "ANZAHL_ACCES_POINTS": 22,
                    "STATUS": "aktiv"
                }
            }
        ]
    };

    function access(obj, key) { return obj[key] }

    traverse(sampleJSON).forEach(function () {
        if (isNaN(this.key) && this.key != undefined) {
            dataTypeMapper.findMatchingType(this.key, (matchedType) => {
                if (matchedType.bestMatch) {
                    parentPath = this.path.slice(0, this.path.length - 1);
                    parentPath.reduce(access, sampleJSON)['@type'] = matchedType.bestMatch;
                    console.log(sampleJSON['features']['0']['geometry']);
                }
            });
        }
    });

}