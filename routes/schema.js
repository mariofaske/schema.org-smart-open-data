
const express = require("express");
const schema = express.Router();
const vocabulary = require('../vocabulary/vocabulary');

schema.get('/', (req, res) => {
    vocabulary.findVocabularyByName(req.query.name, (response) => {
        res.json(response);
    });
});

module.exports = schema;