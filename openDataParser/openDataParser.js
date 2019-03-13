const dataTypeMapper = require('../nlp/dataTypeMapper');

exports.executeRoutine = () => {
    // sample use case with 'Coordinate', expected match: 'GeoCoordinates'
    dataTypeMapper.findMatchingType("Coordinate", (matchedType) => {
        console.log(matchedType);
    });
}