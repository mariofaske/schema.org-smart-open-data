const express = require('express');
const portals = express.Router();
const openDataFetcher = require('../../openDataFetcher/openDataFetcher');

// GET request on all portals
portals.get('/', (req, res) => {
    openDataFetcher.getDatasetsList((result) => {
        res.status(200).json(Object.keys(result));
    });
});

// GET request on all datasets of a specific portal
portals.get('/:portal', (req, res) => {
    openDataFetcher.getDatasetsList((result) => {
        res.status(200).json({ [req.params.portal]: result[req.params.portal] });
    });
});

// GET request on a specific dataset of a specific portal
portals.get('/:portal/:dataset', (req, res) => {
    openDataFetcher.getDataset(req.params.portal, req.params.dataset, (result) => {
        res.status(200).json(result);
    });
});

module.exports = portals;