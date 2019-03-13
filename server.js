const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const helmet = require('helmet');
const db = require('./utils/db');
const dotenv = require('dotenv').config();
const routineScheduler = require('./openDataParser/openDataParser');

// configure port, process.env.PORT for deployment
const settings = {
    port: process.env.PORT || 3000
};

// secure server using helmet middleware
app.use(helmet());

// enable bodyParser middleware on all routes
app.use(bodyParser.json());

// defines routes to resources
app.use('/portals', require('./routes/portals/portals'));
app.use('/types', require('./routes/types/types'));

// main route
app.get('/', (req, res) => {
    res.send(`Welcome to the schema.org smart open data project`);
});

// connects to database and server starts listening on settings.port
db.connect(process.env.DATABASE, function (err) {
    if (err) {
        console.log(`Unable to connect to database.`);
    } else {
        app.listen(settings.port, () => {
            console.log(`Server listening on port: ${settings.port}`);
        });
        routineScheduler.executeRoutine();
    }
});

// exit process upon signal interruption
process.on('SIGINT', () => {
    process.exit();
});