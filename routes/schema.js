
const express = require("express");
const schema = express.Router();
const vocabulary = require('../vocabulary/vocabulary');
const openDataFetcher = require('../openDataFetcher/openDataFetcher')

schema.get('/', (req, res) => {
    vocabulary.findVocabularyByName(req.query.name, (response) => {
        res.json(response);
    });
});

openDataFetcher.getCologneDatasetsList(function(body) {console.log(body)});

module.exports = schema;