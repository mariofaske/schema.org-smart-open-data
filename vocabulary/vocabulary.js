const request = require('request');
const jsonPath = require('jsonpath');

const schemaOrgVocabularyUrl = 'https://schema.org/docs/tree.jsonld';

const options = {
    uri: schemaOrgVocabularyUrl,
    method: 'get',
    headers: {
        accept: 'application/json'
    }
}

exports.findVocabularyByName = (name, callback) => {
    request(options, function (err, res, body) {
        if (res.statusCode == 200){
            let result = JSON.parse(body);
            if(name) result = jsonPath.query(result, '$..[?(@.name=="'+name+'")]');
            callback(result);
        } else{
            callback({error: `${schemaOrgVocabularyUrl} not responding`});
        }
    });
}