const express = require('express');
const portals = express.Router();
const db = require('../../utils/db');
const openDataParser = require('../../openDataParser/openDataParser');
const moment = require('moment');

// GET request on all portals
portals.get('/', (req, res) => {
    db.collection('datasetslist').findOne({}, (err, result) => {
        if(req.query.viewMode) return res.status(200).json(result.portals);
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
    db.collection('datasets').findOne({}, (err, result) => {
        // if dataset older than 14 days fetch via openDataParser
        if (moment().diff(moment(result.lastModified), 'days') >= 14) {
            let response = openDataParser.getSchematizedDataset(req.params.portal, req.params.dataset);
            res.status(200).json({ [req.params.portal]: response[req.params.portal] });
        } else {
            res.status(200).json({ [req.params.portal]: result.portals[req.params.portal] });
        }
    });
});

module.exports = portals;