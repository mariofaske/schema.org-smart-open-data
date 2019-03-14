const express = require('express');
const portals = express.Router();
const openDataFetcher = require('../../openDataFetcher/openDataFetcher');

// GET request on all portals, optional filter on portal attributes
portals.get('/', (req, res) => {
/*     openDataFetcher.getCologneDatasetsList((result) => {
        res.status(200).json(result);
    }); */
     openDataFetcher.getDatasetsList((result) => {
        res.status(200).json(result);
    });
});

// GET request on all datasets of a specific portal
portals.get('/:portal', (req, res) => {
    //res.status(200).json({"result":"dataset list"});

    //Just for Testing!!!!
    openDataFetcher.getDataset("ODCologne", "Karnevalskarte:Toiletten_und_Urinale",(result) => {
        res.status(200).json(result);
    });
});

// GET request on a specific dataset of a portal
portals.get('/:portal/:dataset', (req, res) => {
    res.status(200).json({"result":"dataset details"});
});

module.exports = portals;