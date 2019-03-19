const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const helmet = require('helmet');
const db = require('./utils/db');
const dotenv = require('dotenv').config();
const routineScheduler = require('./openDataParser/openDataParser');
const schema = require('./schema/schema');
const schedule = require('node-schedule');

// configure port, process.env.PORT for deployment
const settings = {
    port: process.env.PORT || 3000
};

// secure server using helmet middleware
app.use(helmet());

// enable bodyParser middleware on all routes
app.use(bodyParser.json());

// defines routes to htmls
app.use(express.static('./public'));

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
        schema.getSchemaMetaNames((result)=>{
            db.collection('schemametanames').findOneAndReplace({},result,{upsert:true}, (err, result)=>{
                if(err) console.log(err);
            })
        });
        // execute routine at server start
        routineScheduler.executeRoutine();
        // execute routine every 24 hours at midnight
        schedule.scheduleJob('0 0 * * *', function(){
            routineScheduler.executeRoutine();
        })
    }
});

// exit process upon signal interruption
process.on('SIGINT', () => {
    process.exit();
});