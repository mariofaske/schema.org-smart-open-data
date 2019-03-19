const express = require('express');
const portals = express.Router();
const db = require('../../utils/db');
const openDataParser = require('../../openDataParser/openDataParser');
const moment = require('moment');

// GET request on all portals
portals.get('/', (req, res) => {
    db.collection('datasetslist').findOne({}, (err, result) => {
        if (req.query.viewMode) return res.status(200).json(result.portals);
        res.status(200).json(Object.keys(result.portals));
    });
});

// GET request on all datasets of a specific portal
portals.get('/:portal', (req, res) => {
    db.collection('datasetslist').findOne({}, (err, result) => {
        res.status(200).json({ [req.params.portal]: result.portals[req.params.portal] });
    });
});

// GET request on a specific dataset of a specific portal
portals.get('/:portal/:dataset', (req, res) => {
    //todo: specify query
    db.collection(req.params.portal).findOne({ name: req.params.dataset }, (err, result) => {
        // if dataset older than 14 days fetch via openDataParser
        if ((result && moment().diff(moment(result.lastModified), 'days') >= 14) || !result) {
            openDataParser.getSchematizedDataset(req.params.portal, req.params.dataset, (result) => {
                res.status(200).json({ [req.params.portal]: result });
            });
        } else {
            res.status(200).json({ [req.params.portal]: result });
        }
    });
});
module.exports = portals;