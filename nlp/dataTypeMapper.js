const nlp = require('natural');
const schema = require('../schema/schema');
const db = require('../utils/db');

exports.findMatchingType = (type, callback) => {
    db.collection('mappings').findOne({ "type": type }, (err, match) => {
        if (match) {
            // return match if type already matched in database
            callback({ 'bestMatch': match.match });
        } else {
            db.collection('schemametanames').findOne({}, (err, result)=>{
                if (result.error) {
                    callback(result.error);
                } else {
                    result = result.result;
                    let indexBestMatch = 0;
                    let bestMatch = nlp.JaroWinklerDistance(result[indexBestMatch], type);
                    result.forEach((element, i) => {
                        if (nlp.JaroWinklerDistance(element, type) > bestMatch) {
                            bestMatch = nlp.JaroWinklerDistance(element, type);
                            indexBestMatch = i;
                        };
                    });
                    // accept bestMatch only if string distance is greater or equal 0.85
                    if (bestMatch >= 0.85) {
                        db.collection('mappings').insertOne({ "type": type, "match": result[indexBestMatch] }, (err, match) => {
                            callback({ 'bestMatch': result[indexBestMatch] });
                        });
                    } else {
                        // return original type if no match is found
                        callback(type);
                    }
                }
            });
        }
    });
};