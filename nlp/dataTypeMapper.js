const nlp = require('natural');
const schema = require('../schema/schema');

exports.findMatchingType = (type, callback) => {
    schema.getSchemaMetaNames((result) => {
        if (result.error) {
            callback(result.error);
        } else {
            let indexBestMatch = 0;
            let bestMatch = nlp.JaroWinklerDistance(result[indexBestMatch], type);
            result.forEach((element, i) => {
                if (nlp.JaroWinklerDistance(element, type) > bestMatch) {
                    bestMatch = nlp.JaroWinklerDistance(element, type);
                    indexBestMatch = i;
                };
            });
            callback(result[indexBestMatch]);
        }
    });
};