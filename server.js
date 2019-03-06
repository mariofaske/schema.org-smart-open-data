const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const helmet = require('helmet');

// configure port, process.env.PORT for deployment
const settings = {
    port: process.env.PORT || 3000
};

// secure server using helmet middleware
app.use(helmet());

// enable bodyParser middleware on all routes
app.use(bodyParser.json());

// defines route to the schema resource
app.use('/schema', require('./routes/schema'));

// main route
app.get('/', (req, res) => {
    res.send(`Welcome to the schema.org smart open data project`);
});

// server starts listening on settings.port
app.listen(settings.port, () => {
    console.log(`Server listening on port: ${settings.port}`);
});

// exit process upon signal interruption
process.on('SIGINT', () => {
    process.exit();
});