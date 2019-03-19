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

exports.getSchematizedDataset = (portal, dataset) => {
    openDataFetcher.getDataset(portal, dataset, (result) => {
        let openDataDataset = result;
        traverse(openDataDataset).forEach(function () {
            if (isNaN(this.key) && this.key != undefined) {
                dataTypeMapper.findMatchingType(this.key, (matchedType) => {
                    if (matchedType.bestMatch) {
                        parentPath = this.path.slice(0, this.path.length - 1);
                        parentPath.reduce(access, openDataDataset)['@type'] = matchedType.bestMatch;
                    }
                });
            }
        });
        return openDataDataset;
    });

    function access(obj, key) { return obj[key] }

}