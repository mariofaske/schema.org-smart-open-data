const express = require('express');
const types = express.Router();
const schema = require('../../schema/schema');

// GET request on all types
types.get('/', (req, res) => {
    schema.getSchemaMeta(req.query.name, (response) => {
        res.status(200).json(response);
    });
});

// GET request on a specific type
types.get('/:type', (req, res) => {
    schema.getSchema(req.params.type, (response) => {
        res.status(200).json(response);
    })
});

module.exports = types;