
const express = require("express");
const util = require('util');
const schema = express.Router();
const vocabulary = require('../vocabulary/vocabulary');
const openDataFetcher = require('../openDataFetcher/openDataFetcher')

schema.get('/', (req, res) => {
    vocabulary.getVocabularyMeta(req.query.name, (response) => {
        res.json(response);
    });
});

schema.get('/:name', (req, res) => {
    vocabulary.getVocabulary(req.params.name, (response) => {
        res.json(response);
    })
});

openDataFetcher.getCologneDatasetsList(function(body) {console.log(util.inspect(body, {showHidden: false, depth: null}))});

module.exports = schema;