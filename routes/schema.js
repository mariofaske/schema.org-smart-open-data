
const express = require("express");
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

openDataFetcher.getCologneDatasetsList(function(body) {console.log(body)});

module.exports = schema;