const request = require('request');
const jsonPath = require('jsonpath');
const cheerio = require('cheerio');
const schemaOrgUrl = 'https://schema.org';

exports.getSchemaMeta = (name, callback) => {
    const options = {
        uri: schemaOrgUrl + '/docs/tree.jsonld',
        method: 'get',
        headers: {
            accept: 'application/json'
        }
    }
    request(options, function (err, res, body) {
        if (res.statusCode == 200) {
            let result = JSON.parse(body);
            if (name) result = jsonPath.query(result, '$..[?(@.name=="' + name + '")]');
            callback(result);
        } else {
            callback({ error: `${options.uri} not responding` });
        }
    });
}

exports.getSchemaMetaNames = (callback) => {
    const options = {
        uri: schemaOrgUrl + '/docs/tree.jsonld',
        method: 'get',
        headers: {
            accept: 'application/json'
        }
    }
    request(options, function (err, res, body) {
        if (res.statusCode == 200) {
            let result = JSON.parse(body);
            result = jsonPath.query(result, '$..["name"]');
            callback({result:result});
        } else {
            callback({ error: `${options.uri} not responding` });
        }
    });
}

exports.getSchema = (name, callback) => {
    const options = {
        uri: schemaOrgUrl + '/' + name,
        method: 'get',
        headers: {
            accept: 'application/json'
        }
    }
    request(options, function (err, res, body) {
        if (res.statusCode == 200) {

            // load the requested html
            let $ = cheerio.load(body);

            let vocabulary = {};
            let vocabularyCols = [],
                vocabularyProperties = [];

            // get columns
            $('.definition-table').first().find('thead tr th').each((i, element) => {
                vocabularyCols[i] = $(element).text();
            });

            // get the 'Properties from <Vocabulary>' vocabulary 
            $('.definition-table').first().find('tbody .supertype .supertype-name a').each((i, element) => {
                vocabularyProperties[i] = $(element).text();
            });

            // get all the rows for each vocabulary
            $('.definition-table').first().find('tbody.supertype').each((i, element) => {

                // store amount of rows of current vocabulary
                let totalLength = $(element).find('[property="rdfs:label"]').length;

                let labels = [],
                    expectedTypes = [],
                    descriptions = [],
                    vocabularyRows = [];

                // get the labels
                $(element).find('[property="rdfs:label"]').each((i, element) => {
                    labels.push($(element).text());
                });

                // get the expected types
                $(element).find('.prop-ect').each((i, element) => {
                    let expectedType = $(element).text().trim().split(' or  ');
                    expectedTypes.push(expectedType);
                });

                // get the descriptions
                $(element).find('[property="rdfs:comment"]').each((i, element) => {
                    descriptions.push($(element).text());
                });

                // push all rows for each vocabulary into vocabularyRows
                for (let x = 0; x < totalLength; x++) {
                    vocabularyRows.push({
                        [[vocabularyCols[0]]]: labels[x],
                        [[vocabularyCols[1]]]: expectedTypes[x],
                        [[vocabularyCols[2]]]: descriptions[x]
                    });
                }

                // set current vocabulary
                vocabulary[vocabularyProperties[i]] = vocabularyRows;
            });
            callback(vocabulary);
        } else {
            callback({ error: `${options.uri} not responding` });
        }
    });
}