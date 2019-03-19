const dataTypeMapper = require('../nlp/dataTypeMapper');
const openDataFetcher = require('../openDataFetcher/openDataFetcher');
const db = require('../utils/db');
const traverse = require('traverse');

exports.executeRoutine = () => {
    openDataFetcher.getDatasetsList((result) => {
        db.collection('datasetslist').findOneAndReplace({ 'lastModified': { $exists: true } },
            { 'lastModified': new Date(), 'portals': result }, { upsert: true, returnNewDocument: true }, (err, result) => {
                if (err) console.log(err);
            });
    });
}

exports.getSchematizedDataset = async (portal, dataset, callback) => {
    openDataFetcher.getDataset(portal, dataset, async (result) => {
        let openDataDataset = await traverseData(result);
        db.collection(portal).insertOne({ name: dataset, lastModified: new Date(), dataset: openDataDataset }, (err, result) => {
            if (err) console.log(err);
        });
        callback(openDataDataset);
    });

}

function traverseData(openDataDataset) {
    return new Promise((resolve, reject) => {
        let counter = 0;
        let difference = 0;
        let traverseLength = traverse(openDataDataset).nodes().length;
        traverse(openDataDataset).forEach(function () {
            if (isNaN(this.key) && this.key != undefined) {
                difference = traverseLength--;
                dataTypeMapper.findMatchingType(this.key, (matchedType) => {
                    if (matchedType.bestMatch) {
                        parentPath = this.path.slice(0, this.path.length - 1);
                        parentPath.reduce(access, openDataDataset)['@type'] = matchedType.bestMatch;
                        counter++;
                    }
                    counter++
                    if (traverse(openDataDataset).nodes().length == counter + difference) {
                        resolve(openDataDataset);
                    }
                });
            }

        });
    })
}

function access(obj, key) { return obj[key] }